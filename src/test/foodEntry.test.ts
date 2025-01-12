import { TestDataSource } from "../config/test-database";
import { FoodEntry } from "../entities/FoodEntry";
import { Child } from "../entities/Child";
import request from 'supertest';
import { app } from "../app";
import {
    initializeTestEnvironment,
    clearTestData,
    createTestUser,
    createTestChild,
    closeTestConnection
} from './helpers/testSetup';

describe('Food Entry Routes', () => {
    let authToken: string;
    let userId: string;
    let childId: string;

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

        const child = await createTestChild(userId, 'Test Child');
        childId = child.id;
    });

    describe('POST /api/food-entries', () => {
        it('should create a food entry successfully', async () => {
            const foodEntryData = {
                childId,
                foodId: 1,
                triedDate: '2024-01-01',
                notes: 'Really enjoyed the banana!'
            };

            const response = await request(app)
                .post('/api/food-entries')
                .set('Authorization', `Bearer ${authToken}`)
                .send(foodEntryData);

            expect(response.status).toBe(201);
            expect(response.body).toHaveProperty('foodId', foodEntryData.foodId);
            expect(response.body).toHaveProperty('notes', foodEntryData.notes);
            expect(response.body).toHaveProperty('id');

            const foodEntryRepository = TestDataSource.getRepository(FoodEntry);
            const savedEntry = await foodEntryRepository.findOne({
                where: { id: response.body.id },
                relations: ['child']
            });

            expect(savedEntry).toBeDefined();
            expect(savedEntry?.child.id).toBe(childId);
        });

        it('should not create a food entry without authentication', async() => {
            const response = await request(app)
                .post('/api/food-entries')
                .send({
                    childId,
                    foodId: 1,
                    triedDate: '2024-01-01'
                });
            
            expect(response.status).toBe(401);
        });

        it('should validate required fields', async () => {
            const response = await request(app)
                .post('/api/food-entries')
                .set('Authorization', `Bearer ${authToken}`)
                .send({});
            
            expect(response.status).toBe(400);
            expect(response.body).toHaveProperty('message');
        });

        it('should not create a food entry for another user\'s child', async () => {
            const { token: otherToken} = await createTestUser('other@example.com', 'password123');

            const response = await request(app)
                .post('/api/food-entries')
                .set('Authorization', `Bearer ${otherToken}`)
                .send({
                    childId,
                    foodId: 1,
                    triedDate: '2024-01-01'
                });
            
            expect(response.status).toBe(404);
        });
    });

    describe('GET /api/food-entries/child/:childId', () => {
        beforeEach(async() => {
            const foodEntryRepository = TestDataSource.getRepository(FoodEntry);
            await foodEntryRepository.save([
                foodEntryRepository.create({
                    foodId: 1,
                    triedDate: new Date('2024-01-01'),
                    notes: 'First try',
                    child: { id: childId }
                }),
                foodEntryRepository.create({
                    foodId: 2,
                    triedDate: new Date('2024-01-02'),
                    notes: 'Second try',
                    child: { id: childId }
                })
            ]);
        });

        it('should get all food entries for a child', async () => {
            const response = await request(app)
                .get(`/api/food-entries/child/${childId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);
            expect(response.body).toHaveLength(2);
            expect(response.body[0]).toHaveProperty('foodId');
            expect(response.body[0]).toHaveProperty('notes');
        });

        it('should not get food entries without authenticatoin', async () => {
            const response = await request(app)
                .get(`/api/food-entries/child/${childId}`);

            expect(response.status).toBe(401);
        });

        it('should not get food entries for another user\'s child', async() => {
            const { token: otherToken } = await createTestUser('other@example.com', 'password123');

            const response = await(request(app)
            .get(`/api/food-entries/child${childId}`))
            .set('Authorization', `Bearer ${otherToken}`);
        
        expect(response.status).toBe(404);
        });
    });

    describe('PATCH /api/food-entries/:id', () => {
        let foodEntryId: string;

        beforeEach(async () => {
            const foodEntryRepository = TestDataSource.getRepository(FoodEntry);
            const foodEntry = await foodEntryRepository.save(
                foodEntryRepository.create({
                    foodId: 1,
                    triedDate: new Date('2024-01-01'),
                    notes: 'Initial notes',
                    child: { id: childId }
                })
            );
            foodEntryId = foodEntry.id;
        });

        it('should update food entry notes successfully', async() => {
            const updatedNotes = 'Updated food notes';
            const response = await request(app)
                .patch(`/api/food-entries/${foodEntryId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({ notes: updatedNotes });
            
            expect(response.status).toBe(200);
            expect(response.body).toHaveProperty('notes', updatedNotes);

            const foodEntryRepository = TestDataSource.getRepository(FoodEntry);
            const updatedEntry = await foodEntryRepository.findOne({
                where: { id: foodEntryId }
            });
            expect(updatedEntry?.notes).toBe(updatedNotes);
        });

        it('should not update food entry without authentication', async () => {
            const response = await request(app)
                .patch(`/api/food-entries/${foodEntryId}`)
                .send({ notes: 'Updated notes' });
            
            expect(response.status).toBe(401);
        });

        it('should not update another user\'s food entry', async () => {
            const { token: otherToken } = await createTestUser('other@example.com', 'password123');

            const response = await request(app)
                .patch(`/api/food-entries/${foodEntryId}`)
                .set('Authorization', `Bearer ${otherToken}`)
                .send({ notes: 'Unauthorized update' });

            expect (response.status).toBe(403);
        });
    });

    describe('DELETE /api/food-entries/:id', () => {
        let foodEntryId: string;

        beforeEach(async () => {
            const foodEntryRepository = TestDataSource.getRepository(FoodEntry);
            const foodEntry = await foodEntryRepository.save(
                foodEntryRepository.create({
                    foodId: 1,
                    triedDate: new Date('2024-01-01'),
                    notes: 'To be deleted',
                    child: { id: childId }
                })
            );
            foodEntryId = foodEntry.id;
        });

        it('should delete a food entry successfully', async () => {
            const response = await request(app)
                .delete(`/api/food-entries/${foodEntryId}`)
                .set('Authorization', `Bearer ${authToken}`);
            
            expect(response.status).toBe(200);

            const foodEntryRepository = TestDataSource.getRepository(FoodEntry);
            const deletedEntry = await foodEntryRepository.findOne({
                where: { id: foodEntryId }
            });
            expect(deletedEntry).toBeNull();
        });

        it('should not delete food entry without authentication', async () => {
            const response = await request(app)
                .delete(`/api/food-entries/${foodEntryId}`);

            expect(response.status).toBe(401);
        });

        it('should not delete another user\'s food entry', async () => {
            const { token: otherToken } = await createTestUser('other@example.com', 'password123');

            const response = await request(app)
                .delete(`/api/food-entries/${foodEntryId}`)
                .set('Authorization', `Bearer ${otherToken}`);

            expect(response.status).toBe(403);

            const foodEntryRepository = TestDataSource.getRepository(FoodEntry);
            const entry = await foodEntryRepository.findOne({
                where: { id : foodEntryId }
            });
            expect(entry).toBeDefined();
        });
    });
});