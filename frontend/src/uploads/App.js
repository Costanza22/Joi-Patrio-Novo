import React, { useState } from 'react';
import LoginPage from '../../frontend/src/components/LoginPage';
import CasaraoListPage from '../../frontend/src/components/CasaraoListPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = (adminStatus) => {
    setIsAuthenticated(true);
    setIsAdmin(adminStatus);
  };

  // Esta função é chamada quando um visitante faz login
  const showCasaroes = () => {
    // Aqui você pode adicionar a lógica que deseja executar para visitantes, se necessário.
    console.log('Visitante logado, mostrando casarões');
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <CasaraoListPage isAdmin={isAdmin} />
      ) : (
        <LoginPage onLogin={handleLogin} showCasaroes={showCasaroes} />
      )}
    </div>
  );
}
export default App;
