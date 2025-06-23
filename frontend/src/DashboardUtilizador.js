import React from 'react';
import './DashboardUtilizador.css';

const DashboardUtilizador = ({ user, onNavigate, onLogout }) => {
  return (
    <div className="dashboard-container">
      <div className="dashboard-box">
        <h2>Bem-vindo, {user?.nome || 'Utilizador'}!</h2>
        <div className="dashboard-buttons">
          <button onClick={() => onNavigate('verEstabelecimentos')}>Ver Todos os Estabelecimentos</button>
          <button onClick={() => onNavigate('registarEstabelecimento')}>Registar Estabelecimento</button>
          <button onClick={() => onNavigate('gerirEstabelecimentos')}>Gerir Estabelecimentos</button>
          <button onClick={() => onNavigate('favoritos')}>Estabelecimentos Favoritos</button>
          <button className="logout" onClick={onLogout}>Logout</button>
        </div>
      </div>
    </div>
  );
};

export default DashboardUtilizador;
