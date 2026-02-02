/**
 * @fileoverview Chat API Tests
 * @description Tests for chat creation and management
 */

import request from 'supertest';
import app from '../src/app.js';

describe('Chat API', () => {
  let user1Token, user2Token, user3Token;
  let user1Id, user2Id, user3Id;

  beforeEach(async () => {
    // Create three test users
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

    const user3Response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'User Three',
        email: 'user3@example.com',
        password: 'password123'
      });
    user3Token = user3Response.body.data.token;
    user3Id = user3Response.body.data.user._id;
  });

  describe('POST /api/chats', () => {
    it('should create a new private chat', async () => {
      const response = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ userId: user2Id })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.chat).toBeDefined();
      expect(response.body.data.chat.isGroupChat).toBe(false);
      expect(response.body.data.chat.users).toHaveLength(2);
    });

    it('should return existing chat if already exists', async () => {
      // Create first chat
      const firstResponse = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ userId: user2Id });

      const firstChatId = firstResponse.body.data.chat._id;

      // Try to create same chat again
      const secondResponse = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ userId: user2Id })
        .expect(200);

      expect(secondResponse.body.data.chat._id).toBe(firstChatId);
    });

    it('should fail without userId', async () => {
      const response = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid userId', async () => {
      const response = await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ userId: 'invalid-id' })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail without authentication', async () => {
      await request(app)
        .post('/api/chats')
        .send({ userId: user2Id })
        .expect(401);
    });
  });

  describe('GET /api/chats', () => {
    beforeEach(async () => {
      // Create a chat for testing
      await request(app)
        .post('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ userId: user2Id });
    });

    it('should get all chats for user', async () => {
      const response = await request(app)
        .get('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.chats).toBeDefined();
      expect(Array.isArray(response.body.data.chats)).toBe(true);
      expect(response.body.data.chats.length).toBeGreaterThanOrEqual(1);
    });

    it('should populate user details in chats', async () => {
      const response = await request(app)
        .get('/api/chats')
        .set('Authorization', `Bearer ${user1Token}`)
        .expect(200);

      const chat = response.body.data.chats[0];
      expect(chat.users[0].name).toBeDefined();
      expect(chat.users[0].email).toBeDefined();
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/chats')
        .expect(401);
    });
  });

  describe('POST /api/chats/group', () => {
    it('should create a group chat', async () => {
      const response = await request(app)
        .post('/api/chats/group')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Test Group',
          users: [user2Id, user3Id]
        })
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.chat.isGroupChat).toBe(true);
      expect(response.body.data.chat.chatName).toBe('Test Group');
      expect(response.body.data.chat.groupAdmin._id).toBe(user1Id);
      expect(response.body.data.chat.users).toHaveLength(3); // Creator + 2 users
    });

    it('should fail with less than 2 other users', async () => {
      const response = await request(app)
        .post('/api/chats/group')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Test Group',
          users: [user2Id] // Only 1 user
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail without group name', async () => {
      const response = await request(app)
        .post('/api/chats/group')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          users: [user2Id, user3Id]
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/chats/group/:id/rename', () => {
    let groupChatId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/chats/group')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Original Name',
          users: [user2Id, user3Id]
        });
      
      groupChatId = response.body.data.chat._id;
    });

    it('should rename group as admin', async () => {
      const response = await request(app)
        .put(`/api/chats/group/${groupChatId}/rename`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ name: 'New Name' })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.chat.chatName).toBe('New Name');
    });

    it('should fail to rename as non-admin', async () => {
      const response = await request(app)
        .put(`/api/chats/group/${groupChatId}/rename`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ name: 'New Name' })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/chats/group/:id/add', () => {
    let groupChatId;
    let user4Id;

    beforeEach(async () => {
      // Create a fourth user
      const user4Response = await request(app)
        .post('/api/auth/register')
        .send({
          name: 'User Four',
          email: 'user4@example.com',
          password: 'password123'
        });
      user4Id = user4Response.body.data.user._id;

      // Create group with 3 users
      const response = await request(app)
        .post('/api/chats/group')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Test Group',
          users: [user2Id, user3Id]
        });
      
      groupChatId = response.body.data.chat._id;
    });

    it('should add user to group as admin', async () => {
      const response = await request(app)
        .put(`/api/chats/group/${groupChatId}/add`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ userId: user4Id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.chat.users).toHaveLength(4);
    });

    it('should fail to add user as non-admin', async () => {
      const response = await request(app)
        .put(`/api/chats/group/${groupChatId}/add`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ userId: user4Id })
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/chats/group/:id/remove', () => {
    let groupChatId;

    beforeEach(async () => {
      const response = await request(app)
        .post('/api/chats/group')
        .set('Authorization', `Bearer ${user1Token}`)
        .send({
          name: 'Test Group',
          users: [user2Id, user3Id]
        });
      
      groupChatId = response.body.data.chat._id;
    });

    it('should remove user as admin', async () => {
      const response = await request(app)
        .put(`/api/chats/group/${groupChatId}/remove`)
        .set('Authorization', `Bearer ${user1Token}`)
        .send({ userId: user3Id })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.chat.users).toHaveLength(2);
    });

    it('should allow user to leave group', async () => {
      const response = await request(app)
        .put(`/api/chats/group/${groupChatId}/remove`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ userId: user2Id }) // Removing themselves
        .expect(200);

      expect(response.body.success).toBe(true);
    });

    it('should fail for non-admin removing others', async () => {
      const response = await request(app)
        .put(`/api/chats/group/${groupChatId}/remove`)
        .set('Authorization', `Bearer ${user2Token}`)
        .send({ userId: user3Id }) // Non-admin trying to remove another user
        .expect(403);

      expect(response.body.success).toBe(false);
    });
  });
});
