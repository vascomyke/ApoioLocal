import React, { useEffect, useState } from 'react';
import './EstabelecimentosFavoritos.css';

const EstabelecimentosFavoritos = ({ onNavigate, onToggleFavorito }) => {
  const [favoritos, setFavoritos] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;

    fetch('http://localhost:3001/api/favorites', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => setFavoritos(Array.isArray(data.data) ? data.data : []))
      .catch(() => setFavoritos([]));
  }, []);

  const removerFavorito = async (estab) => {
    const token = localStorage.getItem('token');
    if (!token) return;

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
  };

  return (
    <div className="fav-container">
      <div className="fav-box">
        <h2>Estabelecimentos Favoritos</h2>
        {favoritos.length === 0 ? (
          <p className="sem-favoritos">Não tem estabelecimentos favoritos neste momento.</p>
        ) : (
          <div className="fav-lista">
            {favoritos.map((estab) => (
              <div key={estab.id} className="fav-card">
                <h3>{estab.name}</h3>
                <p><strong>Tipo:</strong> {estab.category}</p>
                <p><strong>Localização:</strong> {estab.address}</p>
                <button onClick={() => removerFavorito(estab)}>Remover dos Favoritos</button>
              </div>
            ))}
          </div>
        )}
        <button className="btn-voltar" onClick={() => onNavigate('dashboard')}>Voltar</button>
      </div>
    </div>
  );
};

export default EstabelecimentosFavoritos;