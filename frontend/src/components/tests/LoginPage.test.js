import { render, fireEvent, screen } from '@testing-library/react';
import LoginPage from './LoginPage.test.js'

describe('LoginPage Component', () => {
  const mockOnLogin = jest.fn();
  const mockShowCasaroes = jest.fn();

  beforeEach(() => {
    mockOnLogin.mockClear();
    mockShowCasaroes.mockClear();
  });

  test('renderiza o formulário de login por padrão', () => {
    render(<LoginPage onLogin={mockOnLogin} showCasaroes={mockShowCasaroes} />);
    
    expect(screen.getByText('Bem-vindo ao JoiPatrio')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Nome de Usuário')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Senha')).toBeInTheDocument();
  });

  test('alternar para o formulário de cadastro ao clicar em "Cadastrar-se"', () => {
    render(<LoginPage onLogin={mockOnLogin} showCasaroes={mockShowCasaroes} />);
    
    fireEvent.click(screen.getByText('Cadastrar-se'));
    expect(screen.getByText('Cadastro')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Confirme a Senha')).toBeInTheDocument();
  });

  test('valida as credenciais de login para o papel de administrador', () => {
    render(<LoginPage onLogin={mockOnLogin} showCasaroes={mockShowCasaroes} />);
    
    fireEvent.change(screen.getByPlaceholderText('Nome de Usuário'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: 'admin' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'admin' } });
    fireEvent.click(screen.getByText('Entrar'));
    
    expect(mockOnLogin).toHaveBeenCalledWith(true);
    expect(mockShowCasaroes).toHaveBeenCalled();
  });

  test('valida as credenciais de login para o papel de visitante', () => {
    render(<LoginPage onLogin={mockOnLogin} showCasaroes={mockShowCasaroes} />);
    
    fireEvent.change(screen.getByPlaceholderText('Nome de Usuário'), { target: { value: 'visitante1' } });
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '12345' } });
    fireEvent.change(screen.getByRole('combobox'), { target: { value: 'visitante' } });
    fireEvent.click(screen.getByText('Entrar'));
    
    expect(mockOnLogin).toHaveBeenCalledWith(false);
    expect(mockShowCasaroes).toHaveBeenCalled();
  });

  test('exibe um alerta se as senhas não coincidirem durante o cadastro', () => {
    render(<LoginPage onLogin={mockOnLogin} showCasaroes={mockShowCasaroes} />);
    
    fireEvent.click(screen.getByText('Cadastrar-se'));
    fireEvent.change(screen.getByPlaceholderText('Senha'), { target: { value: '12345' } });
    fireEvent.change(screen.getByPlaceholderText('Confirme a Senha'), { target: { value: '54321' } });
    fireEvent.click(screen.getByText('Cadastrar-se'));
    
    expect(screen.getByText('As senhas não coincidem!')).toBeInTheDocument();
  });
});
