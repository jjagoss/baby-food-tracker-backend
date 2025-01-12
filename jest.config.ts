export default {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/*.test.ts'],
    // setupFilesAfterEnv: ['<rootDir>/src/test/setup.ts'],
  };