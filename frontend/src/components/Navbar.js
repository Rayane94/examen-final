import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
const Navbar = () => {
  const navigate = useNavigate();
  const { cart } = useCart();
  const { user, logout } = useAuth();
  const handleLogout = async () => { await logout(); navigate('/login'); };
  return <nav className="bg-blue-500 text-white p-4 flex justify-between items-center">
    <Link to="/" className="text-xl font-bold">Mon Application</Link>
    <div className="flex items-center space-x-4">
      {user && <span>Bonjour, {user.username}</span>}
      {user?.role === 'admin' && <Link to="/admin">Administration</Link>}
      <Link to="/cart">Panier ({cart.reduce((n, i) => n + i.quantity, 0)})</Link>
      {user ? <button onClick={handleLogout}>Déconnexion</button> : <><Link to="/login">Connexion</Link><Link to="/register">Inscription</Link></>}
    </div>
  </nav>;
};
export default Navbar;
