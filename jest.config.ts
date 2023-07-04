module.exports = {
  preset: 'ts-jest',
  modulePathIgnorePatterns: ['dist'],
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./test/utils/db-helpers.ts'],
  roots: ['<rootDir>/src/', '<rootDir>/test/'],
  moduleNameMapper: {
    '^@test(|/.*)$': '<rootDir>/test/$1',
  },
};
