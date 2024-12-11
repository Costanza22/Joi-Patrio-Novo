import { render, screen, fireEvent } from '@testing-library/react';
import CasaraoListPage from '../CasaraoListPage';

// Mock fetch para prevenir chamadas reais de API durante os testes
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve([
      { id: 1, name: 'Casarão Teste', description: 'Descrição teste', location: 'Local teste' },
    ]),
  })
);

describe('CasaraoListPage', () => {
  beforeEach(() => fetch.mockClear());

  it('deve exibir o botão "Consultar Casarões"', () => {
    render(<CasaraoListPage isAdmin={true} />);
    expect(screen.getByText(/Consultar Casarões/i)).toBeInTheDocument();
  });

  it('deve exibir a lista de casarões ao clicar em "Consultar Casarões"', async () => {
    render(<CasaraoListPage isAdmin={true} />);
    fireEvent.click(screen.getByText(/Consultar Casarões/i));

    const casaraoItem = await screen.findByText(/Casarão Teste/i);
    expect(casaraoItem).toBeInTheDocument();
  });

  it('deve exibir os botões de edição e exclusão para o administrador', async () => {
    render(<CasaraoListPage isAdmin={true} />);
    fireEvent.click(screen.getByText(/Consultar Casarões/i));

    const editButton = await screen.findByText(/Editar/i);
    const deleteButton = await screen.findByText(/Excluir/i);

    expect(editButton).toBeInTheDocument();
    expect(deleteButton).toBeInTheDocument();
  });

  it('deve exibir a opção de favoritar para usuários não administradores', async () => {
    render(<CasaraoListPage isAdmin={false} />);
    fireEvent.click(screen.getByText(/Consultar Casarões/i));

    const favoriteButton = await screen.findByRole('button', { name: /Favorito/i });
    expect(favoriteButton).toBeInTheDocument();
  });

  it('deve adicionar e remover favoritos ao clicar no botão', async () => {
    render(<CasaraoListPage isAdmin={false} />);
    fireEvent.click(screen.getByText(/Consultar Casarões/i));

    const favoriteButton = await screen.findByRole('button', { name: /Favorito/i });
    fireEvent.click(favoriteButton); // Adiciona aos favoritos
    expect(screen.getByText('Casarão Teste')).toBeInTheDocument();

    fireEvent.click(favoriteButton); // Remove dos favoritos
    expect(screen.queryByText('Casarão Teste')).not.toBeInTheDocument();
  });
});