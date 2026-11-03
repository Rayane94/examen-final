import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <p>Vérification de la session…</p>;
  return user?.role === 'admin' ? children : <Navigate to="/" replace />;
};
export default AdminRoute;
