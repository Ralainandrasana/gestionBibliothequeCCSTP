import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, roles = [] }) => {
  const { isAuthenticated, user, loading } = useAuth();

  if (loading) {
    return <div>Chargement...</div>;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Vérification des rôles
  if (roles.length > 0 && !roles.includes(user?.roles)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
};

export default ProtectedRoute;