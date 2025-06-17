import React, { useState } from 'react';
import PaginaInicial from './PaginaInicial';
import PaginaLogin from './PaginaLogin';
import PaginaRegistro from './PaginaRegistro';
// Importar outras páginas quando criadas

const App = () => {
  const [currentPage, setCurrentPage] = useState('home');
  const [user, setUser] = useState(null);

  const handleNavigation = (page) => {
    setCurrentPage(page);
  };

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('home');
  };

  const renderPage = () => {
    switch (currentPage) {
      case 'home':
        return (
          <PaginaInicial 
            onNavigate={handleNavigation}
          />
        );
      
      case 'login':
        return (
          <PaginaLogin 
            onNavigate={handleNavigation}
            onLogin={handleLogin}
          />
        );
      
      case 'registar':
        return (
          <PaginaRegistro 
            onNavigate={handleNavigation}
            onLogin={handleLogin}
          />
        );
      
      case 'dashboard':
        // Implementar Dashboard quando criado
        return user ? (
          <div className="min-h-screen bg-gray-50 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold mb-4">Dashboard</h1>
              <p className="mb-4">Bem-vindo, {user.nome}!</p>
              <button 
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Logout
              </button>
            </div>
          </div>
        ) : (
          <PaginaInicial onNavigate={handleNavigation} />
        );
      
      default:
        return (
          <PaginaInicial 
            onNavigate={handleNavigation}
          />
        );
    }
  };

  return (
    <div className="App">
      {renderPage()}
    </div>
  );
};

export default App;
