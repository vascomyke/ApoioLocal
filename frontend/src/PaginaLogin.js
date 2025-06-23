import React, { useState } from 'react';
import './PaginaLogin.css';
import { User } from 'lucide-react';

const PaginaLogin = ({ onNavigate, onLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();

    // Simulação de login (usar API real em produção)
    const userData = {
      nome: 'Utilizador',
      email: email
    };

    onLogin(userData);
    onNavigate('dashboard');
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
