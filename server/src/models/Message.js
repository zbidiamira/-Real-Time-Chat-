/**
 * Message Model
 * Represents a message in a chat conversation
 */

import mongoose from 'mongoose';

const { Schema } = mongoose;

const messageSchema = new Schema({
  sender: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Sender is required']
  },
  chat: {
    type: Schema.Types.ObjectId,
    ref: 'Chat',
    required: [true, 'Chat is required']
  },
  content: {
    type: String,
    trim: true,
    required: [true, 'Message content is required'],
    maxlength: [5000, 'Message cannot exceed 5000 characters']
  },
  type: {
    type: String,
    enum: ['text', 'image', 'file', 'system'],
    default: 'text'
  },
  readBy: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  attachments: [{
    url: {
      type: String,
      required: true
    },
    type: {
      type: String,
      enum: ['image', 'file'],
      required: true
    },
    name: {
      type: String,
      required: true
    },
    size: {
      type: Number
    }
  }]
}, {
  timestamps: true
});

// Compound index for efficient message retrieval by chat
messageSchema.index({ chat: 1, createdAt: -1 });

// Index for unread message queries
messageSchema.index({ chat: 1, readBy: 1 });

/**
 * Check if a user has read this message
 * @param {ObjectId} userId - User ID to check
 * @returns {boolean} True if user has read the message
 */
messageSchema.methods.isReadBy = function(userId) {
  return this.readBy.some(id => id.toString() === userId.toString());
};

/**
 * Mark message as read by a user
 * @param {ObjectId} userId - User ID who read the message
 */
messageSchema.methods.markAsRead = async function(userId) {
  if (!this.isReadBy(userId)) {
    this.readBy.push(userId);
    await this.save();
  }
};

/**
 * Static method to get unread count for a user in a chat
 * @param {ObjectId} chatId - Chat ID
 * @param {ObjectId} userId - User ID
 * @returns {number} Number of unread messages
 */
messageSchema.statics.getUnreadCount = async function(chatId, userId) {
  return this.countDocuments({
    chat: chatId,
    sender: { $ne: userId },
    readBy: { $ne: userId }
  });
};

const Message = mongoose.model('Message', messageSchema);

export default Message;
