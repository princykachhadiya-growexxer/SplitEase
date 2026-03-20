const Expense = require('../models/Expense');
const Group = require('../models/Group');
const { computeBalances, simplifyDebts } = require('../services/balanceService');
const Settlement = require('../models/Settlement');

// @desc    Add expense
// @route   POST /api/expenses
// @access  Private
const addExpense = async (req, res, next) => {
  try {
    const { groupId, description, amount, paidBy, participantIds, category } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const isMember = group.members.map(String).includes(req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });

    const ids = participantIds && participantIds.length > 0 ? participantIds : group.members.map(String);
    const share = Math.round((amount / ids.length) * 100) / 100;

    const participants = ids.map((uid) => ({ userId: uid, share }));

    const expense = await Expense.create({
      groupId,
      description,
      amount,
      paidBy,
      participants,
      category: category || 'other',
    });

    const populated = await expense.populate([
      { path: 'paidBy', select: 'name email avatar' },
      { path: 'participants.userId', select: 'name email avatar' },
    ]);

    res.status(201).json({ success: true, expense: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get group expenses
// @route   GET /api/expenses/group/:groupId
// @access  Private
const getGroupExpenses = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const isMember = group.members.map(String).includes(req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });

    const expenses = await Expense.find({ groupId: req.params.groupId })
      .populate('paidBy', 'name email avatar')
      .populate('participants.userId', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, expenses });
  } catch (error) {
    next(error);
  }
};

// @desc    Get group balances
// @route   GET /api/expenses/group/:groupId/balances
// @access  Private
const getGroupBalances = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId).populate('members', 'name email avatar');
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const isMember = group.members.map((m) => m._id.toString()).includes(req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });

    const expenses = await Expense.find({ groupId: req.params.groupId })
      .populate('paidBy', 'name email avatar')
      .populate('participants.userId', 'name email avatar');

    const settlements = await Settlement.find({ groupId: req.params.groupId });

    const balances = computeBalances(expenses, settlements);
    const suggestedSettlements = simplifyDebts(balances);

    // Build member balance objects
    const memberBalances = group.members.map((member) => ({
      user: member,
      balance: balances[member._id.toString()] || 0,
    }));

    // Enrich suggested settlements with user info
    const memberMap = {};
    group.members.forEach((m) => { memberMap[m._id.toString()] = m; });

    const enrichedSettlements = suggestedSettlements.map((s) => ({
      from: memberMap[s.from],
      to: memberMap[s.to],
      amount: s.amount,
    }));

    res.status(200).json({
      success: true,
      memberBalances,
      suggestedSettlements: enrichedSettlements,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete expense
// @route   DELETE /api/expenses/:id
// @access  Private
const deleteExpense = async (req, res, next) => {
  try {
    const expense = await Expense.findById(req.params.id);
    if (!expense) return res.status(404).json({ success: false, message: 'Expense not found' });

    const group = await Group.findById(expense.groupId);
    const isMember = group.members.map(String).includes(req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });

    await expense.deleteOne();
    res.status(200).json({ success: true, message: 'Expense deleted' });
  } catch (error) {
    next(error);
  }
};

module.exports = { addExpense, getGroupExpenses, getGroupBalances, deleteExpense };
