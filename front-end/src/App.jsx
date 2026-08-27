import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import PageLoader from './components/PageLoader';
import './App.css';

const Login = lazy(() => import('./components/Login'));
const Register = lazy(() => import('./components/Register'));
const SideMenu = lazy(() => import('./components/SideMenu'));
const Content = lazy(() => import('./components/Content'));
const Header = lazy(() => import('./components/Header'));

function AppLayout() {
  const { logout } = useAuth();

  return (
    <>
      <Header onLogout={logout} />
      <div style={{ display: 'flex', flexDirection: 'row', height: '94vh' }}>
        <SideMenu />
        <Content />  {/* ✅ Content gère les routes internes */}
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <div className="App" style={{ minHeight: '100vh', width: '100%' }}>
        <Suspense fallback={<PageLoader message="Chargement de la page" />}>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route 
              path="/*" 
              element={
                <ProtectedRoute>
                  <AppLayout />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Suspense>
      </div>
    </AuthProvider>
  );
}

export default App;
