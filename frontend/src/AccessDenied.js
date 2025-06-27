import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AccessDenied = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to home after 2 seconds
    const timer = setTimeout(() => {
      navigate('/');
    }, 8000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div style={{ textAlign: 'center', marginTop: '3rem' }}>
      <h2>Acesso negado</h2>
      <p>Por favor, faça login para aceder a esta página.</p>
      <p>Redirecionando para a página inicial...</p>
    </div>
  );
};

export default AccessDenied;