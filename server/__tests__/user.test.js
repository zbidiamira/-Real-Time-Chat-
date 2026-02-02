/**
 * @fileoverview User API Tests
 * @description Tests for user search and profile management
 */

import request from 'supertest';
import app from '../src/app.js';

describe('User API', () => {
  let authToken;
  let currentUserId;

  beforeEach(async () => {
    // Create and login test user
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Current User',
        email: 'current@example.com',
        password: 'password123'
      });
    
    authToken = response.body.data.token;
    currentUserId = response.body.data.user._id;

    // Create additional users for search tests
    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123'
      });

    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Jane Smith',
        email: 'jane@example.com',
        password: 'password123'
      });

    await request(app)
      .post('/api/auth/register')
      .send({
        name: 'Bob Johnson',
        email: 'bob@example.com',
        password: 'password123'
      });
  });

  describe('GET /api/users', () => {
    it('should get all users except current user', async () => {
      const response = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(Array.isArray(response.body.data)).toBe(true);
      
      // Should not include current user
      const currentUserInList = response.body.data.find(
        u => u._id === currentUserId
      );
      expect(currentUserInList).toBeUndefined();
    });

    it('should support pagination', async () => {
      const response = await request(app)
        .get('/api/users?page=1&limit=2')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeLessThanOrEqual(2);
      expect(response.body.pagination).toBeDefined();
    });

    it('should fail without authentication', async () => {
      await request(app)
        .get('/api/users')
        .expect(401);
    });
  });

  describe('GET /api/users/search', () => {
    it('should search users by name', async () => {
      const response = await request(app)
        .get('/api/users/search?q=john')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeDefined();
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
      expect(response.body.data[0].name.toLowerCase()).toContain('john');
    });

    it('should search users by email', async () => {
      const response = await request(app)
        .get('/api/users/search?q=jane@')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('should return empty array for no matches', async () => {
      const response = await request(app)
        .get('/api/users/search?q=nonexistentuser123')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toEqual([]);
    });

    it('should not include current user in search results', async () => {
      const response = await request(app)
        .get('/api/users/search?q=current')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const currentUserInResults = response.body.data.find(
        u => u._id === currentUserId
      );
      expect(currentUserInResults).toBeUndefined();
    });

    it('should be case insensitive', async () => {
      const response = await request(app)
        .get('/api/users/search?q=JOHN')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('GET /api/users/:id', () => {
    let targetUserId;

    beforeEach(async () => {
      // Get a user ID to fetch
      const usersResponse = await request(app)
        .get('/api/users')
        .set('Authorization', `Bearer ${authToken}`);
      
      targetUserId = usersResponse.body.data[0]._id;
    });

    it('should get user by ID', async () => {
      const response = await request(app)
        .get(`/api/users/${targetUserId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user._id).toBe(targetUserId);
    });

    it('should return 404 for non-existent user', async () => {
      const fakeId = '507f1f77bcf86cd799439011';
      const response = await request(app)
        .get(`/api/users/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body.success).toBe(false);
    });

    it('should return 400 for invalid user ID format', async () => {
      const response = await request(app)
        .get('/api/users/invalid-id')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  describe('PUT /api/users/profile', () => {
    it('should update user profile', async () => {
      const updateData = {
        name: 'Updated Name',
        status: 'Busy working!'
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data.user.name).toBe(updateData.name);
      expect(response.body.data.user.status).toBe(updateData.status);
    });

    it('should only update allowed fields', async () => {
      const updateData = {
        name: 'New Name',
        email: 'newemail@example.com', // Should not be updatable
        password: 'newpassword123' // Should not be updatable
      };

      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.data.user.name).toBe(updateData.name);
      expect(response.body.data.user.email).toBe('current@example.com'); // Should remain unchanged
    });

    it('should fail update without authentication', async () => {
      await request(app)
        .put('/api/users/profile')
        .send({ name: 'New Name' })
        .expect(401);
    });

    it('should validate name length', async () => {
      const response = await request(app)
        .put('/api/users/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'A' }) // Too short
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
