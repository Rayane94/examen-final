import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../services/api';
const AuthContext = createContext(null);
/**
 * Fournit l'état de session aux pages React.
 * L'API dépose un cookie HttpOnly : aucun JWT n'est stocké dans localStorage.
 * À chaque chargement de l'interface, /auth/me recharge l'utilisateur connecté.
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => { api.get('/auth/me').then(r => setUser(r.data)).catch(() => setUser(null)).finally(() => setLoading(false)); }, []);
  const login = async credentials => { const r = await api.post('/auth/login', credentials); setUser({ username: r.data.username, role: r.data.role }); };
  const logout = async () => { try { await api.post('/auth/logout'); } finally { setUser(null); } };
  return <AuthContext.Provider value={{ user, loading, login, logout }}>{children}</AuthContext.Provider>;
};
export const useAuth = () => useContext(AuthContext);
