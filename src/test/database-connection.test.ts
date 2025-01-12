import { TestDataSource } from "../config/test-database";
import { User } from "../entities/User";
import { 
  initializeTestEnvironment, 
  clearTestData, 
  closeTestConnection,
  createTestUser
} from './helpers/testSetup';

describe('Database Connection', () => {
  beforeAll(async () => {
    await initializeTestEnvironment();
  });

  afterAll(async () => {
    await closeTestConnection();
  });

  beforeEach(async () => {
    await clearTestData();
  });

  it('should connect to the test database', async () => {
    expect(TestDataSource.isInitialized).toBe(true);
  });

  it('should be able to create a user in the database', async () => {
    const { user } = await createTestUser();
    
    const userRepository = TestDataSource.getRepository(User);
    const savedUser = await userRepository.findOne({ 
      where: { email: 'test@example.com' } 
    });

    expect(savedUser).toBeDefined();
    expect(savedUser?.email).toBe('test@example.com');
  });

  it('should confirm tables exist using raw query', async () => {
    const result = await TestDataSource.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE';
    `);
    
    console.log('Tables in database:', result.map((r: any) => r.table_name));
    expect(result.length).toBeGreaterThan(0);
  });
});