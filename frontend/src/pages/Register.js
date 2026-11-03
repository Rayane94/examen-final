import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
const Register = () => {
  const [formData, setFormData] = useState({ username:'',email:'',password:'' });
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const submit = async e => {
    e.preventDefault();setError('');
    try { await api.post('/auth/register', formData); navigate('/login'); }
    catch (err) {setError(err.response?.data?.message || 'Inscription impossible');}
  };
  return <div className="flex justify-center items-center min-h-screen"><form onSubmit={submit} className="bg-white p-6 rounded shadow-md w-80">
    <h2 className="text-2xl font-bold mb-4">Inscription</h2>
    {error && <p role="alert" className="text-red-600 mb-4">{error}</p>}
    <input required minLength={3} maxLength={30} aria-label="Nom d'utilisateur" placeholder="Nom d'utilisateur" className="border p-2 w-full mb-4" value={formData.username} onChange={e=>setFormData({...formData,username:e.target.value})}/>
    <input required type="email" aria-label="Email" placeholder="Email" className="border p-2 w-full mb-4" value={formData.email} onChange={e=>setFormData({...formData,email:e.target.value})}/>
    <input required type="password" minLength={8} maxLength={128} aria-label="Mot de passe" placeholder="Mot de passe (8 caractères minimum)" className="border p-2 w-full mb-4" value={formData.password} onChange={e=>setFormData({...formData,password:e.target.value})}/>
    <button className="bg-blue-500 text-white p-2 w-full rounded">S'inscrire</button>
  </form></div>;
};
export default Register;
