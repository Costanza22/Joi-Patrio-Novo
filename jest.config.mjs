export default {
  collectCoverage: true,
  coverageDirectory: "coverage",  
  coverageReporters: ["lcov", "text"], 
  testEnvironment: 'jsdom',  
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest',  
  },
  reporters: [
    'default',
    ['jest-html-reporter', {
      pageTitle: 'Test Report'
    }]
  ]
};
