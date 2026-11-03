import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <p>Vérification de la session…</p>;
  return user ? children : <Navigate to="/login" replace />;
};
export default ProtectedRoute;
