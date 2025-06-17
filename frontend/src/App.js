import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import PaginaInicial from './PaginaInicial';
import PaginaLogin from './PaginaLogin';
import PaginaRegisto from './PaginaRegisto';

function App() {
  return (
    <Router>
      <nav style={{ padding: '10px', background: '#f0f0f0' }}>
        <Link to="/" style={{ marginRight: '10px' }}>Início</Link>
        <Link to="/login" style={{ marginRight: '10px' }}>Entrar</Link>
        <Link to="/registar">Registar</Link>
      </nav>

      <Routes>
        <Route path="/" element={<PaginaInicial />} />
        <Route path="/login" element={<PaginaLogin />} />
        <Route path="/registar" element={<PaginaRegisto />} />
      </Routes>
    </Router>
  );
}

export default App;
