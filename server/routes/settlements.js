const express = require('express');
const router = express.Router();
const { createSettlement, getGroupSettlements } = require('../controllers/settlementController');
const { protect } = require('../middleware/auth');

router.post('/', protect, createSettlement);
router.get('/group/:groupId', protect, getGroupSettlements);

module.exports = router;
