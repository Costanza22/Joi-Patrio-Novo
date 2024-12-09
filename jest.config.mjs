export default {
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: ["lcov", "text"],
  testEnvironment: 'node',
  transform: {},
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Test Report'
    }]
  ]
}; 