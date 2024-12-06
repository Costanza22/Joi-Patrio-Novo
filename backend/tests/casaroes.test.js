describe('Testes de Autenticação e Autorização', () => {
  describe('Login de Administrador', () => {
    it('deve autenticar admin com credenciais válidas', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'senha-correta'
        });

      expect(response.status).toBe(200);
      expect(response.body).toHaveProperty('token');
    });

    it('deve rejeitar credenciais inválidas', async () => {
      const response = await request(app)
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'senha-errada'
        });

      expect(response.status).toBe(401);
    });
  });

  describe('Proteção de Rotas', () => {
    it('deve bloquear POST sem autenticação', async () => {
      const response = await request(app)
        .post('/casaroes')
        .send({
          formData: {
            name: 'Teste',
            description: 'Teste',
            location: 'Teste',
            date: new Date().toISOString()
          }
        });

      expect(response.status).toBe(401);
    });

    it('deve permitir POST com token válido', async () => {
      // Primeiro fazer login
      const loginResponse = await request(app)
        .post('/auth/login')
        .send({
          username: 'admin',
          password: 'senha-correta'
        });

      const token = loginResponse.body.token;

      // Tentar criar casarão com token
      const response = await request(app)
        .post('/casaroes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          formData: {
            name: 'Teste',
            description: 'Teste',
            location: 'Teste',
            date: new Date().toISOString()
          }
        });

      expect(response.status).toBe(201);
    });
  });
}); 