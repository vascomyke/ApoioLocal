import React, { useState } from 'react';
import './PaginaLogin.css';
import { User } from 'lucide-react';

const PaginaLogin = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch('http://localhost:3001/api/users/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();

      if (response.ok && data.success) {
        // Save token if needed: localStorage.setItem('token', data.data.token);
        onLogin(data.data.user); // Pass user data to parent
        onNavigate('dashboard');
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
          Não tem conta?
          <button onClick={() => onNavigate('registar')}>
            Registar
          </button>
        </div>
      </div>
    </div>
  );
};

export default PaginaLogin;
