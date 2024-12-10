import { jest, describe, it, expect, beforeEach, afterAll } from '@jest/globals';
import request from 'supertest';
import { app } from '../index.js';
import bcrypt from 'bcryptjs';
import mysql from 'mysql2';

// Atualizar o mock do mysql2 para ser mais específico
jest.mock('mysql2', () => {
  const mockConnection = {
    connect: jest.fn((callback) => callback()),
    query: jest.fn(),
    end: jest.fn(),
    destroy: jest.fn()
  };
  return {
    createConnection: jest.fn(() => mockConnection)
  };
});

describe('API Endpoints', () => {
  let db;
  let server;

  const mockQuery = (responses) => {
    // Helper function to mock the queries
    responses.forEach((response, index) => {
      db.query.mockImplementationOnce((sql, params, callback) => {
        callback(null, response);
      });
    });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    db = mysql.createConnection();
    server = app.listen(0);
  });

  afterAll(async () => {
    if (server) {
      await new Promise(resolve => server.close(resolve));
    }
    if (db) {
      db.end();
    }
    jest.restoreAllMocks();
  });

  describe('POST /register', () => {
    it('deve registrar um novo usuário com sucesso', async () => {
      const mockUser = {
        username: 'testuser',
        password: 'password123'
      };

      mockQuery([[], { insertId: 1 }]);

      const response = await request(app)
        .post('/register')
        .send(mockUser);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('success', true);
    });
  });

  describe('POST /login', () => {
    it('deve fazer login com sucesso', async () => {
      const mockUser = {
        username: 'testuser',
        password: 'password123'
      };

      const hashedPassword = await bcrypt.hash(mockUser.password, 10);

      mockQuery([[
        { id: 1, username: mockUser.username, password: hashedPassword }
      ]]);

      const response = await request(app)
        .post('/login')
        .send(mockUser);

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });
  });

  describe('GET /casaroes', () => {
    it('deve retornar lista de casarões', async () => {
      const mockCasaroes = [
        {
          id: 1,
          name: 'Casarão Teste',
          description: 'Descrição teste',
          location: 'Local teste',
          image_path: 'caminho/imagem.jpg',
          date: '2024-03-20'
        }
      ];

      mockQuery([mockCasaroes]);

      const response = await request(app)
        .get('/casaroes');

      expect(response.status).toBe(200);
      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body).toHaveLength(1);
    });
  });

  describe('POST /casaroes', () => {
    it('deve criar um novo casarão', async () => {
      const mockCasarao = {
        formData: {
          name: 'Novo Casarão',
          description: 'Descrição do novo casarão',
          location: 'Localização teste',
          cep: '89000-000',
          date: '2024-03-20'
        },
        base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRg=='
      };

      mockQuery([{ insertId: 1 }]);

      const response = await request(app)
        .post('/casaroes')
        .send(mockCasarao);

      expect(response.status).toBe(201);
      expect(response.body).toHaveProperty('id');
    });
  });
});
