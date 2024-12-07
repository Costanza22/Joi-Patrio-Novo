import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import CasaraoListPage from './components/CasaraoListPage';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogin = (adminStatus) => {
    setIsAuthenticated(true);
    setIsAdmin(adminStatus);
  };

  
  const showCasaroes = () => {
    /
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
