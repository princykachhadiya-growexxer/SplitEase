const express = require('express');
const router = express.Router();
const {
  addExpense,
  getGroupExpenses,
  getGroupBalances,
  deleteExpense,
} = require('../controllers/expenseController');
const { protect } = require('../middleware/auth');

router.post('/', protect, addExpense);
router.get('/group/:groupId', protect, getGroupExpenses);
router.get('/group/:groupId/balances', protect, getGroupBalances);
router.delete('/:id', protect, deleteExpense);

module.exports = router;
