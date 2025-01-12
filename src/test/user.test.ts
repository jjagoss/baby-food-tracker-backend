// src/test/user.test.ts
import { TestDataSource } from "../config/test-database";
import { User } from "../entities/User";
import request from 'supertest';
import { app } from "../app";
import {
  initializeTestEnvironment,
  clearTestData,
  closeTestConnection,
  createTestUser
} from './helpers/testSetup';

describe('User Routes', () => {
  beforeAll(async () => {
    await initializeTestEnvironment();
  });

  afterAll(async () => {
    await closeTestConnection();
  });

  beforeEach(async () => {
    await clearTestData();
  });

  describe('POST /api/users/register', () => {
    it('should register a new user successfully', async () => {
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });

      expect(response.status).toBe(201);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe('test@example.com');
      expect(response.body.token).toBeDefined();
      
      const userRepository = TestDataSource.getRepository(User);
      const savedUser = await userRepository.findOne({ 
        where: { email: 'test@example.com' } 
      });
      expect(savedUser).toBeDefined();
    });

    it('should not register a user with duplicate email', async () => {
      await createTestUser('test@example.com', 'password123');
      
      const response = await request(app)
        .post('/api/users/register')
        .send({
          email: 'test@example.com',
          password: 'different_password'
        });

      expect(response.status).toBe(400);
      expect(response.body.message).toBe('Email already exists');
      
      const userRepository = TestDataSource.getRepository(User);
      const userCount = await userRepository.count();
      expect(userCount).toBe(1);
    });
  });

  describe('POST /api/users/login', () => {
    const testCredentials = {
      email: 'test@example.com',
      password: 'password123'
    };

    beforeEach(async () => {
      await createTestUser(testCredentials.email, testCredentials.password);
    });

    it('should login successfully with correct credentials', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send(testCredentials);

      expect(response.status).toBe(200);
      expect(response.body.user).toBeDefined();
      expect(response.body.user.email).toBe(testCredentials.email);
      expect(response.body.token).toBeDefined();
      expect(response.body.user.password).toBeUndefined(); // Password should not be returned
    });

    it('should not login with incorrect password', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testCredentials.email,
          password: 'wrongpassword'
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should not login with non-existent email', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: 'nonexistent@example.com',
          password: testCredentials.password
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should not login with missing email', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          password: testCredentials.password
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should not login with missing password', async () => {
      const response = await request(app)
        .post('/api/users/login')
        .send({
          email: testCredentials.email
        });

      expect(response.status).toBe(401);
      expect(response.body.message).toBe('Invalid credentials');
    });
  });
});