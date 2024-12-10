import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CasaraoFormPage from './CasaraoFormPage.test.js'

describe('CasaraoFormPage', () => {
  const mockOnSubmit = jest.fn();

  afterEach(() => jest.clearAllMocks());

  test('renders form with empty fields', () => {
    render(<CasaraoFormPage onSubmit={mockOnSubmit} />);

    const placeholders = [
      'Nome do Casarão', 
      'Descrição do Casarão', 
      'Endereço do Casarão', 
      'CEP', 
      'Data de Construção'
    ];
    placeholders.forEach((placeholder) => {
      expect(screen.getByPlaceholderText(placeholder)).toBeInTheDocument();
    });
  });

  test('updates name field', () => {
    render(<CasaraoFormPage onSubmit={mockOnSubmit} />);
    const nameInput = screen.getByPlaceholderText('Nome do Casarão');
    
    fireEvent.change(nameInput, { target: { value: 'Casarão Histórico' } });
    expect(nameInput.value).toBe('Casarão Histórico');
  });

  test('calls onSubmit with correct data', () => {
    render(<CasaraoFormPage onSubmit={mockOnSubmit} />);
    const nameInput = screen.getByPlaceholderText('Nome do Casarão');
    const submitButton = screen.getByText(/Cadastrar/);

    fireEvent.change(nameInput, { target: { value: 'Casarão Histórico' } });
    fireEvent.click(submitButton);

    expect(mockOnSubmit).toHaveBeenCalledWith(expect.objectContaining({
      get: expect.any(Function),
    }));
    expect(mockOnSubmit.mock.calls[0][0].get('name')).toBe('Casarão Histórico');
  });

  test('fetches location data when valid CEP is entered', async () => {
    global.fetch = jest.fn((url) =>
      Promise.resolve({
        json: () =>
          Promise.resolve(
            url.includes('viacep')
              ? { logradouro: 'Rua A', bairro: 'Bairro B', localidade: 'Cidade C', uf: 'UF' }
              : { results: [{ geometry: { location: { lat: -23.0, lng: -48.0 } } }] }
          ),
      })
    );

    render(<CasaraoFormPage onSubmit={mockOnSubmit} />);
    const cepInput = screen.getByPlaceholderText('CEP');
    
    fireEvent.change(cepInput, { target: { value: '12345678' } });

    await waitFor(() => {
      expect(screen.getByPlaceholderText('Endereço do Casarão').value).toContain('Rua A, Bairro B, Cidade C - UF');
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });

  test('renders map with marker when coordinates are available', () => {
    render(<CasaraoFormPage onSubmit={mockOnSubmit} casaraoData={{ coordinates: { lat: -23.0, lng: -48.0 } }} />);
    expect(screen.getByText(/Editar Casarão/)).toBeInTheDocument();
  });
});

