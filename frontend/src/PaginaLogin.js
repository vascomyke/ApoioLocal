import React, { useState } from 'react';
import './PaginaLogin.css';
import { User, ArrowLeft } from 'lucide-react';

const PaginaLogin = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_BASE_URL}/api/users/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save token if needed: localStorage.setItem('token', data.data.token);
        onLogin(data.data.user); // Pass user data to parent
        onNavigate('dashboard');

        // When login is successful
        const expireTime = 7 * 24 * 60 * 60 * 1000;
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data.user));
        localStorage.setItem('loginExpiry', Date.now() + expireTime);
      } else {
        alert(data.message || 'Credenciais inválidas.');
      }
    } catch (error) {
      alert('Erro de ligação ao servidor.');
    }
  };

  return (
    <div className="login-container">
      <div className="login-box">
        <User size={48} style={{ color: '#5a67d8', marginBottom: '1rem' }} />
        <h2>Entrar</h2>
        <p>Aceda à sua conta para continuar</p>

        <form onSubmit={handleSubmit}>
          <label className="input-label">Email</label>
          <input
            type="email"
            className="input-field"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label className="input-label">Palavra-passe</label>
          <input
            type="password"
            className="input-field"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" className="login-button">
            Entrar
          </button>
        </form>

        <div className="login-footer">
          <span>Não tem conta? </span>
          <button onClick={() => onNavigate('registar')} className="text-link">
            Registar
          </button>
        </div>

        <button
          type="button"
          className="back-button"
          onClick={() => onNavigate('home')}
        >
          <ArrowLeft size={16} style={{ marginRight: '0.5rem' }} />
          Voltar
        </button>
      </div>
    </div>
  );
};

export default PaginaLogin;
