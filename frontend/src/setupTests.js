// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock do window.alert
window.alert = jest.fn();

// Mock do localStorage
const localStorageMock = {
  store: {},
  getItem: jest.fn((key) => this.store[key]),
  setItem: jest.fn((key, value) => this.store[key] = value),
  clear: jest.fn(() => this.store = {}),
  removeItem: jest.fn((key) => delete this.store[key]),
  length: 0,
  key: jest.fn()
};

beforeAll(() => {
  Object.defineProperty(window, 'localStorage', {
    value: localStorageMock
  });
});

beforeEach(() => {
  localStorageMock.store = {};
  localStorageMock.getItem.mockClear();
  localStorageMock.setItem.mockClear();
  localStorageMock.clear.mockClear();
  localStorageMock.removeItem.mockClear();
});
