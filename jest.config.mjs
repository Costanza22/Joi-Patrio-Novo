export default {
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(js|jsx|tsx)$': 'babel-jest',  // Suporte a .tsx também
  },
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    '\\.(jpg|jpeg|png|gif|webp|svg)$': '<rootDir>/__mocks__/fileMock.js',
  },
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  collectCoverage: true,
  coverageDirectory: 'coverage',
  coverageReporters: ['lcov', 'text'],
  reporters: [
    'default',
    ['jest-html-reporter', { pageTitle: 'Test Report' }],
  ],
};
