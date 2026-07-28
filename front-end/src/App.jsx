import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import SideMenu from './components/SideMenu';
import Content from './components/Content';
import Header from './components/Header';
import Login from './components/Login';
import './App.css';

function App() {
  const [loggedIn, setLoggedIn] = useState(false);
  const navigate = useNavigate();

  // Vérifie si l'utilisateur est déjà connecté à partir du localStorage
  useEffect(() => {
    const storedLoggedIn = localStorage.getItem('loggedIn');
    if (storedLoggedIn === 'true') {
      setLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setLoggedIn(true);
    localStorage.setItem('loggedIn', 'true'); // Sauvegarde l'état de connexion
    navigate('/dashboard'); // Redirige vers la page de tableau de bord
  };

  const handleLogout = () => {
    setLoggedIn(false);
    localStorage.removeItem('loggedIn'); // Supprime l'état de connexion
    navigate('/login'); // Redirige vers la page de connexion
  };

  return (
    <div className="App" style={{ height: '100vh', width: '100vw' }}>
      {!loggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <>
          <Header onLogout={handleLogout} />
          <div style={{ display: 'flex', flexDirection: 'row', height: '94vh' }}>
            <SideMenu />
            <Content />
          </div>
        </>
      )}
    </div>
  );
}

export default App;
