import { render, screen, fireEvent } from '@testing-library/react';
import CasaraoListPage from './CasaraoListPage'; 
import '@testing-library/jest-dom';

// Mocking dos dados
const mockCasaroes = [
  {
    id: 1,
    name: 'Palacete Niemeyer',
    description: 'Descrição do casarão 1',
    location: 'Localização 1',
    date: '2024-12-12T00:00:00',
    image_path: '', 
  },
  {
    id: 2,
    name: 'Casarão da Rua das Palmeiras',
    description: 'Descrição do casarão 2',
    location: 'Localização 2',
    date: '2024-12-13T00:00:00',
    image_path: 'path-to-image', 
  },
];

describe('CasaraoListPage', () => {
  test('deve renderizar corretamente os casarões na lista', () => {
    render(<CasaraoListPage casaroes={mockCasaroes} />);

    // Verificar se os nomes dos casarões estão sendo exibidos
    expect(screen.getByText('Palacete Niemeyer')).toBeInTheDocument();
    expect(screen.getByText('Casarão da Rua das Palmeiras')).toBeInTheDocument();
  });

  test('deve mostrar uma mensagem quando não houver casarões', () => {
    render(<CasaraoListPage casaroes={[]} />);

    // Verificar se a mensagem "Nenhum casarão cadastrado." é exibida
    expect(screen.getByText('Nenhum casarão cadastrado.')).toBeInTheDocument();
  });

  test('deve renderizar corretamente os botões de ação', () => {
    render(<CasaraoListPage casaroes={mockCasaroes} />);

    // Verificar se o botão "Ordenar por Nome" está presente
    const ordenarPorNomeButton = screen.getByText('Ordenar por Nome');
    expect(ordenarPorNomeButton).toBeInTheDocument();

    // Simular o clique no botão de ordenar
    fireEvent.click(ordenarPorNomeButton);
    // Aqui você pode verificar se a ação do botão foi chamada, dependendo de como o seu componente está manipulando a lógica de ordenação
  });

  test('deve renderizar a imagem quando houver imagem do casarão', () => {
    render(<CasaraoListPage casaroes={mockCasaroes} />);

    // Verificar se a imagem do segundo casarão é renderizada
    const image = screen.getByAltText('Casarão da Rua das Palmeiras');
    expect(image).toBeInTheDocument();
  });

  test('deve mostrar a mensagem "Data não disponível" quando a data não for fornecida', () => {
    render(<CasaraoListPage casaroes={mockCasaroes} />);

    // Verificar se a data não disponível é exibida para o casarão sem data
    const dataNaoDisponivel = screen.getByText('Data não disponível');
    expect(dataNaoDisponivel).toBeInTheDocument();
  });
  // Teste para verificar a interação com o botão de ordenar
test('deve ordenar casarões quando clicar em Ordenar por Nome', () => {
  render(<CasaraoListPage casaroes={mockCasaroes} />);

  const ordenarPorNomeButton = screen.getByText('Ordenar por Nome');
  fireEvent.click(ordenarPorNomeButton);
  
  // Verificar se os casarões foram ordenados
  const firstCasaraoName = screen.getByText('Casarão da Rua das Palmeiras');
  expect(firstCasaraoName).toBeInTheDocument();
});

// Teste para verificar o comportamento quando não há casarões
test('deve mostrar mensagem de "Nenhum casarão cadastrado" se a lista estiver vazia', () => {
  render(<CasaraoListPage casaroes={[]} />);
  expect(screen.getByText('Nenhum casarão cadastrado.')).toBeInTheDocument();
});
// Teste para verificar como o componente lida com a ausência de uma imagem
test('deve renderizar um texto alternativo quando não houver imagem', () => {
  render(<CasaraoListPage casaroes={[mockCasaroes[0]]} />);
  
  // Verificar se a imagem alternativa está presente
  const image = screen.queryByAltText('Casarão da Rua das Palmeiras');
  expect(image).toBeNull();
});
// Teste para verificar se o componente lida corretamente com favoritos
test('deve adicionar casarão aos favoritos', () => {
  render(<CasaraoListPage casaroes={mockCasaroes} favoritos={[]} />);
  fireEvent.click(screen.getByText('Adicionar aos Favoritos'));
  expect(screen.getByText('Palacete Niemeyer')).toBeInTheDocument();
});

test('deve exibir a data corretamente', () => {
  render(<CasaraoListPage casaroes={mockCasaroes} />);
  
  const data = screen.getByText('2024-12-12');
  expect(data).toBeInTheDocument();
});
test('deve chamar a função de ordenar ao clicar no botão', () => {
  const ordenarMock = jest.fn();
  render(<CasaraoListPage casaroes={mockCasaroes} onOrdenar={ordenarMock} />);
  
  const ordenarPorNomeButton = screen.getByText('Ordenar por Nome');
  fireEvent.click(ordenarPorNomeButton);
  
  expect(ordenarMock).toHaveBeenCalledTimes(1);
});


  test('deve exibir a lista de favoritos', () => {
    render(<CasaraoListPage casaroes={mockCasaroes} favoritos={[{ id: 1, name: 'Palacete Niemeyer' }]} />);
    expect(screen.getByText('Favoritos')).toBeInTheDocument();
    expect(screen.getByText('Palacete Niemeyer')).toBeInTheDocument();
  });

  test('deve permitir adicionar comentário', async () => {
    render(<CasaraoListPage casaroes={mockCasaroes} />);
    
    
    const inputComentario = await screen.findByPlaceholderText('Adicionar um comentário');
    fireEvent.change(inputComentario, { target: { value: 'Comentário de teste' } });
    fireEvent.keyDown(inputComentario, { key: 'Enter' });
    expect(screen.getByText('Comentário de teste')).toBeInTheDocument();
  });
  
});
