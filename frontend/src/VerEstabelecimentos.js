import React, { useState, useEffect } from 'react';
import './VerEstabelecimentos.css';

const VerEstabelecimentos = ({ onNavigate, favoritos, onToggleFavorito }) => {
  const [estabelecimentos, setEstabelecimentos] = useState([]);
  const [verMaisId, setVerMaisId] = useState(null);

  useEffect(() => {
    fetch('http://localhost:3001/api/businesses')
      .then(res => res.json())
      .then(data => setEstabelecimentos(Array.isArray(data.data) ? data.data : []))
      .catch(() => setEstabelecimentos([]));
  }, []);
  const toggleVerMais = (id) => {
    setVerMaisId(verMaisId === id ? null : id);
  };



  return (
    <div className="estabs-container">
      <div className="estabs-box">
        <h2>Todos os Estabelecimentos</h2>
        <div className="estab-lista">
          {estabelecimentos.map((estab) => {
            const isFav = favoritos.some((f) => f.id === estab.id);
            const mostrarDetalhes = verMaisId === estab.id;

            return (
              <div key={estab.id} className="estab-card">
                <h3>
                  {estab.name}{' '}
                  <button className="fav-btn" onClick={() => onToggleFavorito(estab)}>
                    {isFav ? '⭐' : '☆'}
                  </button>
                </h3>
                <p><strong>Tipo:</strong> { estab.category}</p>
                <p><strong>Localização:</strong> {estab.address}</p>

                {mostrarDetalhes && (
                  <div className="detalhes">
                    <p><strong>Descrição:</strong> {estab.descricao}</p>
                    <p><strong>Email:</strong> {estab.emailEmpresa}</p>
                    <p><strong>Telemóvel:</strong> {estab.telemovelEmpresa}</p>
                    <p><strong>Website:</strong> <a href={estab.site} target="_blank" rel="noreferrer">{estab.site}</a></p>
                  </div>
                )}

                <button onClick={() => toggleVerMais(estab.id)}>
                  {mostrarDetalhes ? 'Ver menos' : 'Ver mais'}
                </button>
              </div>
            );
          })}
        </div>
        <button className="voltar-btn" onClick={() => onNavigate('dashboard')}>Voltar</button>
      </div>
    </div>
  );
};



export default VerEstabelecimentos;