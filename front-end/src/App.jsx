import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Login from './components/Login';
import SideMenu from './components/SideMenu';
import Content from './components/Content';
import Header from './components/Header';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function AppLayout() {
  const { user, logout } = useAuth();

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
      <div className="App" style={{ height: '100vh', width: '100vw' }}>
        <Routes>
          <Route path="/login" element={<Login />} />
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
      </div>
    </AuthProvider>
  );
}

export default App;