import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [nom, setNom] = useState('');
  const [pswd, setPswd] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleLogin = async (e) => {
    e.preventDefault();
    
    if (!nom || !pswd) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(nom, pswd);
      
      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Erreur de connexion');
      }
    } catch (err) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur:', err);
    } finally {
      setLoading(false);
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
          <form onSubmit={handleLogin} className="formLogin" style={styles.formLogin}>
            <div style={styles.formGroup}>
              <label htmlFor="nom">Nom d'utilisateur</label>
              <input
                type="text"
                id="nom"
                value={nom}
                onChange={(e) => setNom(e.target.value)}
                placeholder="Entrez votre nom d'utilisateur"
                style={styles.input}
                disabled={loading}
                autoComplete="username"
              />
            </div>
            <div style={styles.formGroup}>
              <label htmlFor="pswd">Mot de passe</label>
              <input
                type="password"
                id="pswd"
                value={pswd}
                onChange={(e) => setPswd(e.target.value)}
                placeholder="Entrez votre mot de passe"
                style={styles.input}
                disabled={loading}
                autoComplete="current-password"
                onKeyPress={(e) => e.key === 'Enter' && handleLogin(e)}
              />
            </div>
            {error && <p style={styles.error}>{error}</p>}
            <button 
              type="submit"
              style={{
                ...styles.button,
                opacity: loading ? 0.7 : 1,
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
              disabled={loading}
            >
              {loading ? 'Connexion en cours...' : 'Se connecter'}
            </button>
          </form>
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
    transition: 'background-color 0.3s',
  },
  error: {
    color: 'red',
    fontSize: '14px',
    textAlign: 'center',
  },
};

export default Login;