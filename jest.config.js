module.exports = {
  coveragePathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/test-utils/'],
  setupFilesAfterEnv: ['<rootDir>/scripts/setupTests.js'],
  testEnvironment: 'jsdom-global',
  testPathIgnorePatterns: ['/utils/'],
  testRegex: 'src/.*(/__tests__/[^.]+.(?!integration)|\\.(test|spec))\\.jsx?$',
  transform: {
    '\\.jsx?$': 'babel-jest',
  },
}
