/**
 * @fileoverview Message API Tests
 * @description Tests for message sending and retrieval
 */

import request from 'supertest';
import app from '../src/app.js';

describe('Message API', () => {
  let user1Token, user2Token;
  let user1Id, user2Id;
  let chatId;

  beforeEach(async () => {
    // Create two test users
    const user1Response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User One',
        email: 'user1@example.com',
        password: 'password123'
      });
    user1Token = user1Response.body.data.token;
    user1Id = user1Response.body.data.user._id;

    const user2Response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Two',
        email: 'user2@example.com',
        password: 'password123'
      });
    user2Token = user2Response.body.data.token;
    user2Id = user2Response.body.data.user._id;

    // Create a chat between them
    const chatResponse = await request(app)
      .post('/api/chats')
      .set('Authorization', `Bearer ${user1Token}`)
      .send({ userId: user2Id });
    
    chatId = chatResponse.body.data.chat._id;
  });

  describe('POST /api/messages', () => {
    it('should send a text message', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          chatId: chatId,
          content: 'Hello, World!'
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBeDefined();
      expect(response.body.data.message.content).toBe('Hello, World!');
      expect(response.body.data.message.sender._id).toBe(user1Id);
      expect(response.body.data.message.chat).toBeDefined();
    });

    it('should fail without content', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          chatId: chatId
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail without chatId', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          content: 'Hello'
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid chatId', async () => {
      const response = await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          chatId: '507f1f77bcf86cd799439011', // Non-existent chat
          content: 'Hello'
        })
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .post('/api/messages')
        .send({
          chatId: chatId,
          content: 'Hello'
        })
        .expect(401);
    });

    it('should update chat latestMessage', async () => {
      // Send a message
      await request(app)
        .post('/api/messages')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          chatId: chatId,
          content: 'Latest message'
        });

      // Get chats and check latestMessage
      const chatsResponse = await request(app)
        .get('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`);

      const chat = chatsResponse.body.data.chats.find(c => c._id === chatId);
      expect(chat.latestMessage).toBeDefined();
      expect(chat.latestMessage.content).toBe('Latest message');
    });
  });

  describe('GET /api/messages/:chatId', () => {
    beforeEach(async () => {
      // Send multiple messages
      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post('/api/messages')
          .set('Authorization', `Bearer ${user1Token}`)
          .send({
            chatId: chatId,
            content: `Message ${i}`
          });
      }
    });

    it('should get messages for a chat', async () => {
      const response = await request(app)
        .get(`/api/messages/${chatId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBe(5);
    });

    it('should return messages in chronological order', async () => {
      const response = await request(app)
        .get(`/api/messages/${chatId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const messages = response.body.data;
      expect(messages[0].content).toBe('Message 1');
      expect(messages[4].content).toBe('Message 5');
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get(`/api/messages/${chatId}?page=1&limit=2`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination).toBeDefined();
    });

    it('should populate sender details', async () => {
      const response = await request(app)
        .get(`/api/messages/${chatId}`)
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.data[0].sender).toBeDefined();
      expect(response.body.data[0].sender.name).toBe('User One');
    });

    it('should fail for non-member of chat', async () => {
      // Create a third user
      const user3Response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User Three',
          email: 'user3@example.com',
          password: 'password123'
        });
      const user3Token = user3Response.body.data.token;

      // Try to access chat messages
      const response = await request(app)
        .get(`/api/messages/${chatId}`)
        .set('Authorization', `Bearer ${user3Token}`)
        .expect(403);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid chatId', async () => {
      const response = await request(app)
        .get('/api/messages/invalid-id')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get(`/api/messages/${chatId}`)
        .expect(401);
    });
  });
});
