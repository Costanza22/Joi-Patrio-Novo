import React, { useState } from 'react';
import { FaEye, FaEyeSlash } from 'react-icons/fa';
import axios from 'axios';

const commonStyles = {
  colorBrown: '#8B4513',
  borderRadius: '5px',
  fullWidth: {
    width: '100%',
  },
};

const styles = {
  container: {
    display: 'flex',
    height: '100vh',
    fontFamily: 'Georgia, serif',
  },
  imageContainer: {
    flex: 1,
    backgroundImage: 'url("https://omunicipiojoinville.com/wp-content/uploads/2023/03/palacete-doria-joinville.jpg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    borderRight: '2px solid #8B4513', 
    justifyContent: 'center',
    alignItems: 'center',
  },
  formContainer: {
    flex: 1,
    backgroundColor: '#FFF8DC',
    padding: '40px',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: '28px',
    color: commonStyles.colorBrown,
    fontWeight: 'bold',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '16px',
    color: commonStyles.colorBrown,
    marginBottom: '20px',
  },
  input: {
    padding: '10px',
    marginBottom: '15px',
    ...commonStyles.fullWidth,
    borderRadius: commonStyles.borderRadius,
    border: `1px solid ${commonStyles.colorBrown}`,
    color: commonStyles.colorBrown,
    boxSizing: 'border-box',
  },
  passwordContainer: {
    position: 'relative',
    ...commonStyles.fullWidth,
    marginBottom: '10px',
  },
  eyeIcon: {
    position: 'absolute',
    right: '10px',
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: commonStyles.colorBrown,
  },
  button: {
    padding: '12px',
    backgroundColor: commonStyles.colorBrown,
    color: '#fff',
    border: 'none',
    borderRadius: commonStyles.borderRadius,
    cursor: 'pointer',
    ...commonStyles.fullWidth,
    marginTop: '15px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#A0522D', 
  },
  switchText: {
    marginTop: '15px',
    fontSize: '14px',
    color: commonStyles.colorBrown,
  },
  linkButton: {
    padding: '12px 20px',
    backgroundColor: 'burlywood',
    color: '#fff',
    border: 'none',
    borderRadius: commonStyles.borderRadius,
    cursor: 'pointer',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
    textAlign: 'center',
    textDecoration: 'none',
  },
  linkButtonHover: {
    backgroundColor: '#D2B48C', 
  },
  registerButton: {
    padding: '12px',
    backgroundColor: '#D2B48C',
    color: '#fff',
    border: 'none',
    borderRadius: commonStyles.borderRadius,
    cursor: 'pointer',
    ...commonStyles.fullWidth,
    marginTop: '15px',
    fontWeight: 'bold',
    transition: 'background-color 0.3s ease',
  },
  registerButtonHover: {
    backgroundColor: '#D2B48C', 
  },
};

function LoginPage({ onLogin, showCasaroes }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleLogin = async () => {
    if (!username || !password) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
  
    try {
      const response = await axios.post('https://back-production-8285.up.railway.app/login', {
        username,
        password,
      });
  
      if (response.data.token) {
        alert('Login bem-sucedido!');
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('isAdmin', username === 'costanza');
        onLogin(true, username === 'costanza', username);
        showCasaroes();
      }
    } catch (error) {
      alert('Erro no login: ' + (error.response?.data?.message || 'Tente novamente.'));
      onLogin(false);
    }
  };
  
  const handleRegister = async () => {
    if (!username || !password || !confirmPassword) {
      alert('Por favor, preencha todos os campos.');
      return;
    }
  
    if (password !== confirmPassword) {
      alert('As senhas não coincidem!');
      return;
    }
  
    try {
      console.log('Tentando registrar com:', { username });
  
      const response = await axios.post('https://back-production-8285.up.railway.app/register', {
        username,
        password,
      }, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
  
      if (response.data.success) {
        alert('Cadastro realizado com sucesso! Você já pode fazer login.');
        setIsRegistering(false);
        setUsername('');
        setPassword('');
        setConfirmPassword('');
      }
    } catch (error) {
      console.error('Detalhes completos do erro:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
        statusText: error.response?.statusText
      });
  
      const errorMessage = error.response?.data?.message 
        || error.response?.data 
        || 'Não foi possível conectar ao servidor. Verifique se o servidor está rodando.';
    
      alert(`Erro no registro: ${errorMessage}`);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.imageContainer}>
        {/* Imagem à esquerda da tela */}
      </div>
      <div style={styles.formContainer}>
        {isRegistering ? (
          <RegisterForm
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            confirmPassword={confirmPassword}
            setConfirmPassword={setConfirmPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleRegister={handleRegister}
            setIsRegistering={setIsRegistering}
          />
        ) : (
          <LoginForm
            username={username}
            setUsername={setUsername}
            password={password}
            setPassword={setPassword}
            showPassword={showPassword}
            setShowPassword={setShowPassword}
            handleLogin={handleLogin}
            setIsRegistering={setIsRegistering}
          />
        )}
      </div>
    </div>
  );
}

function RegisterForm({
  username,
  setUsername,
  password,
  setPassword,
  confirmPassword,
  setConfirmPassword,
  showPassword,
  setShowPassword,
  handleRegister,
  setIsRegistering,
}) {
  return (
    <>
      <h2 style={styles.title}>Cadastro</h2>
      <input
        type="text"
        placeholder="Nome de Usuário"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={styles.input}
      />
      <PasswordField
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
      />
      <input
        type="password"
        placeholder="Confirme a Senha"
        value={confirmPassword}
        onChange={(e) => setConfirmPassword(e.target.value)}
        style={styles.input}
      />
      <button onClick={handleRegister} style={styles.registerButton}>
        Cadastrar-se
      </button>
      <p style={styles.switchText}>
        Já tem uma conta?{' '}
        <button
          onClick={() => setIsRegistering(false)}
          style={{ ...styles.linkButton, ...styles.linkButtonHover }}
        >
          Entrar
        </button>
      </p>
    </>
  );
}

function LoginForm({
  username,
  setUsername,
  password,
  setPassword,
  showPassword,
  setShowPassword,
  handleLogin,
  setIsRegistering,
}) {
  return (
    <>
      <h2 style={styles.title}>Bem-vindo ao JoiPatrio</h2>
      <p style={styles.subtitle}>Consultar Casarões</p>
      
      <input
        type="text"
        placeholder="Nome de Usuário"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        style={styles.input}
      />
      
      <PasswordField
        password={password}
        setPassword={setPassword}
        showPassword={showPassword}
        setShowPassword={setShowPassword}
      />
      
      <button onClick={handleLogin} style={styles.button}>
        Entrar
      </button>
      
      <p style={styles.switchText}>
        Não tem uma conta?{' '}
        <button
          onClick={() => setIsRegistering(true)}
          style={{ ...styles.linkButton, ...styles.linkButtonHover }}
        >
          Cadastrar-se
        </button>
      </p>
    </>
  );
}

function PasswordField({ password, setPassword, showPassword, setShowPassword }) {
  return (
    <div style={styles.passwordContainer}>
      <input
        type={showPassword ? 'text' : 'password'}
        placeholder="Senha"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={styles.input}
      />
      <div style={styles.eyeIcon} onClick={() => setShowPassword(!showPassword)}>
        {showPassword ? <FaEye /> : <FaEyeSlash />}
      </div>
    </div>
  );
}

export default LoginPage;
