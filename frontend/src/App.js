import React, { useState } from 'react';
import LoginPage from './components/LoginPage';
import CasaraoListPage from './components/CasaraoListPage';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [username, setUsername] = useState('');

  const handleLogin = (loginStatus, adminStatus, currentUsername) => {
    setIsLoggedIn(loginStatus);
    setIsAdmin(adminStatus);
    setUsername(currentUsername);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('isAdmin');
    setIsLoggedIn(false);
    setIsAdmin(false);
  };

  return (
    <div>
      {!isLoggedIn ? (
        <LoginPage onLogin={handleLogin} showCasaroes={() => {}} />
      ) : (
        <CasaraoListPage 
          isAdmin={isAdmin} 
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}

export default App;




