/**
 * Chat Controller
 * Handles chat creation, retrieval, and management
 */

import Chat from '../models/Chat.js';
import User from '../models/User.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { sendSuccess } from '../utils/responseHandler.js';
import AppError from '../utils/AppError.js';

/**
 * @desc    Access or create a private chat between two users
 * @route   POST /api/chats
 * @access  Private
 */
export const accessChat = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    throw AppError.badRequest('UserId is required to create a chat');
  }

  // Validate userId is a valid ObjectId
  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw AppError.badRequest('Invalid user ID format');
  }

  // Check if user exists
  const otherUser = await User.findById(userId);
  if (!otherUser) {
    throw AppError.notFound('User not found');
  }

  // Cannot create chat with yourself
  if (userId === req.user._id.toString()) {
    throw AppError.badRequest('Cannot create a chat with yourself');
  }

  // Check if private chat already exists between these users
  let chat = await Chat.findOne({
    isGroupChat: false,
    $and: [
      { users: { $elemMatch: { $eq: req.user._id } } },
      { users: { $elemMatch: { $eq: userId } } }
    ]
  })
    .populate('users', 'name email avatar status isOnline lastSeen')
    .populate('latestMessage');

  // If chat exists, populate the sender of latestMessage
  if (chat && chat.latestMessage) {
    chat = await User.populate(chat, {
      path: 'latestMessage.sender',
      select: 'name email avatar'
    });
  }

  if (chat) {
    return sendSuccess(res, 200, 'Chat retrieved successfully', { chat });
  }

  // Create new private chat
  const newChat = await Chat.create({
    chatName: 'Private Chat',
    isGroupChat: false,
    users: [req.user._id, userId]
  });

  const fullChat = await Chat.findById(newChat._id)
    .populate('users', 'name email avatar status isOnline lastSeen');

  sendSuccess(res, 201, 'Chat created successfully', { chat: fullChat });
});

/**
 * @desc    Get all chats for the current user
 * @route   GET /api/chats
 * @access  Private
 */
export const getChats = asyncHandler(async (req, res) => {
  let chats = await Chat.find({
    users: { $elemMatch: { $eq: req.user._id } }
  })
    .populate('users', 'name email avatar status isOnline lastSeen')
    .populate('groupAdmin', 'name email avatar')
    .populate('latestMessage')
    .sort({ updatedAt: -1 });

  // Populate sender of latestMessage
  chats = await User.populate(chats, {
    path: 'latestMessage.sender',
    select: 'name email avatar'
  });

  sendSuccess(res, 200, 'Chats retrieved successfully', { chats });
});

/**
 * @desc    Create a new group chat
 * @route   POST /api/chats/group
 * @access  Private
 */
export const createGroupChat = asyncHandler(async (req, res) => {
  const { name, users } = req.body;

  if (!name || !name.trim()) {
    throw AppError.badRequest('Group name is required');
  }

  if (!users || !Array.isArray(users)) {
    throw AppError.badRequest('Users array is required');
  }

  // Need at least 2 other users for a group
  if (users.length < 2) {
    throw AppError.badRequest('A group chat requires at least 2 other users');
  }

  // Validate all user IDs
  for (const userId of users) {
    if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
      throw AppError.badRequest(`Invalid user ID format: ${userId}`);
    }
  }

  // Check all users exist
  const validUsers = await User.find({ _id: { $in: users } });
  if (validUsers.length !== users.length) {
    throw AppError.badRequest('One or more users not found');
  }

  // Check for duplicates
  const uniqueUsers = [...new Set(users)];
  if (uniqueUsers.length !== users.length) {
    throw AppError.badRequest('Duplicate users are not allowed');
  }

  // Cannot include yourself in the users array (will be added automatically)
  if (users.includes(req.user._id.toString())) {
    throw AppError.badRequest('Do not include yourself in the users array');
  }

  // Add current user to the group
  const allUsers = [req.user._id, ...users];

  const groupChat = await Chat.create({
    chatName: name.trim(),
    isGroupChat: true,
    users: allUsers,
    groupAdmin: req.user._id
  });

  const fullGroupChat = await Chat.findById(groupChat._id)
    .populate('users', 'name email avatar status isOnline lastSeen')
    .populate('groupAdmin', 'name email avatar');

  sendSuccess(res, 201, 'Group chat created successfully', { chat: fullGroupChat });
});

/**
 * @desc    Rename a group chat
 * @route   PUT /api/chats/group/:id/rename
 * @access  Private (Admin only)
 */
export const renameGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    throw AppError.badRequest('New group name is required');
  }

  const chat = await Chat.findById(id);

  if (!chat) {
    throw AppError.notFound('Chat not found');
  }

  if (!chat.isGroupChat) {
    throw AppError.badRequest('This is not a group chat');
  }

  // Only admin can rename
  if (!chat.isAdmin(req.user._id)) {
    throw AppError.forbidden('Only group admin can rename the group');
  }

  chat.chatName = name.trim();
  await chat.save();

  const updatedChat = await Chat.findById(id)
    .populate('users', 'name email avatar status isOnline lastSeen')
    .populate('groupAdmin', 'name email avatar');

  sendSuccess(res, 200, 'Group renamed successfully', { chat: updatedChat });
});

/**
 * @desc    Add a user to a group chat
 * @route   PUT /api/chats/group/:id/add
 * @access  Private (Admin only)
 */
export const addToGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw AppError.badRequest('User ID is required');
  }

  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw AppError.badRequest('Invalid user ID format');
  }

  const chat = await Chat.findById(id);

  if (!chat) {
    throw AppError.notFound('Chat not found');
  }

  if (!chat.isGroupChat) {
    throw AppError.badRequest('This is not a group chat');
  }

  // Only admin can add users
  if (!chat.isAdmin(req.user._id)) {
    throw AppError.forbidden('Only group admin can add users');
  }

  // Check if user exists
  const userToAdd = await User.findById(userId);
  if (!userToAdd) {
    throw AppError.notFound('User to add not found');
  }

  // Check if user is already in the group
  if (chat.isMember(userId)) {
    throw AppError.badRequest('User is already in the group');
  }

  chat.users.push(userId);
  await chat.save();

  const updatedChat = await Chat.findById(id)
    .populate('users', 'name email avatar status isOnline lastSeen')
    .populate('groupAdmin', 'name email avatar');

  sendSuccess(res, 200, 'User added to group successfully', { chat: updatedChat });
});

/**
 * @desc    Remove a user from a group chat (or leave group)
 * @route   PUT /api/chats/group/:id/remove
 * @access  Private (Admin can remove anyone, users can remove themselves)
 */
export const removeFromGroup = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { userId } = req.body;

  if (!userId) {
    throw AppError.badRequest('User ID is required');
  }

  if (!userId.match(/^[0-9a-fA-F]{24}$/)) {
    throw AppError.badRequest('Invalid user ID format');
  }

  const chat = await Chat.findById(id);

  if (!chat) {
    throw AppError.notFound('Chat not found');
  }

  if (!chat.isGroupChat) {
    throw AppError.badRequest('This is not a group chat');
  }

  // Check if the user to remove is in the group
  if (!chat.isMember(userId)) {
    throw AppError.badRequest('User is not in the group');
  }

  const isRemovingSelf = userId === req.user._id.toString();
  const isAdmin = chat.isAdmin(req.user._id);

  // Only admin can remove others, or user can remove themselves
  if (!isRemovingSelf && !isAdmin) {
    throw AppError.forbidden('Only group admin can remove other users');
  }

  // If admin is leaving, assign new admin or delete group
  if (isRemovingSelf && isAdmin) {
    const remainingUsers = chat.users.filter(u => 
      u.toString() !== userId
    );

    if (remainingUsers.length === 0) {
      // Delete the group if no users left
      await Chat.findByIdAndDelete(id);
      return sendSuccess(res, 200, 'Group deleted as the last member left', { deleted: true });
    }

    // Assign new admin to the first remaining user
    chat.groupAdmin = remainingUsers[0];
  }

  // Remove user from the group
  chat.users = chat.users.filter(u => u.toString() !== userId);

  // If less than 2 users remain, delete the group
  if (chat.users.length < 2) {
    await Chat.findByIdAndDelete(id);
    return sendSuccess(res, 200, 'Group deleted as it has less than 2 members', { deleted: true });
  }

  await chat.save();

  const updatedChat = await Chat.findById(id)
    .populate('users', 'name email avatar status isOnline lastSeen')
    .populate('groupAdmin', 'name email avatar');

  const message = isRemovingSelf ? 'You left the group' : 'User removed from group successfully';
  sendSuccess(res, 200, message, { chat: updatedChat });
});

/**
 * @desc    Get a single chat by ID
 * @route   GET /api/chats/:id
 * @access  Private (Members only)
 */
export const getChatById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  let chat = await Chat.findById(id)
    .populate('users', 'name email avatar status isOnline lastSeen')
    .populate('groupAdmin', 'name email avatar')
    .populate('latestMessage');

  if (!chat) {
    throw AppError.notFound('Chat not found');
  }

  // Check if user is a member
  if (!chat.isMember(req.user._id)) {
    throw AppError.forbidden('You are not a member of this chat');
  }

  // Populate sender of latestMessage
  if (chat.latestMessage) {
    chat = await User.populate(chat, {
      path: 'latestMessage.sender',
      select: 'name email avatar'
    });
  }

  sendSuccess(res, 200, 'Chat retrieved successfully', { chat });
});
