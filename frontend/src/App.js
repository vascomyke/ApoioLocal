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
import AccessDenied from './AccessDenied';

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
    const expiry = localStorage.getItem('loginExpiry');
    if (token && user && expiry && Date.now() < Number(expiry)) {
      setUser(JSON.parse(user));
    } else {
      // Expired or missing, clear storage
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      localStorage.removeItem('loginExpiry');
      setUser(null);
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
    localStorage.removeItem('loginExpiry');
    navigate('/');
  };

  const handleRegistarEstabelecimento = (novo) => {
    setEstabelecimentos((prev) => [...prev, novo]);
    navigate('/gerir-estabelecimentos');
  };

  

  const toggleFavorito = async (estab) => {
    const token = localStorage.getItem('token');
    if (!token) {
      alert('É necessário estar autenticado para favoritar.');
      return;
    }
    const isFav = favoritos.some((f) => f.id === estab.id);

    try {
      if (isFav) {
        // Remove from favorites
        const response = await fetch(`http://localhost:3001/api/favorites/${estab.id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setFavoritos(favoritos.filter((f) => f.id !== estab.id));
        } else {
          alert(data.message || 'Erro ao remover dos favoritos.');
        }
      } else {
        // Add to favorites
        const response = await fetch(`http://localhost:3001/api/favorites/${estab.id}`, {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok && data.success) {
          setFavoritos([...favoritos, estab]);
        } else {
          alert(data.message || 'Erro ao adicionar aos favoritos.');
        }
      }
    } catch (error) {
      alert('Erro de ligação ao servidor.');
    }
  };

  // Protected route wrapper
  const ProtectedRoute = ({ children }) => {
    if (!user) {
      return <AccessDenied />;
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