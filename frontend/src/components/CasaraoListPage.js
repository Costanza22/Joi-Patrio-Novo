import React, { useEffect, useState } from 'react';
import CasaraoFormPage from './CasaraoFormPage';
import { MdOutlineModeEdit } from 'react-icons/md';
import { IoIosStarOutline, IoMdCheckmarkCircleOutline } from 'react-icons/io';
import { BsFillPatchQuestionFill } from 'react-icons/bs';


function CasaraoListPage({ isAdmin }) {
  const [casaroes, setCasaroes] = useState([]);
  const [showCadastro, setShowCadastro] = useState(false);
  const [showList, setShowList] = useState(false);
  const [error, setError] = useState(null);
  const [casaraoToEdit, setCasaraoToEdit] = useState(null);
  const [favoritos, setFavoritos] = useState([]);
  const [visitados, setVisitados] = useState([]);
  const [comentarios, setComentarios] = useState({});
  const [showInput, setShowInput] = useState(false); 
  const [suggestion, setSuggestion] = useState(''); 
  const [successMessage, setSuccessMessage] = useState(''); 
  const fetchCasaroes = async () => {
    try {
      const response = await fetch(`https://back-production-8285.up.railway.app/casaroes`);

      if (!response.ok) throw new Error('Erro ao carregar os casarões: ' + response.statusText);

      
      const data = await response.json();
      setCasaroes(data);
      setError(null);
    } catch (error) {
      console.error('Erro ao carregar os casarões:', error);
      setError(error.message);
    }
  };

  useEffect(() => {
    if (showList) {
      fetchCasaroes();
    }
  }, [showList]);

  const handleCadastroClick = () => {
    setShowCadastro(true);
    setShowList(false);
    setCasaraoToEdit(null);
  };

  const handleConsultarClick = () => {
    setShowList((prev) => !prev);
    setShowCadastro(false);
    if (!showList) {
      fetchCasaroes();
    }
  };
  const handleIconClick = () => {
    setShowInput(!showInput); // Alterna a exibição do input
  };
  const handleSubmit = (event) => {
    event.preventDefault();
  
    if (suggestion.trim() === '') {
      alert('Por favor, digite uma sugestão antes de enviar.');
      return;
    }
  
    setSuccessMessage('Sugestão enviada com sucesso!');
    setSuggestion(''); 
  };
  
  const handleFavoritar = (casarao) => {
    setFavoritos((prev) => 
      prev.some(favorito => favorito.id === casarao.id) 
      ? prev.filter(favorito => favorito.id !== casarao.id)
      : [...prev, casarao]
    );
  };

  const handleMarcarVisitado = (casarao) => {
    setVisitados((prev) =>
      prev.some(visitado => visitado.id === casarao.id)
      ? prev.filter(visitado => visitado.id !== casarao.id)
      : [...prev, casarao]
    );
  };
  const handleSortByName = () => {
    setCasaroes((prev) => [...prev].sort((a, b) => a.name.localeCompare(b.name)));
  };
  
  const handleFilterVisitados = () => {
    setCasaroes(visitados);
  };
  

 const handleDeleteCasarao = async (casaraoId) => {
  if (!window.confirm('Tem certeza que deseja excluir este casarão?')) return;

  try {
    const response = await fetch(`https://back-production-8285.up.railway.app/casaroes/${casaraoId}`, {
      method: 'DELETE',
    });

    if (!response.ok) throw new Error(`Erro ao excluir o casarão: ${response.statusText}`);

    setCasaroes((prev) => prev.filter((casarao) => casarao.id !== casaraoId));
  } catch (error) {
    console.error('Erro ao excluir o casarão:', error);
    alert('Erro ao excluir o casarão: ' + error.message);
  }
};

  const handleCasaraoSubmit = async ({formData, base64}) => {

    console.log({formData, base64});
    try {
      const method = casaraoToEdit?.id ? 'PUT' : 'POST';
      const url = casaraoToEdit?.id 
        ? `https://back-production-8285.up.railway.app/casaroes/${casaraoToEdit.id}`
        : `https://back-production-8285.up.railway.app/casaroes`;
        const response = await fetch(url, {
          method: method, // Verifique se 'method' é uma string válida como 'POST' ou 'GET'
          headers: {
            "Content-Type": "application/json", // Certifique-se de que o Content-Type esteja correto
          },
          body: JSON.stringify({ formData, base64 }), // Verifique se 'formData' e 'base64' são dados válidos
        });        
      
      if (!response.ok) throw new Error(`Erro ao salvar o casarão: ${response.statusText}`);
      
      fetchCasaroes();
      setShowCadastro(false);
      setShowList(true);
    } catch (error) {
      console.error('Erro ao salvar o casarão:', error);
      alert('Erro ao salvar o casarão: ' + error.message);
    }
  };

  const handleEditClick = (casarao) => {
    setCasaraoToEdit(casarao);
    setShowCadastro(true);
    setShowList(false);
  };

  const handleAddComment = (casaraoId, comment) => {
    setComentarios((prev) => ({
      ...prev,
      [casaraoId]: [...(prev[casaraoId] || []), comment],
    }));
  };

  return (
    <div style={styles.container}>
      {showCadastro ? (
        <CasaraoFormPage 
          onSubmit={handleCasaraoSubmit} 
          casaraoData={casaraoToEdit}
        />
      ) : (
        <>
          <h2 style={styles.title}>
        Lista de Casarões
        <BsFillPatchQuestionFill onClick={handleIconClick} style={{ cursor: 'pointer', marginLeft: '10px' }} />
      </h2>

      {showInput && (
        <div style={styles.formContainer}>
          <form onSubmit={handleSubmit}>
            <input
              type="text"
              value={suggestion}
              onChange={(e) => setSuggestion(e.target.value)}
              placeholder="Digite sua sugestão"
              style={styles.input}
            />
            <button type="submit" style={styles.button}>
              Enviar
            </button>
          </form>
        </div>
      )}

      {successMessage && <p style={styles.successMessage}>{successMessage}</p>}
    
    
          <button onClick={handleConsultarClick} style={styles.button}>
            {showList ? 'Fechar Casarões' : 'Consultar Casarões'}
          </button>
          {isAdmin && (
            <button onClick={handleCadastroClick} style={styles.button}>
              Cadastrar Novo Casarão
            </button>
          )}
          {showList && (
            <div style={styles.listContainer}>
              {error && <div style={{ color: 'red' }}>{error}</div>}
              {casaroes.length > 0 ? (
                <ul style={styles.list}>
                  {casaroes.map((casarao) => (
                    <li key={casarao.id} style={styles.listItem}>
                      <h3>{casarao.name}</h3>
                      <p>{casarao.description}</p>
                      <p>{casarao.location}</p>
                       <p>Data de Construção: {casarao.date ? 
                          new Date(casarao.date).toLocaleDateString('pt-BR') : 
                          'Data não disponível'} 
                          (Raw: {JSON.stringify(casarao.date)})
                      </p>



                      {casarao.image_path && (
  <div style={styles.imageContainer}>
    <img
      src={`data:image/jpeg;base64,${casarao.image_path}`}
      alt={casarao.name}
      onError={(e) => {
        console.error('Erro ao carregar a imagem:', e);
      }}
      style={styles.image}
    />
  </div>



                      )}
                      <button onClick={handleSortByName} style={styles.button}>Ordenar por Nome</button>
<button onClick={handleFilterVisitados} style={styles.button}>Filtrar Visitados</button>

                      {isAdmin && (
                        <>
                          <button onClick={() => handleEditClick(casarao)} style={styles.editButton}>
                            <MdOutlineModeEdit /> Editar
                          </button>
                          <button onClick={() => handleDeleteCasarao(casarao.id)} style={styles.deleteButton}>
                            Excluir
                          </button>
                        </>
                      )}
                      {!isAdmin && (
                        <>
                          <button onClick={() => handleFavoritar(casarao)} style={styles.favoritoButton}>
                            <IoIosStarOutline style={{ color: favoritos.some(favorito => favorito.id === casarao.id) ? 'gold' : 'gray' }} />
                          </button>
                          <button onClick={() => handleMarcarVisitado(casarao)} style={styles.visitadoButton}>
                            <IoMdCheckmarkCircleOutline style={{ color: visitados.some(visitado => visitado.id === casarao.id) ? 'green' : 'gray' }} />
                          </button>
                        </>
                      )}
                      
                      {/* Seção de Comentários */}
                      <div style={styles.comentariosContainer}>
                        <h4>Comentários</h4>
                        <ul>
  {(comentarios[casarao.id] || []).map((comment) => (
    <li key={`${casarao.id}-${comment}`}>{comment}</li>
  ))}
</ul>

                        <input
                          type="text"
                          placeholder="Adicionar um comentário"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && e.target.value.trim()) {
                              handleAddComment(casarao.id, e.target.value);
                              e.target.value = ''; // Limpa o campo de entrada
                            }
                          }}
                          style={styles.comentarioInput}
                        />
                      </div>
                    </li>
                  ))}
                </ul>
              ) : (
                <p>Nenhum casarão cadastrado.</p>
              )}
            </div>
          )}
          {!isAdmin && (
            <div style={styles.favoritosContainer}>
              <h3>Favoritos</h3>
              <ul>
                {favoritos.length > 0 ? (
                  favoritos.map(favorito => (
                    <li key={favorito.id}>{favorito.name}</li>
                  ))
                ) : (
                  <p>Nenhum favorito adicionado.</p>
                )}
              </ul>
              <h3>Visitados</h3>
              <ul>
                {visitados.length > 0 ? (
                  visitados.map(visitado => (
                    <li key={visitado.id}>{visitado.name}</li>
                  ))
                ) : (
                  <p>Nenhum casarão visitado.</p>
                )}
              </ul>
            </div>
          )}
        </>
      )}
    </div>
    
  );
}



const styles = {
  container: {
    padding: '30px',
    backgroundColor: '#F9F3E3', 
    fontFamily: 'Georgia, serif',
    borderRadius: '15px', 
    boxShadow: '0 10px 30px rgba(0, 0, 0, 0.1)', 
    transition: 'box-shadow 0.3s ease', 
  },
  title: {
    fontSize: '40px',
    color: '#4B2A14', 
    textAlign: 'center',
    marginBottom: '25px',
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: '4px',
    textShadow: '2px 2px 5px rgba(0, 0, 0, 0.15)', 
  },
  button: {
    display: 'block',
    margin: '15px auto',
    padding: '12px 25px',
    backgroundColor: '#8B4513', 
    color: '#fff',
    border: 'none',
    borderRadius: '30px', 
    cursor: 'pointer',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)', 
    transition: 'all 0.3s ease',
  },
  buttonHover: {
    backgroundColor: '#6A2E12', 
    transform: 'scale(1.05)', 
  },
  listContainer: {
    backgroundColor: '#FFF8DC', 
    padding: '20px', 
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
    transition: 'box-shadow 0.3s ease',
  },
  list: {
    listStyleType: 'none',
    padding: '0',
  },
  listItem: {
    padding: '15px',
    marginBottom: '15px',
    borderRadius: '10px',
    backgroundColor: '#F5DEB3',
    boxShadow: '0 5px 15px rgba(0, 0, 0, 0.2)', 
    transition: 'transform 0.3s ease, background-color 0.3s ease',
  },
  listItemHover: {
    transform: 'scale(1.05)',
    backgroundColor: '#F4C8A1',
  },
  
  imageContainer: {
    overflow: 'hidden',
    borderRadius: '15px', 
    marginBottom: '20px',
    boxShadow: '0 10px 20px rgba(0, 0, 0, 0.15)', 
    border: '5px solid #F4C8A1', 
  },
  image: {
    width: '40%',
    height: 'auto',
    borderRadius: '10px', 
    objectFit: 'cover', 
  },
  editButton: {
    backgroundColor: '#FFA07A',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    width: '120px',
    height: '45px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  },
  deleteButton: {
    backgroundColor: '#FF6347',
    border: 'none',
    borderRadius: '25px',
    cursor: 'pointer',
    width: '120px',
    height: '45px',
    boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
    transition: 'all 0.3s ease',
  },
  favoritosContainer: {
    marginTop: '25px',
    backgroundColor: '#FFF8DC',
    padding: '20px',
    borderRadius: '10px',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  comentariosContainer: {
    marginTop: '20px',
  },
  comentarioInput: {
    width: '100%',
    padding: '10px',
    marginTop: '10px',
    border: '1px solid #ccc',
    borderRadius: '5px',
  },
  input: {
    padding: '12px',
    width: '300px',
    borderRadius: '15px',
    border: '1px solid #ccc',
    marginRight: '15px',
    fontSize: '16px',
    boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)', 
  },
  successMessage: {
    marginTop: '25px',
    color: '#4CAF50',
    fontSize: '20px', 
    fontWeight: 'bold',
    textAlign: 'center', 
    letterSpacing: '1px',
    textShadow: '1px 1px 3px rgba(0, 0, 0, 0.1)',
    filterInput: {
      padding: '8px',
      width: '100%',
      marginBottom: '10px',
      border: '1px solid #ccc',
      borderRadius: '5px',
    },
  },
};

export default CasaraoListPage;
