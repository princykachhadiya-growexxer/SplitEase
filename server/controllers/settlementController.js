const Settlement = require('../models/Settlement');
const Group = require('../models/Group');

// @desc    Record a settlement
// @route   POST /api/settlements
// @access  Private
const createSettlement = async (req, res, next) => {
  try {
    const { fromUser, toUser, amount, groupId, note } = req.body;

    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const isMember = group.members.map(String).includes(req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });

    const settlement = await Settlement.create({ fromUser, toUser, amount, groupId, note });
    const populated = await settlement.populate([
      { path: 'fromUser', select: 'name email avatar' },
      { path: 'toUser', select: 'name email avatar' },
    ]);

    res.status(201).json({ success: true, settlement: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get group settlements
// @route   GET /api/settlements/group/:groupId
// @access  Private
const getGroupSettlements = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.groupId);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });

    const isMember = group.members.map(String).includes(req.user._id.toString());
    if (!isMember) return res.status(403).json({ success: false, message: 'Access denied' });

    const settlements = await Settlement.find({ groupId: req.params.groupId })
      .populate('fromUser', 'name email avatar')
      .populate('toUser', 'name email avatar')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, settlements });
  } catch (error) {
    next(error);
  }
};

module.exports = { createSettlement, getGroupSettlements };
