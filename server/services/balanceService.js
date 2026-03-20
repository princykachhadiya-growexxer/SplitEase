/**
 * Computes net balances for all users in a group.
 * Returns a map: { userId -> netAmount }
 * Positive = user is owed money, Negative = user owes money
 */
const computeBalances = (expenses, settlements) => {
  const balances = {};

  // Process expenses
  for (const expense of expenses) {
    const payerId = expense.paidBy._id?.toString() || expense.paidBy.toString();

    // Payer gets credit for the full amount
    if (!balances[payerId]) balances[payerId] = 0;
    balances[payerId] += expense.amount;

    // Each participant owes their share
    for (const participant of expense.participants) {
      const uid = participant.userId._id?.toString() || participant.userId.toString();
      if (!balances[uid]) balances[uid] = 0;
      balances[uid] -= participant.share;
    }
  }

  // Process settlements
  for (const settlement of settlements) {
    const fromId = settlement.fromUser._id?.toString() || settlement.fromUser.toString();
    const toId = settlement.toUser._id?.toString() || settlement.toUser.toString();

    if (!balances[fromId]) balances[fromId] = 0;
    if (!balances[toId]) balances[toId] = 0;

    // fromUser paid toUser, so fromUser's debt decreases and toUser's credit decreases
    balances[fromId] += settlement.amount;
    balances[toId] -= settlement.amount;
  }

  // Round to 2 decimal places
  for (const uid in balances) {
    balances[uid] = Math.round(balances[uid] * 100) / 100;
  }

  return balances;
};

/**
 * Simplifies debts using a greedy algorithm.
 * Returns array of { from, to, amount } transactions.
 */
const simplifyDebts = (balances) => {
  const creditors = [];
  const debtors = [];

  for (const [userId, amount] of Object.entries(balances)) {
    if (amount > 0.01) creditors.push({ userId, amount });
    else if (amount < -0.01) debtors.push({ userId, amount: -amount });
  }

  const transactions = [];

  let i = 0, j = 0;
  while (i < creditors.length && j < debtors.length) {
    const credit = creditors[i];
    const debt = debtors[j];
    const settleAmount = Math.min(credit.amount, debt.amount);

    transactions.push({
      from: debt.userId,
      to: credit.userId,
      amount: Math.round(settleAmount * 100) / 100,
    });

    credit.amount -= settleAmount;
    debt.amount -= settleAmount;

    if (credit.amount < 0.01) i++;
    if (debt.amount < 0.01) j++;
  }

  return transactions;
};

module.exports = { computeBalances, simplifyDebts };
