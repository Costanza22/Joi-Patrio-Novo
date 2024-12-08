import request from 'supertest';
import app from './App.js';

describe('Testes da API de Casarões', () => {
  // ... testes existentes ...

  describe('Validações de Entrada', () => {
    it('deve rejeitar casarão com nome muito curto', async () => {
      const novoCasarao = {
        formData: {
          name: 'A',  // nome muito curto
          description: 'Descrição válida',
          location: 'Localização válida',
          date: new Date().toISOString()
        }
      };

      const response = await request(app)
        .post('/casaroes')
        .send(novoCasarao);

      expect(response.status).toBe(400);
      expect(response.body).toHaveProperty('error');
    });

    it('deve rejeitar casarão com data futura', async () => {
      const dataFutura = new Date();
      dataFutura.setFullYear(dataFutura.getFullYear() + 1);

      const novoCasarao = {
        formData: {
          name: 'Casarão Teste',
          description: 'Descrição válida',
          location: 'Localização válida',
          date: dataFutura.toISOString()
        }
      };

      const response = await request(app)
        .post('/casaroes')
        .send(novoCasarao);

      expect(response.status).toBe(400);
    });
  });

  describe('Manipulação de Imagens', () => {
    it('deve rejeitar imagem com formato inválido', async () => {
      const novoCasarao = {
        formData: {
          name: 'Casarão Teste',
          description: 'Descrição válida',
          location: 'Localização válida',
          date: new Date().toISOString()
        },
        base64: 'data:image/gif;base64,R0lGODlh...' // formato GIF não suportado
      };

      const response = await request(app)
        .post('/casaroes')
        .send(novoCasarao);

      expect(response.status).toBe(400);
    });

    it('deve rejeitar imagem muito grande', async () => {
      // Criar uma string base64 grande
      const grandeBase64 = 'data:image/jpeg;base64,' + 'A'.repeat(1000000);

      const novoCasarao = {
        formData: {
          name: 'Casarão Teste',
          description: 'Descrição válida',
          location: 'Localização válida',
          date: new Date().toISOString()
        },
        base64: grandeBase64
      };

      const response = await request(app)
        .post('/casaroes')
        .send(novoCasarao);

      expect(response.status).toBe(400);
    });
  });

  describe('Paginação e Filtros', () => {
    beforeEach(async () => {
      // Inserir vários casarões para testar paginação
      const casaroes = Array.from({ length: 15 }, (_, i) => ({
        name: `Casarão ${i + 1}`,
        description: `Descrição ${i + 1}`,
        location: `Localização ${i + 1}`,
        date: new Date().toISOString()
      }));

      await db.collection('casaroes').insertMany(casaroes);
    });

    it('deve retornar resultados paginados', async () => {
      const response = await request(app)
        .get('/casaroes?page=1&limit=10');

      expect(response.status).toBe(200);
      expect(response.body.results.length).toBe(10);
      expect(response.body).toHaveProperty('total');
      expect(response.body).toHaveProperty('pages');
    });

    it('deve filtrar casarões por localização', async () => {
      const response = await request(app)
        .get('/casaroes?location=Localização 1');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].location).toBe('Localização 1');
    });

    it('deve ordenar casarões por data', async () => {
      const response = await request(app)
        .get('/casaroes?sort=date&order=desc');

      expect(response.status).toBe(200);
      const dates = response.body.map(c => new Date(c.date));
      for (let i = 1; i < dates.length; i++) {
        expect(dates[i - 1] >= dates[i]).toBe(true);
      }
    });
  });

  describe('Busca e Pesquisa', () => {
    beforeEach(async () => {
      await db.collection('casaroes').insertMany([
        {
          name: 'Casarão Histórico Central',
          description: 'Antiga residência do século XIX',
          location: 'Centro',
          date: new Date('1890-01-01').toISOString()
        },
        {
          name: 'Solar Antigo',
          description: 'Construção colonial',
          location: 'Bairro Histórico',
          date: new Date('1900-01-01').toISOString()
        }
      ]);
    });

    it('deve buscar casarões por termo de pesquisa', async () => {
      const response = await request(app)
        .get('/casaroes/search?q=colonial');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].description).toContain('colonial');
    });

    it('deve buscar casarões por período histórico', async () => {
      const response = await request(app)
        .get('/casaroes/search?startDate=1890-01-01&endDate=1895-01-01');

      expect(response.status).toBe(200);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Casarão Histórico Central');
    });
  });

  describe('Tratamento de Erros', () => {
    it('deve retornar 404 para rota inexistente', async () => {
      const response = await request(app)
        .get('/rota-inexistente');

      expect(response.status).toBe(404);
    });

    it('deve retornar 500 para erro interno do servidor', async () => {
      // Simular um erro no banco de dados
      jest.spyOn(db.collection('casaroes'), 'find').mockImplementationOnce(() => {
        throw new Error('Erro simulado do banco de dados');
      });

      const response = await request(app)
        .get('/casaroes');

      expect(response.status).toBe(500);
      expect(response.body).toHaveProperty('error');
    });
  });

  describe('Cache e Performance', () => {
    it('deve retornar cabeçalho de cache para GET /casaroes', async () => {
      const response = await request(app)
        .get('/casaroes');

      expect(response.headers).toHaveProperty('cache-control');
    });

    it('deve invalidar cache após POST', async () => {
      // Fazer primeira requisição
      await request(app).get('/casaroes');

      // Criar novo casarão
      await request(app)
        .post('/casaroes')
        .send({
          formData: {
            name: 'Novo Casarão',
            description: 'Descrição',
            location: 'Local',
            date: new Date().toISOString()
          }
        });

      // Segunda requisição deve ter dados atualizados
      const response = await request(app).get('/casaroes');
      expect(response.body.length).toBeGreaterThan(0);
    });
  });
});

afterAll(done => {
  // Feche explicitamente o servidor após os testes
  done();
});
