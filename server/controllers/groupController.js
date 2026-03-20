const Group = require('../models/Group');
const Expense = require('../models/Expense');
const Settlement = require('../models/Settlement');

// @desc    Create group
// @route   POST /api/groups
// @access  Private
const createGroup = async (req, res, next) => {
  try {
    const { name, description, memberIds } = req.body;

    const members = [req.user._id, ...(memberIds || [])];
    const uniqueMembers = [...new Set(members.map(String))];

    const group = await Group.create({
      name,
      description,
      createdBy: req.user._id,
      members: uniqueMembers,
    });

    const populated = await group.populate('members', 'name email avatar');
    res.status(201).json({ success: true, group: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's groups
// @route   GET /api/groups
// @access  Private
const getGroups = async (req, res, next) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate('members', 'name email avatar')
      .populate('createdBy', 'name email')
      .sort({ updatedAt: -1 });

    res.status(200).json({ success: true, groups });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single group
// @route   GET /api/groups/:id
// @access  Private
const getGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id)
      .populate('members', 'name email avatar')
      .populate('createdBy', 'name email');

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const isMember = group.members.some((m) => m._id.toString() === req.user._id.toString());
    if (!isMember) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.status(200).json({ success: true, group });
  } catch (error) {
    next(error);
  }
};

// @desc    Add member to group
// @route   POST /api/groups/:id/members
// @access  Private
const addMember = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const group = await Group.findById(req.params.id);

    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only group creator can add members' });
    }
    if (group.members.map(String).includes(userId)) {
      return res.status(400).json({ success: false, message: 'User already in group' });
    }

    group.members.push(userId);
    await group.save();
    const populated = await group.populate('members', 'name email avatar');
    res.status(200).json({ success: true, group: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Remove member from group
// @route   DELETE /api/groups/:id/members/:userId
// @access  Private
const removeMember = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only group creator can remove members' });
    }
    if (req.params.userId === group.createdBy.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot remove group creator' });
    }

    group.members = group.members.filter((m) => m.toString() !== req.params.userId);
    await group.save();
    const populated = await group.populate('members', 'name email avatar');
    res.status(200).json({ success: true, group: populated });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete group
// @route   DELETE /api/groups/:id
// @access  Private
const deleteGroup = async (req, res, next) => {
  try {
    const group = await Group.findById(req.params.id);
    if (!group) return res.status(404).json({ success: false, message: 'Group not found' });
    if (group.createdBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Only group creator can delete the group' });
    }

    await Expense.deleteMany({ groupId: req.params.id });
    await Settlement.deleteMany({ groupId: req.params.id });
    await group.deleteOne();

    res.status(200).json({ success: true, message: 'Group deleted successfully' });
  } catch (error) {
    next(error);
  }
};

module.exports = { createGroup, getGroups, getGroup, addMember, removeMember, deleteGroup };
