import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  EyeInvisibleOutlined,
  EyeOutlined,
  LockOutlined,
  UserOutlined,
} from '@ant-design/icons';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [nom, setNom] = useState('');
  const [pswd, setPswd] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [registrationMessage] = useState(
    () => location.state?.registrationMessage || ''
  );

  useEffect(() => {
    if (location.state?.registrationMessage) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, [location.pathname, location.state, navigate]);

  const handleLogin = async (event) => {
    event.preventDefault();

    if (!nom.trim() || !pswd) {
      setError('Veuillez remplir tous les champs');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await login(nom.trim(), pswd);

      if (result.success) {
        navigate('/dashboard');
      } else {
        setError(result.message || 'Erreur de connexion');
      }
    } catch (loginError) {
      setError('Erreur de connexion au serveur');
      console.error('Erreur:', loginError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="login-page">
      <section className="login-shell" aria-label="Connexion au Centre Culturel St Paul">
        <div className="login-visual">
          <img src="/image/login.png" alt="" className="login-visual-image" />
          <div className="login-visual-overlay">
            <div className="login-welcome">
              <h1>Bienvenue !</h1>
              <p>
                « Lire, c’est parcourir le monde
                <br />
                sans jamais quitter sa chaise. »
              </p>
            </div>
          </div>
        </div>

        <div className="login-panel">
          <header className="login-brand">
            <img
              src="/image/logoSaintPaul.png"
              alt="Logo du Centre Culturel St Paul"
              className="login-brand-logo"
            />
            <h2>Centre Culturel St Paul</h2>
          </header>

          <div className="login-card">
            <h1>Connectez-vous à votre compte</h1>

            <form onSubmit={handleLogin} className="login-form">
              <div className="login-field">
                <label htmlFor="nom">Utilisateur</label>
                <div className="login-input-wrap">
                  <input
                    type="text"
                    id="nom"
                    value={nom}
                    onChange={(event) => setNom(event.target.value)}
                    placeholder="Entrez votre nom d’utilisateur"
                    disabled={loading}
                    autoComplete="username"
                  />
                  <UserOutlined className="login-input-icon" aria-hidden="true" />
                </div>
              </div>

              <div className="login-field">
                <label htmlFor="pswd">Mot de passe</label>
                <div className="login-input-wrap">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="pswd"
                    value={pswd}
                    onChange={(event) => setPswd(event.target.value)}
                    placeholder="Entrez votre mot de passe"
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <LockOutlined className="login-password-lock" aria-hidden="true" />
                  <button
                    type="button"
                    className="login-password-toggle"
                    onClick={() => setShowPassword((visible) => !visible)}
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    aria-pressed={showPassword}
                    disabled={loading}
                  >
                    {showPassword ? <EyeInvisibleOutlined /> : <EyeOutlined />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="login-error" role="alert" aria-live="polite">
                  {error}
                </p>
              )}

              {registrationMessage && !error && (
                <p className="login-registration-message" role="status" aria-live="polite">
                  {registrationMessage}
                </p>
              )}

              <button type="submit" className="login-submit" disabled={loading}>
                {loading ? 'Connexion en cours…' : 'Connexion'}
              </button>
            </form>

            <p className="login-register">
              Vous n’avez pas de compte ?{' '}
              <Link to="/register">S’inscrire</Link>
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}

export default Login;
