import express from 'express';
import mysql from 'mysql2';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import cors from 'cors';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const app = express();
const SECRET = 'sua_chave_secreta_muito_segura';

// Simplificando a configuração CORS
app.use(cors());  // Permite todas as origens durante desenvolvimento

app.use(express.json({limit: '10mb'}));
app.use(express.urlencoded({limit: '10mb', extended: true}));

// Servir arquivos estáticos da pasta 'uploads'
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Conexão ao banco de dados MySQL
const db = mysql.createConnection({
  host: "joipatrio.mysql.database.azure.com",  
  user: "costanza22",               
  password: "Nikita22!",                    
  database: "joipatrio"                       
});

db.connect((err) => {
  if (err) {
    console.error('Erro ao conectar ao MySQL:', err);
    return;
  }
  console.log('Conectado ao MySQL');
});

// Configuração do multer para salvar imagens em disco
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir);
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  }
});

const upload = multer({ storage });

app.post('/casaroes', (req, res) => { // Verifica se `date` está presente no corpo da requisição
  const {formData, base64}= req.body;
  const { name, description, location, cep, date } = formData; 

  const image_path = base64;

  const sql = 'INSERT INTO casaroes (name, description, location, cep, image_path, date) VALUES (?, ?, ?, ?, ?, ?)';
  db.query(sql, [name, description, location, cep, image_path, date || null], (err, results) => {
    if (err) {
      console.error('Erro ao cadastrar o casarão:', err);
      return res.status(500).json({ error: 'Erro ao cadastrar o casarão' });
    }
    res.status(201).json({ id: results.insertId, name, description, location, cep, image_path, date });
  });
});

app.get("/test", (req, res) => {
  res.json({success: true})
})


// Rota para consultar todos os casarões
app.get('/casaroes', (req, res) => {
  const sql = 'SELECT id, name, description, location, image_path, date FROM casaroes';
  db.query(sql, (err, results) => {
    if (err) {
      console.error('Erro ao consultar casarões:', err);
      return res.status(500).json({ error: 'Erro ao consultar casarões' });
    }
    res.json(results);
  });
});


// Rota para editar um casarão pelo ID, atualizando apenas os campos fornecidos
app.put('/casaroes/:id', (req, res) => {
  const { id } = req.params;
  const {formData, base64}= req.body;
  const { name, description, location, cep, date } = formData;

  const image_path = base64;

  // Cria uma consulta dinâmica com os campos que foram enviados
  let sql = 'UPDATE casaroes SET ';
  const values = [];
  
  if (name) {
    sql += 'name = ?, ';
    values.push(name);
  }
  if (description) {
    sql += 'description = ?, ';
    values.push(description);
  }
  if (location) {
    sql += 'location = ?, ';
    values.push(location);
  }
  if (cep) {
    sql += 'cep = ?, ';
    values.push(cep);
  }
  if (date) {
    sql += 'date = ?, ';
    values.push(date);
  }
  if (image_path) {
    sql += 'image_path = ?, ';
    values.push(image_path);
  }
  
  sql = sql.slice(0, -2) + ' WHERE id = ?';
  values.push(id);

  db.query(sql, values, (err, results) => {
    if (err) {
      console.error('Erro ao atualizar o casarão:', err);
      return res.status(500).json({ error: 'Erro ao atualizar o casarão' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Casarão não encontrado' });
    }

    res.status(200).json({ message: 'Casarão atualizado com sucesso' });
  });
});

// Rota para excluir um casarão pelo ID
app.delete('/casaroes/:id', (req, res) => {
  const { id } = req.params;
  const sql = 'DELETE FROM casaroes WHERE id = ?';

  db.query(sql, [id], (err, results) => {
    if (err) {
      console.error('Erro ao excluir o casarão:', err);
      return res.status(500).json({ error: 'Erro ao excluir o casarão' });
    }
    
    if (results.affectedRows === 0) {
      return res.status(404).json({ error: 'Casarão não encontrado' });
    }

    res.status(200).json({ message: 'Casarão excluído com sucesso' });
  });
});

// Rota para cadastro
app.post('/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).send({ message: 'Usuário e senha são obrigatórios!' });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
  db.query(sql, [username, hashedPassword], (err, result) => {
    if (err) return res.status(500).send({ message: 'Erro no servidor!' });
    res.status(201).send({ message: 'Usuário cadastrado com sucesso!' });
  });
});
// Rota para login
app.post('/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Usuário e senha são obrigatórios!' });
  }

  try {
    // Buscar usuário no banco de dados
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
      if (err) {
        console.error('Erro ao buscar usuário:', err);
        return res.status(500).json({ message: 'Erro no servidor!' });
      }

      if (results.length === 0) {
        return res.status(401).json({ message: 'Usuário não encontrado!' });
      }

      const user = results[0];

      // Verificar senha
      const senhaCorreta = await bcrypt.compare(password, user.password);
      if (!senhaCorreta) {
        return res.status(401).json({ message: 'Senha incorreta!' });
      }

      // Gerar token JWT
      const token = jwt.sign(
        { 
          id: user.id, 
          username: user.username,
          role: req.body.role // Incluindo a role no token
        },
        SECRET,
        { expiresIn: '24h' }
      );

      // Enviar resposta de sucesso
      res.json({
        message: 'Login realizado com sucesso!',
        token,
        user: {
          id: user.id,
          username: user.username,
          role: req.body.role
        }
      });
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro no servidor!' });
  }
});


// Inicia o servidor
app.listen(5000, () => {
  console.log('Servidor rodando');
});
