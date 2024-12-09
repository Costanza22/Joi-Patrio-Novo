import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import LoginPage from '../LoginPage';

describe('LoginPage Component', () => {
  const mockOnLogin = jest.fn();
  const mockShowCasaroes = jest.fn();

  // Helper function para renderizar o componente
  const renderLoginPage = () => {
    render(<LoginPage onLogin={mockOnLogin} showCasaroes={mockShowCasaroes} />);
  };

  // Helper function para preencher o formulário
  const fillRegistrationForm = ({
    nome = 'Test User',
    email = 'test@example.com',
    senha = '12345',
    confirmaSenha = '12345'
  } = {}) => {
    fireEvent.change(screen.getByPlaceholderText('Nome'), { target: { value: nome } });
    fireEvent.change(screen.getByPlaceholderText('Email'), { target: { value: email } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: senha } });
    fireEvent.change(screen.getByPlaceholderText('Confirme a Senha'), { target: { value: confirmaSenha } });
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('renders the login form by default', () => {
    renderLoginPage();
    expect(screen.getByText(/Bem-vindo ao JoiPatrio/i)).toBeInTheDocument();
  });

  test('switches to registration form', () => {
    renderLoginPage();
    fireEvent.click(screen.getByRole('button', { name: /Cadastrar-se/i }));
    expect(screen.getByText('Cadastro')).toBeInTheDocument();
  });

  test('shows alert when submitting empty registration form', () => {
    renderLoginPage();
    fireEvent.click(screen.getByRole('button', { name: /Cadastrar-se/i }));
    fireEvent.click(screen.getByRole('button', { name: /Cadastrar-se/i }));
    expect(window.alert).toHaveBeenCalledWith('Por favor, preencha todos os campos.');
  });

  test('shows alert when passwords do not match', () => {
    renderLoginPage();
    fireEvent.click(screen.getByRole('button', { name: /Cadastrar-se/i }));
    fillRegistrationForm({ senha: '12345', confirmaSenha: '54321' });
    fireEvent.click(screen.getByRole('button', { name: /Cadastrar-se/i }));
    expect(window.alert).toHaveBeenCalledWith('As senhas não coincidem!');
  });
});
