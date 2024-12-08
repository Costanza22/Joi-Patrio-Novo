export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    // Sua lógica de autenticação aqui
    const { username, password } = req.body;
    
    // Exemplo de resposta (adapte conforme sua lógica)
    return res.status(200).json({ 
      token: 'seu-token-aqui',
      success: true 
    });
  } catch (error) {
    return res.status(500).json({ 
      message: 'Internal server error',
      error: error.message 
    });
  }
} 