import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import PaginaInicial from './PaginaInicial';
import PaginaLogin from './PaginaLogin';
import PaginaRegisto from './PaginaRegisto';
import DashboardUtilizador from './DashboardUtilizador';
import RegistarEstabelecimento from './RegistarEstabelecimento';
import VerEstabelecimentos from './VerEstabelecimentos';
import GerirEstabelecimentos from './GerirEstabelecimentos';
import EstabelecimentosFavoritos from './EstabelecimentosFavoritos';

// Main App component that handles routing
const AppContent = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [favoritos, setFavoritos] = useState([]);

  // Convert URL path to page name for consistency with your existing logic
  const getPageFromPath = (path) => {
    const pathMap = {
      '/': 'home',
      '/login': 'login',
      '/registar': 'registar',
      '/dashboard': 'dashboard',
      '/registar-estabelecimento': 'registarEstabelecimento',
      '/estabelecimentos': 'verEstabelecimentos',
      '/gerir-estabelecimentos': 'gerirEstabelecimentos',
      '/favoritos': 'favoritos'
    };
    return pathMap[path] || 'home';
  };

  // Convert page name to URL path
  const getPathFromPage = (page) => {
    const pageMap = {
      'home': '/',
      'login': '/login',
      'registar': '/registar',
      'dashboard': '/dashboard',
      'registarEstabelecimento': '/registar-estabelecimento',
      'verEstabelecimentos': '/estabelecimentos',
      'gerirEstabelecimentos': '/gerir-estabelecimentos',
      'favoritos': '/favoritos'
    };
    return pageMap[page] || '/';
  };

// Initialize user and token from localStorage on first render
  useEffect(() => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  if (token && user) {
    setUser(JSON.parse(user));
  }
}, []);

  const handleNavigation = (page) => {
    const path = getPathFromPage(page);
    navigate(path);
  };

  const handleLogin = (userData) => {
    setUser(userData);
    navigate('/dashboard');
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/');
  };

  const toggleFavorito = (estab) => {
    const existe = favoritos.some((e) => e.id === estab.id);
    setFavoritos((prev) =>
      existe ? prev.filter((e) => e.id !== estab.id) : [...prev, estab]
    );
  };

  const handleRegistarEstabelecimento = (novo) => {
    setEstabelecimentos((prev) => [...prev, novo]);
    navigate('/gerir-estabelecimentos');
  };

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      navigate('/login');
      return null;
    }
    return children;
  };

  return (
    <div className="App">
      <Routes>
        <Route 
          path="/" 
          element={<PaginaInicial onNavigate={handleNavigation} />} 
        />
        
        <Route 
          path="/login" 
          element={<PaginaLogin onNavigate={handleNavigation} onLogin={handleLogin} />} 
        />
        
        <Route 
          path="/registar" 
          element={<PaginaRegisto onNavigate={handleNavigation} onLogin={handleLogin} />} 
        />
        
        <Route 
          path="/dashboard" 
          element={
            <ProtectedRoute>
              <DashboardUtilizador
                user={user}
                onNavigate={handleNavigation}
                onLogout={handleLogout}
              />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/registar-estabelecimento" 
          element={
            <ProtectedRoute>
              <RegistarEstabelecimento
                onNavigate={handleNavigation}
                onRegistar={handleRegistarEstabelecimento}
              />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/estabelecimentos" 
          element={
            <ProtectedRoute>
              <VerEstabelecimentos
                onNavigate={handleNavigation}
                favoritos={favoritos}
                onToggleFavorito={toggleFavorito}
              />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/gerir-estabelecimentos" 
          element={
            <ProtectedRoute>
              <GerirEstabelecimentos
                onNavigate={handleNavigation}
                estabelecimentos={estabelecimentos}
                favoritos={favoritos}
                onToggleFavorito={toggleFavorito}
              />
            </ProtectedRoute>
          } 
        />
        
        <Route 
          path="/favoritos" 
          element={
            <ProtectedRoute>
              <EstabelecimentosFavoritos
                onNavigate={handleNavigation}
                favoritos={favoritos}
                onToggleFavorito={toggleFavorito}
              />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </div>
  );
};

// Wrapper component with Router
const App = () => {
  return (
    <Router>
      <AppContent />
    </Router>
  );
};

export default App;