import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import axios from 'axios';
import LoginPage from '../LoginPage';

// Mock do axios
jest.mock('axios');

// Mock do localStorage
const localStorageMock = (() => {
  let store = {};
  return {
    getItem: jest.fn(key => store[key]),
    setItem: jest.fn((key, value) => {
      store[key] = value;
    }),
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', { value: localStorageMock });

describe('LoginPage', () => {
  const mockOnLogin = jest.fn();
  const mockShowCasaroes = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    // Limpa os mocks antes de cada teste
    mockOnLogin.mockClear();
    mockShowCasaroes.mockClear();
    window.alert = jest.fn();
  });

  describe('Renderização inicial', () => {
    test('deve renderizar o formulário de login com todos os elementos', () => {
      render(<LoginPage onLogin={mockOnLogin} showCasaroes={mockShowCasaroes} />);

      // Verifica elementos do header
      expect(screen.getByText(/Bem-vindo ao JoiPatrio/i)).toBeInTheDocument();
      expect(screen.getByText(/Sair/i)).toBeInTheDocument();

      // Verifica campos do formulário
      expect(screen.getByPlaceholderText('Nome de Usuário')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
      
      // Verifica botões
      expect(screen.getByText('Entrar')).toBeInTheDocument();
      expect(screen.getByText('Cadastrar-se')).toBeInTheDocument();
    });
  });

  describe('Funcionalidade de alternância de senha', () => {
    test('deve alternar a visibilidade da senha ao clicar no ícone', () => {
      render(<LoginPage onLogin={mockOnLogin} showCasaroes={mockShowCasaroes} />);
      
      const passwordInput = screen.getByPlaceholderText('Senha');
      const toggleButton = passwordInput.parentElement.querySelector('div[role="button"]');
      
      // Inicialmente a senha está oculta
      expect(passwordInput).toHaveAttribute('type', 'password');
      
      // Clica para mostrar a senha
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'text');
      
      // Clica para esconder a senha
      fireEvent.click(toggleButton);
      expect(passwordInput).toHaveAttribute('type', 'password');
    });
  });

  describe('Login', () => {
    test('deve realizar login com sucesso como usuário normal', async () => {
      const mockResponse = { data: { token: 'fake-token' } };
      axios.post.mockResolvedValueOnce(mockResponse);

      render(<LoginPage onLogin={mockOnLogin} showCasaroes={mockShowCasaroes} />);

      // Preenche os campos
      fireEvent.change(screen.getByPlaceholderText('Nome de Usuário'), {
        target: { value: 'usuario' }
      });
      fireEvent.change(screen.getByPlaceholderText('Senha'), {
        target: { value: 'senha123' }
      });

      // Clica no botão de login
      fireEvent.click(screen.getByText('Entrar'));

      await waitFor(() => {
        // Verifica se a chamada à API foi feita corretamente
        expect(axios.post).toHaveBeenCalledWith(
          'https://back-production-8285.up.railway.app/login',
          { username: 'usuario', password: 'senha123' }
        );

        // Verifica se o token foi armazenado
        expect(localStorage.setItem).toHaveBeenCalledWith('token', 'fake-token');
        expect(localStorage.setItem).toHaveBeenCalledWith('isAdmin', false);

        // Verifica se as callbacks foram chamadas
        expect(mockOnLogin).toHaveBeenCalledWith(true, false, 'usuario');
        expect(mockShowCasaroes).toHaveBeenCalled();
        expect(window.alert).toHaveBeenCalledWith('Login bem-sucedido!');
      });
    });

    test('deve realizar login com sucesso como admin', async () => {
      const mockResponse = { data: { token: 'fake-token' } };
      axios.post.mockResolvedValueOnce(mockResponse);

      render(<LoginPage onLogin={mockOnLogin} showCasaroes={mockShowCasaroes} />);

      fireEvent.change(screen.getByPlaceholderText('Nome de Usuário'), {
        target: { value: 'costanza' }
      });
      fireEvent.change(screen.getByPlaceholderText('Senha'), {
        target: { value: 'senha123' }
      });

      fireEvent.click(screen.getByText('Entrar'));

      await waitFor(() => {
        expect(localStorage.setItem).toHaveBeenCalledWith('isAdmin', true);
        expect(mockOnLogin).toHaveBeenCalledWith(true, true, 'costanza');
      });
    });

    test('deve mostrar erro quando campos estão vazios', async () => {
      render(<LoginPage onLogin={mockOnLogin} showCasaroes={mockShowCasaroes} />);

      fireEvent.click(screen.getByText('Entrar'));

      expect(window.alert).toHaveBeenCalledWith('Por favor, preencha todos os campos.');
      expect(axios.post).not.toHaveBeenCalled();
    });

    test('deve mostrar erro quando login falha', async () => {
      const errorMessage = 'Credenciais inválidas';
      axios.post.mockRejectedValueOnce({ 
        response: { data: { message: errorMessage } } 
      });

      render(<LoginPage onLogin={mockOnLogin} showCasaroes={mockShowCasaroes} />);

      fireEvent.change(screen.getByPlaceholderText('Nome de Usuário'), {
        target: { value: 'usuario' }
      });
      fireEvent.change(screen.getByPlaceholderText('Senha'), {
        target: { value: 'senhaerrada' }
      });

      fireEvent.click(screen.getByText('Entrar'));

      await waitFor(() => {
        expect(window.alert).toHaveBeenCalledWith(`Erro no login: ${errorMessage}`);
        expect(mockOnLogin).toHaveBeenCalledWith(false);
      });
    });
  });

  describe('Registro', () => {
    test('deve alternar para o formulário de registro', () => {
      render(<LoginPage onLogin={mockOnLogin} showCasaroes={mockShowCasaroes} />);

      fireEvent.click(screen.getByText('Cadastrar-se'));

      expect(screen.getByText('Cadastro')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Confirme a Senha')).toBeInTheDocument();
    });

    test('deve realizar registro com sucesso', async () => {
      const mockResponse = { data: { success: true } };
      axios.post.mockResolvedValueOnce(mockResponse);

      render(<LoginPage onLogin={mockOnLogin} showCasaroes={mockShowCasaroes} />);

      // Vai para o formulário de registro
      fireEvent.click(screen.getByText('Cadastrar-se'));

      // Preenche os campos
      fireEvent.change(screen.getByPlaceholderText('Nome de Usuário'), {
        target: { value: 'novoUsuario' }
      });
      fireEvent.change(screen.getByPlaceholderText('Senha'), {
        target: { value: 'senha123' }
      });
      fireEvent.change(screen.getByPlaceholderText('Confirme a Senha'), {
        target: { value: 'senha123' }
      });

      // Clica no botão de registro
      fireEvent.click(screen.getByText('Cadastrar-se', { selector: 'button' }));

      await waitFor(() => {
        expect(axios.post).toHaveBeenCalledWith(
          'https://back-production-8285.up.railway.app/register',
          { username: 'novoUsuario', password: 'senha123' },
          { headers: { 'Content-Type': 'application/json' } }
        );
        expect(window.alert).toHaveBeenCalledWith('Cadastro realizado com sucesso! Você já pode fazer login.');
      });
    });

    test('deve mostrar erro quando senhas não coincidem', async () => {
      render(<LoginPage onLogin={mockOnLogin} showCasaroes={mockShowCasaroes} />);

      fireEvent.click(screen.getByText('Cadastrar-se'));

      fireEvent.change(screen.getByPlaceholderText('Nome de Usuário'), {
        target: { value: 'novoUsuario' }
      });
      fireEvent.change(screen.getByPlaceholderText('Senha'), {
        target: { value: 'senha123' }
      });
      fireEvent.change(screen.getByPlaceholderText('Confirme a Senha'), {
        target: { value: 'senha456' }
      });

      fireEvent.click(screen.getByText('Cadastrar-se', { selector: 'button' }));

      expect(window.alert).toHaveBeenCalledWith('As senhas não coincidem!');
      expect(axios.post).not.toHaveBeenCalled();
    });
  });
}); 