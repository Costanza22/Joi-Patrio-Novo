// Aumentar o timeout dos testes
jest.setTimeout(30000);

// Silenciar logs durante os testes
console.log = jest.fn();
console.error = jest.fn(); 