import React, { useState } from 'react';
import PaginaInicial from './PaginaInicial';
import PaginaLogin from './PaginaLogin';
import PaginaRegisto from './PaginaRegisto';
import DashboardUtilizador from './DashboardUtilizador'; // ✅ novo import

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    setCurrentPage('dashboard'); // opcional: navega logo para dashboard
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
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

      default:
        return <PaginaInicial onNavigate={handleNavigation} />;
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
};

export default App;
