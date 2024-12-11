import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CasaraoFormPage from './CasaraoFormPage'; // Ajuste o caminho conforme necessário

const mockOnSubmit = jest.fn();

describe('CasaraoFormPage', () => {
  it('should render form with default values', () => {
    render(<CasaraoFormPage onSubmit={mockOnSubmit} casaraoData={null} />);
    
    // Verificando a renderização de elementos do formulário
    expect(screen.getByPlaceholderText('Nome do Casarão')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Descrição do Casarão')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Endereço do Casarão')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('CEP')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Data de Construção')).toBeInTheDocument();
  });

  it('should prefill form if casaraoData is provided', () => {
    const casaraoData = {
      name: 'Palacete Niemeyer',
      description: 'Histórico',
      location: 'Rua ABC, 123',
      cep: '12345678',
      image_path: null,
      date: '1900-01-01',
    };

    render(<CasaraoFormPage onSubmit={mockOnSubmit} casaraoData={casaraoData} />);

    expect(screen.getByDisplayValue('Palacete Niemeyer')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Histórico')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Rua ABC, 123')).toBeInTheDocument();
    expect(screen.getByDisplayValue('12345678')).toBeInTheDocument();
    expect(screen.getByDisplayValue('1900-01-01')).toBeInTheDocument();
  });

  it('should handle input changes correctly', () => {
    render(<CasaraoFormPage onSubmit={mockOnSubmit} casaraoData={null} />);

    // Alterando o nome
    fireEvent.change(screen.getByPlaceholderText('Nome do Casarão'), { target: { value: 'Novo Casarão' } });
    expect(screen.getByDisplayValue('Novo Casarão')).toBeInTheDocument();

    // Alterando a descrição
    fireEvent.change(screen.getByPlaceholderText('Descrição do Casarão'), { target: { value: 'Descrição nova' } });
    expect(screen.getByDisplayValue('Descrição nova')).toBeInTheDocument();

    // Alterando o CEP
    fireEvent.change(screen.getByPlaceholderText('CEP'), { target: { value: '12345678' } });
    expect(screen.getByDisplayValue('12345678')).toBeInTheDocument();
  });

  it('should fill location when CEP is changed', async () => {
    render(<CasaraoFormPage onSubmit={mockOnSubmit} casaraoData={null} />);

    // Simulando a mudança do CEP
    fireEvent.change(screen.getByPlaceholderText('CEP'), { target: { value: '01001000' } });

    // Esperando o mock da API retornar dados
    await waitFor(() => expect(screen.getByDisplayValue('Praça da Sé, Centro, São Paulo - SP')).toBeInTheDocument());
  });

  it('should call onSubmit with correct form data', () => {
    render(<CasaraoFormPage onSubmit={mockOnSubmit} casaraoData={null} />);

    fireEvent.change(screen.getByPlaceholderText('Nome do Casarão'), { target: { value: 'Palacete Niemeyer' } });
    fireEvent.change(screen.getByPlaceholderText('Descrição do Casarão'), { target: { value: 'Descrição de teste' } });
    fireEvent.change(screen.getByPlaceholderText('Endereço do Casarão'), { target: { value: 'Rua X, 123' } });
    fireEvent.change(screen.getByPlaceholderText('CEP'), { target: { value: '12345678' } });

    fireEvent.submit(screen.getByRole('button'));

    expect(mockOnSubmit).toHaveBeenCalledWith({
      formData: {
        name: 'Palacete Niemeyer',
        description: 'Descrição de teste',
        location: 'Rua X, 123',
        cep: '12345678',
        date: '',
      },
      base64: '',
    });
  });

  it('should handle file input correctly', () => {
    render(<CasaraoFormPage onSubmit={mockOnSubmit} casaraoData={null} />);

    const fileInput = screen.getByLabelText('Escolher arquivo');
    const file = new Blob(['file content'], { type: 'image/jpeg' });
    Object.defineProperty(fileInput, 'files', {
      value: [file],
    });

    fireEvent.change(fileInput);

    expect(screen.getByRole('img')).toHaveAttribute('src', expect.stringContaining('data:image/jpeg;base64'));
  });
});
