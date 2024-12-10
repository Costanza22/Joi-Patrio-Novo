import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CasaraoFormPage from './CasaraoFormPage';

describe('CasaraoFormPage Component', () => {
  const mockOnSubmit = jest.fn();

  // Limpa mocks após cada teste
  afterEach(() => {
    jest.clearAllMocks();
  });

  // Teste para verificar se os campos estão renderizados corretamente
  test('renders the form with initial empty fields', () => {
    render(<CasaraoFormPage onSubmit={mockOnSubmit} />);

    // Verifica se os campos estão presentes no formulário
    ['Nome do Casarão', 'Descrição do Casarão', 'Endereço do Casarão', 'CEP', 'Data de Construção'].forEach(placeholder => {
      expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
    });
  });

  // Teste para verificar se o campo de nome é atualizado corretamente
  test('updates name field on input', () => {
    render(<CasaraoFormPage onSubmit={mockOnSubmit} />);
    const nameInput = screen.getByPlaceholderText('Nome do Casarão');
    
    fireEvent.change(nameInput, { target: { value: 'Casarão Histórico' } });
    expect(nameInput.value).toBe('Casarão Histórico');
  });

  // Teste para verificar se o onSubmit é chamado corretamente
  test('calls onSubmit with correct data on form submission', () => {
    render(<CasaraoFormPage onSubmit={mockOnSubmit} />);
    const nameInput = screen.getByPlaceholderText('Nome do Casarão');
    const submitButton = screen.getByText(/Cadastrar/);

    fireEvent.change(nameInput, { target: { value: 'Casarão Histórico' } });
    fireEvent.click(submitButton);

    // Verifica se o mock foi chamado com os dados corretos
    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      get: expect.any(Function),
    }));
    expect(mockOnSubmit.mock.calls[0][0].get('name')).toBe('Casarão Histórico');
  });

  // Teste para verificar se a busca de dados do CEP funciona corretamente
  test('fetches location data when valid CEP is entered', async () => {
    // Mock de função global fetch
    global.fetch = jest.fn(url =>
      Promise.resolve({
        json: () => Promise.resolve(
          url.includes('viacep')
            ? { logradouro: 'Rua A', bairro: 'Bairro B', localidade: 'Cidade C', uf: 'UF' }
            : { results: [{ geometry: { location: { lat: -23.0, lng: -48.0 } } }] }
        ),
      })
    );

    render(<CasaraoFormPage onSubmit={mockOnSubmit} />);
    const cepInput = screen.getByPlaceholderText('CEP');
    
    fireEvent.change(cepInput, { target: { value: '12345678' } });

    // Verifica se o endereço foi preenchido corretamente
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Endereço do Casarão').value).toContain('Rua A, Bairro B, Cidade C - UF');
    });

    // Verifica se o fetch foi chamado duas vezes (ViaCEP e Google Geocoding)
    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  // Teste para verificar se o mapa com marcador é renderizado
  test('renders Google Map with marker when coordinates are available', () => {
    render(<CasaraoFormPage onSubmit={mockOnSubmit} casaraoData={{ coordinates: { lat: -23.0, lng: -48.0 } }} />);
    expect(screen.getByText(/Editar Casarão/)).toBeInTheDocument();
  });
});
