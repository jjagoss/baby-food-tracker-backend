// src/test/child.test.ts
import { AppDataSource as TestDataSource } from "../config/database";
import { Child } from "../entities/Child";
import request from 'supertest';
import { app } from "../app";
import {
  initializeTestEnvironment,
  clearTestData,
  closeTestConnection,
  createTestUser
} from './helpers/testSetup';

describe('Child Routes', () => {
  let authToken: string;
  let userId: string;

  beforeAll(async () => {
    await initializeTestEnvironment();
  });

  afterAll(async () => {
    await closeTestConnection();
  });

  beforeEach(async () => {
    await clearTestData();
    const { user, token } = await createTestUser('parent@example.com', 'password123');
    authToken = token;
    userId = user.id;
  });

  describe('POST /api/children', () => {
    it('should create a child successfully', async () => {
      const childData = {
        name: 'Test Child',
        dateOfBirth: '2023-01-01'
      };

      const response = await request(app)
        .post('/api/children')
        .set('Authorization', `Bearer ${authToken}`)
        .send(childData);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('name', childData.name);
      expect(response.body).toHaveProperty('dateOfBirth');
      expect(response.body).toHaveProperty('id');

      // Verify child was saved in database
      const childRepository = TestDataSource.getRepository(Child);
      const savedChild = await childRepository.findOne({
        where: { id: response.body.id },
        relations: ['user']
      });
      
      expect(savedChild).toBeDefined();
      expect(savedChild?.user.id).toBe(userId);
    });

    it('should not create a child without authentication', async () => {
      const response = await request(app)
        .post('/api/children')
        .send({
          name: 'Test Child',
          dateOfBirth: '2023-01-01'
        });

      expect(response.status).toBe(401);
    });

    it('should validate required fields', async () => {
      const response = await request(app)
        .post('/api/children')
        .set('Authorization', `Bearer ${authToken}`)
        .send({});

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('message');
    });
  });

  describe('GET /api/children', () => {
    beforeEach(async () => {
      // Create some test children
      const childRepository = TestDataSource.getRepository(Child);
      await childRepository.save([
        childRepository.create({
          name: 'Child 1',
          dateOfBirth: new Date('2023-01-01'),
          user: { id: userId }
        }),
        childRepository.create({
          name: 'Child 2',
          dateOfBirth: new Date('2023-02-01'),
          user: { id: userId }
        })
      ]);
    });

    it('should get all children for authenticated user', async () => {
      const response = await request(app)
        .get('/api/children')
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(2);
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('dateOfBirth');
    });

    it('should not get children without authentication', async () => {
      const response = await request(app)
        .get('/api/children');

      expect(response.status).toBe(401);
    });

    it('should not return other users children', async () => {
      // Create another user with children
      const { token: otherToken } = await createTestUser('other@example.com', 'password123');
      
      const response = await request(app)
        .get('/api/children')
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(0);
    });
  });

  describe('GET /api/children/:id', () => {
    let testChildId: string;

    beforeEach(async () => {
      // Create a test child
      const childRepository = TestDataSource.getRepository(Child);
      const child = await childRepository.save(
        childRepository.create({
          name: 'Test Child',
          dateOfBirth: new Date('2023-01-01'),
          user: { id: userId }
        })
      );
      testChildId = child.id;
    });

    it('should get a specific child', async () => {
      const response = await request(app)
        .get(`/api/children/${testChildId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('name', 'Test Child');
      expect(response.body).toHaveProperty('id', testChildId);
    });

    it('should not get child without authentication', async () => {
      const response = await request(app)
        .get(`/api/children/${testChildId}`);

      expect(response.status).toBe(401);
    });

    it('should not get another users child', async () => {
      // Create another user
      const { token: otherToken } = await createTestUser('other@example.com', 'password123');
      
      const response = await request(app)
        .get(`/api/children/${testChildId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(404);
    });

    it('should return 404 for non-existent child', async () => {
      const response = await request(app)
        .get(`/api/children/non-existent-id`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/children/:id', () => {
    let testChildId: string;

    beforeEach(async () => {
      // Create a test child
      const childRepository = TestDataSource.getRepository(Child);
      const child = await childRepository.save(
        childRepository.create({
          name: 'Test Child',
          dateOfBirth: new Date('2023-01-01'),
          user: { id: userId }
        })
      );
      testChildId = child.id;
    });

    it('should delete a child successfully', async () => {
      const response = await request(app)
        .delete(`/api/children/${testChildId}`)
        .set('Authorization', `Bearer ${authToken}`);

      expect(response.status).toBe(200);

      // Verify child was deleted
      const childRepository = TestDataSource.getRepository(Child);
      const deletedChild = await childRepository.findOne({
        where: { id: testChildId }
      });
      expect(deletedChild).toBeNull();
    });

    it('should not delete child without authentication', async () => {
      const response = await request(app)
        .delete(`/api/children/${testChildId}`);

      expect(response.status).toBe(401);
    });

    it('should not delete another users child', async () => {
      // Create another user
      const { token: otherToken } = await createTestUser('other@example.com', 'password123');
      
      const response = await request(app)
        .delete(`/api/children/${testChildId}`)
        .set('Authorization', `Bearer ${otherToken}`);

      expect(response.status).toBe(404);

      // Verify child still exists
      const childRepository = TestDataSource.getRepository(Child);
      const child = await childRepository.findOne({
        where: { id: testChildId }
      });
      expect(child).toBeDefined();
    });
  });
});