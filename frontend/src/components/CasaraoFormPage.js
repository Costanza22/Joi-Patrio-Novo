import React, { useState, useEffect } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

function CasaraoFormPage({ onSubmit, casaraoData }) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [cep, setCep] = useState('');
  const [image,setImage] = useState(null);
  const [date, setDate] = useState('');
  const [coordinates, setCoordinates] = useState({ lat: null, lng: null });
  const [loadingMap, setLoadingMap] = useState(false); // State for loading map
  const [base64, setBase64] = useState("");

 useEffect(() => {
    if (casaraoData) {
      setName(casaraoData.name);
      setDescription(casaraoData.description);
      setLocation(casaraoData.location);
      setCep(casaraoData.cep || '');
      setImage(casaraoData.image_path ? casaraoData.image_path : null);
      setDate(casaraoData.date ? 
        new Date(casaraoData.date).toISOString().split('T')[0] : 
        '');
    }
  }, [casaraoData]);

  const handleCepChange = async (e) => {
    setCep(e.target.value);

    if (e.target.value.length === 8) {
      try {
        const response = await fetch(`https://viacep.com.br/ws/${e.target.value}/json/`);
        const data = await response.json();

        if (data.localidade) {
          setLocation(`${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`);

          // Obter coordenadas usando a API de Geocodificação do Google
          const googleResponse = await fetch(
            `https://maps.googleapis.com/maps/api/geocode/json?address=${data.logradouro},${data.localidade},${data.uf}&key=YOUR_GOOGLE_API_KEY`
          );
          const googleData = await googleResponse.json();

          if (googleData.results.length > 0) {
            const location = googleData.results[0].geometry.location;
            setCoordinates(location);
          }
        }
      } catch (error) {
        console.error('Erro ao buscar CEP ou coordenadas:', error);
      }
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0]; // Get the uploaded file
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result.split(",")[1]; // Remove the data type prefix
        setBase64(base64String); // Save Base64 string in state
      };
      reader.readAsDataURL(file); // Read the file as a Data URL
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    let data = {
      name,
      description,
      location,
      cep,
      date: date || null,
      latitude: coordinates.lat,
      longitude: coordinates.lng
    }

    // Log para debug
    console.log('Dados sendo enviados:', data);

    if (casaraoData?.id) {
      data.id = casaraoData.id;
    }

    onSubmit({formData: data, base64});

    // Reset form after submit
    setName('');
    setDescription('');
    setLocation('');
    setCep('');
    setDate('');
    setImage(null);
    setBase64("");
    setCoordinates({ lat: null, lng: null });
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>{casaraoData ? 'Editar Casarão' : 'Cadastrar Novo Casarão'}</h2>
      <form onSubmit={handleSubmit} style={styles.form} encType="multipart/form-data">
        <input
          type="text"
          placeholder="Nome do Casarão"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          style={styles.input}
        />
        <textarea
          placeholder="Descrição do Casarão"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          style={styles.textarea}
        />
        <input
          type="text"
          placeholder="Endereço do Casarão"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          required
          style={styles.input}
        />
        <input
          type="text"
          placeholder="CEP"
          value={cep}
          onChange={handleCepChange}
          maxLength="8"
          style={styles.input}
        />
        <input
          type="date"
          placeholder="Data de Construção"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          style={styles.input}
        />
          {base64 && (
          <div>
            <img
              src={`data:image/jpeg;base64,${base64}`}
              alt={name}
              style={{ width: '100%', height: 'auto', marginBottom: '10px' }}
            />
            <p>Imagem atual</p>
          </div>
        )}
        <label htmlFor="fileInput" style={styles.fileLabel}>
          Escolher arquivo
        </label>
        <input
          type="file"
          id="fileInput"
          onChange={handleFileChange}
          style={styles.fileInput}
        />

        {/* Mapa do Google dentro do formulário */}
        <div style={{ width: '100%', height: '300px', marginTop: '20px' }}>
          <LoadScript googleMapsApiKey={process.env.REACT_APP_GOOGLE_API_KEY}>
            <GoogleMap
              mapContainerStyle={{ width: '100%', height: '100%' }}
              center={coordinates.lat && coordinates.lng ? coordinates : { lat: -23.1896, lng: -48.9528 }} // Default position if no coordinates
              zoom={15}
              onLoad={() => setLoadingMap(false)} // Set loadingMap to false when map loads
              onError={() => setLoadingMap(true)} // Handle error in loading map
            >
              {coordinates.lat && coordinates.lng && <Marker position={coordinates} />}
            </GoogleMap>
          </LoadScript>
        </div>

        {loadingMap && <p>Carregando mapa...</p>} {/* Display loading message when map is loading */}

        <button type="submit" style={styles.submitButton}>
          {casaraoData ? 'Salvar Alterações' : 'Cadastrar'}
        </button>
      </form>
    </div>
  );
}


const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f5f5dc', 
    fontFamily: "'Poppins', sans-serif",
    borderRadius: '10px',
    maxWidth: '500px',
    margin: '30px auto',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.15)',
  },
  title: {
    fontSize: '26px',
    color: '#333',
    textAlign: 'center',
    marginBottom: '15px',
    fontWeight: '600',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '12px',
    margin: '8px 0',
    borderRadius: '8px',
    border: '1px solid #ccc',
    outline: 'none',
    fontSize: '14px',
    transition: 'border-color 0.3s',
  },
  inputFocus: {
    borderColor: '#8B4513',
  },
  textarea: {
    padding: '12px',
    margin: '8px 0',
    borderRadius: '8px',
    border: '1px solid #ccc',
    resize: 'vertical',
    outline: 'none',
    fontSize: '14px',
  },
  fileLabel: {
    padding: '12px',
    margin: '8px 0',
    backgroundColor: '#8B4513',
    color: '#fff',
    borderRadius: '8px',
    cursor: 'pointer',
    textAlign: 'center',
    textDecoration: 'none',
  },
  submitButton: {
    padding: '12px',
    backgroundColor: '#8B4513',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
    marginTop: '15px',
    transition: 'background-color 0.3s, transform 0.2s',
  },
  submitButtonHover: {
    backgroundColor: '#5C3D2D',
    transform: 'scale(1.05)',
  },

  imagePreview: {
    marginTop: '10px',
    textAlign: 'center',
  },
  previewImage: {
    maxWidth: '200px', 
    height: 'auto',
  },
 
};

export default CasaraoFormPage;
