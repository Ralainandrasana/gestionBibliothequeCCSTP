import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Login({ onLogin }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = () => {
    // Simulation d'une authentification basique
    const mockUser = { username: 'admin', password: 'password' };

    if (username === mockUser.username && password === mockUser.password) {
      setError('');
      onLogin(); // Appel de la fonction onLogin pour mettre à jour l'état
      navigate('/dashboard'); // Redirection vers le tableau de bord
    } else {
      setError("Nom d'utilisateur ou mot de passe incorrect.");
    }
  };

  return (
    <div className="wrapContent" style={styles.wrapContent}>
      <div className="contentLogin" style={styles.contentLogin}>
        <img
          src="/image/logoSaintPaul.png"
          alt="Login"
          style={styles.image}
        />
        <div className="login" style={styles.login}>
          <div className="text" style={styles.text}>
            <h1>Connexion</h1>
          </div>
          <div className="formLogin" style={styles.formLogin}>
            <div style={styles.formGroup}>
              <label htmlFor="username">Utilisateur</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Entrez votre nom d'utilisateur"
                style={styles.input}
              />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                style={styles.input}
              />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button onClick={handleLogin} style={styles.button}>
              Se connecter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  wrapContent: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    backgroundColor: '#f5f5f5',
  },
  contentLogin: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
    maxWidth: '400px',
    width: '100%',
  },
  image: {
    width: '150px',
    marginBottom: '20px',
  },
  login: {
    width: '100%',
  },
  text: {
    textAlign: 'center',
    marginBottom: '20px',
  },
  formLogin: {
    display: 'flex',
    flexDirection: 'column',
    gap: '15px',
  },
  formGroup: {
    display: 'flex',
    flexDirection: 'column',
  },
  input: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: '1px solid #ccc',
    outline: 'none',
    marginTop: '5px',
  },
  button: {
    padding: '10px',
    fontSize: '16px',
    borderRadius: '5px',
    border: 'none',
    backgroundColor: '#007BFF',
    color: '#fff',
    cursor: 'pointer',
  },
  error: {
    color: 'red',
    fontSize: '14px',
    textAlign: 'center',
  },
};

export default Login;
