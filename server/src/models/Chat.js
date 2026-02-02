/**
 * Chat Model
 * Represents a chat conversation (private or group)
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const chatSchema = new Schema({
  chatName: {
    type: String,
    trim: true,
    maxlength: [100, 'Chat name cannot exceed 100 characters']
  },
  isGroupChat: {
    type: Boolean,
    default: false
  },
  users: [{
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  latestMessage: {
    type: Schema.Types.ObjectId,
    ref: 'Message'
  },
  groupAdmin: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  groupAvatar: {
    type: String,
    default: 'default-group.png'
  }
}, {
  timestamps: true
});

// Index for efficient queries
chatSchema.index({ users: 1 });
chatSchema.index({ updatedAt: -1 });

/**
 * Check if a user is a member of this chat
 * @param {ObjectId} userId - User ID to check
 * @returns {boolean} True if user is a member
 */
chatSchema.methods.isMember = function(userId) {
  return this.users.some(user => 
    user.toString() === userId.toString() || 
    (user._id && user._id.toString() === userId.toString())
  );
};

/**
 * Check if a user is the admin of this group chat
 * @param {ObjectId} userId - User ID to check
 * @returns {boolean} True if user is the admin
 */
chatSchema.methods.isAdmin = function(userId) {
  if (!this.isGroupChat || !this.groupAdmin) return false;
  return this.groupAdmin.toString() === userId.toString() ||
    (this.groupAdmin._id && this.groupAdmin._id.toString() === userId.toString());
};

/**
 * Get chat display name for a specific user (for private chats)
 * @param {ObjectId} userId - Current user ID
 * @returns {string} Chat name or other user's name
 */
chatSchema.methods.getDisplayName = function(userId) {
  if (this.isGroupChat) {
    return this.chatName;
  }
  // For private chats, return the other user's name
  const otherUser = this.users.find(user => {
    const id = user._id ? user._id.toString() : user.toString();
    return id !== userId.toString();
  });
  return otherUser?.name || this.chatName || 'Unknown';
};

const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
