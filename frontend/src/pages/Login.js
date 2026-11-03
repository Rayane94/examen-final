import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
const Login = () => {
  const [credentials, setCredentials] = useState({ username:'',password:'' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();
  const submit = async e => {
    e.preventDefault();setBusy(true);setError('');
    try { await login(credentials);navigate('/'); }
    catch (err) { setError(err.response?.data?.message || 'Connexion impossible'); }
    finally { setBusy(false); }
  };
  return <div className="flex justify-center items-center min-h-screen"><form onSubmit={submit} className="bg-white p-6 rounded shadow-md w-80">
    <h2 className="text-2xl font-bold mb-4">Connexion</h2>
    {error && <p role="alert" className="text-red-600">{error}</p>}
    <input aria-label="Nom d'utilisateur" required autoComplete="username" className="border p-2 w-full mb-4" placeholder="Nom d'utilisateur" value={credentials.username} onChange={e=>setCredentials({...credentials,username:e.target.value})}/>
    <input aria-label="Mot de passe" required autoComplete="current-password" className="border p-2 w-full mb-4" type="password" placeholder="Mot de passe" value={credentials.password} onChange={e=>setCredentials({...credentials,password:e.target.value})}/>
    <button disabled={busy} className="bg-blue-500 text-white p-2 w-full rounded">Se connecter</button>
  </form></div>;
};
export default Login;
