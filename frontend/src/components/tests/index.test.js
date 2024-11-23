import request from 'supertest';
import express from 'express';
import mysql from 'mysql2';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import { jest } from '@jest/globals';

const app = express();
app.use(express.json());
app.use(cors());

// Mock do MySQL
const mockDb = {
  connect: jest.fn((cb) => cb(null)),
  query: jest.fn(),
};

// Mock do multer
jest.mock('multer', () => {
  return () => ({
    single: () => (req, res, next) => next(),
  });
});

// Mock para `fs.existsSync` e `fs.mkdirSync`
jest.spyOn(fs, 'existsSync').mockImplementation(() => true);
jest.spyOn(fs, 'mkdirSync').mockImplementation(() => {});

// Configuração do app para testes
app.post('/casaroes', (req, res) => {
  const { name, description, location, cep, date } = req.body;
  const image_path = req.file ? req.file.path : null;

  const sql = 'INSERT INTO casaroes (name, description, location, cep, image_path, date) VALUES (?, ?, ?, ?, ?, ?)';
  mockDb.query(sql, [name, description, location, cep, image_path, date || null], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao cadastrar o casarão' });
    }
    res.status(201).json({ id: 1, name, description, location, cep, image_path, date });
  });
});

app.get('/casaroes', (req, res) => {
  const sql = 'SELECT id, name, description, location, image_path, date FROM casaroes';
  mockDb.query(sql, [], (err, results) => {
    if (err) {
      return res.status(500).json({ error: 'Erro ao consultar casarões' });
    }
    res.json(results || []);
  });
});

// Testes
describe('Rotas de Casarões', () => {
  test('POST /casaroes - Deve cadastrar um novo casarão', async () => {
    mockDb.query.mockImplementation((sql, values, cb) => {
      cb(null, { insertId: 1 });
    });

    const response = await request(app)
      .post('/casaroes')
      .send({
        name: 'Casarão Teste',
        description: 'Descrição de teste',
        location: 'Local de teste',
        cep: '12345-678',
        date: '2024-11-18',
      });

    expect(response.status).toBe(201);
    expect(response.body).toEqual({
      id: 1,
      name: 'Casarão Teste',
      description: 'Descrição de teste',
      location: 'Local de teste',
      cep: '12345-678',
      image_path: null,
      date: '2024-11-18',
    });
  });

  test('GET /casaroes - Deve retornar uma lista de casarões', async () => {
    mockDb.query.mockImplementation((sql, values, cb) => {
      cb(null, [
        { id: 1, name: 'Casarão Teste', description: 'Descrição', location: 'Local', image_path: null, date: '2024-11-18' },
      ]);
    });

    const response = await request(app).get('/casaroes');

    expect(response.status).toBe(200);
    expect(response.body).toEqual([
      { id: 1, name: 'Casarão Teste', description: 'Descrição', location: 'Local', image_path: null, date: '2024-11-18' },
    ]);
  });
});
