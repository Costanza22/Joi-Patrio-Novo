import { jest } from '@jest/globals';

// Silencia os logs durante os testes
console.log = jest.fn();
console.error = jest.fn();
