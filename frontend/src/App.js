import React, { useState } from 'react';
import PaginaInicial from './PaginaInicial';
import PaginaLogin from './PaginaLogin';
import PaginaRegisto from './PaginaRegisto';
import DashboardUtilizador from './DashboardUtilizador';
import RegistarEstabelecimento from './RegistarEstabelecimento';
import VerEstabelecimentos from './VerEstabelecimentos';
import GerirEstabelecimentos from './GerirEstabelecimentos';
import EstabelecimentosFavoritos from './EstabelecimentosFavoritos';

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const toggleFavorito = (estab) => {
    const existe = favoritos.some((e) => e.id === estab.id);
    setFavoritos((prev) =>
      existe ? prev.filter((e) => e.id !== estab.id) : [...prev, estab]
    );
  };

  const handleRegistarEstabelecimento = (novo) => {
    setEstabelecimentos((prev) => [...prev, novo]);
    setCurrentPage('gerirEstabelecimentos');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return <PaginaInicial onNavigate={handleNavigation} />;

      case 'login':
        return <PaginaLogin onNavigate={handleNavigation} onLogin={handleLogin} />;

      case 'registar':
        return <PaginaRegisto onNavigate={handleNavigation} onLogin={handleLogin} />;

      case 'dashboard':
        return user ? (
          <DashboardUtilizador
            user={user}
            onNavigate={handleNavigation}
            onLogout={handleLogout}
          />
        ) : (
          <PaginaInicial onNavigate={handleNavigation} />
        );

      case 'registarEstabelecimento':
        return (
          <RegistarEstabelecimento
            onNavigate={handleNavigation}
            onRegistar={handleRegistarEstabelecimento}
          />
        );

      case 'verEstabelecimentos':
        return (
          <VerEstabelecimentos
            onNavigate={handleNavigation}
            favoritos={favoritos}
            onToggleFavorito={toggleFavorito}
          />
        );

      case 'gerirEstabelecimentos':
        return (
          <GerirEstabelecimentos
            onNavigate={handleNavigation}
            estabelecimentos={estabelecimentos}
            favoritos={favoritos}
            onToggleFavorito={toggleFavorito}
          />
        );

      case 'favoritos':
        return (
          <EstabelecimentosFavoritos
            onNavigate={handleNavigation}
            favoritos={favoritos}
            onToggleFavorito={toggleFavorito}
          />
        );

      default:
        return <PaginaInicial onNavigate={handleNavigation} />;
    }
  };

  return <div className="App">{renderPage()}</div>;
};

export default App;
