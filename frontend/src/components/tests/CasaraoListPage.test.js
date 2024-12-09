import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CasaraoListPage from '../CasaraoListPage';

// Mock do fetch com resposta completa
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve([{
      id: 1,
      name: 'Casarão Teste',
      description: 'Descrição teste',
      location: 'Local teste',
      image_path: null,
      date: '2024-03-20'
    }])
  })
);

describe('CasaraoListPage', () => {
  // Helper function to render component
  const renderCasaraoList = () => {
    return render(<CasaraoListPage isAdmin={true} />);
  };

  beforeEach(() => {
    fetch.mockClear();
    localStorage.clear();
  });

  it('deve exibir o botão "Consultar Casarões"', async () => {
    renderCasaraoList();
    expect(await screen.findByText(/Consultar Casarões/i)).toBeInTheDocument();
  });

  it('deve exibir a lista de casarões ao clicar em "Consultar Casarões"', async () => {
    renderCasaraoList();
    fireEvent.click(screen.getByText(/Consultar Casarões/i));

    await waitFor(() => {
      expect(screen.getByText(/Casarão Teste/i)).toBeInTheDocument();
    });
  });

  it('deve exibir os botões de edição e exclusão para o administrador', async () => {
    renderCasaraoList();
    fireEvent.click(screen.getByText(/Consultar Casarões/i));

    
  });
});
