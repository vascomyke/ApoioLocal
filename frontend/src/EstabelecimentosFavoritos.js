import React from 'react';
import './EstabelecimentosFavoritos.css';

const EstabelecimentosFavoritos = ({ onNavigate, favoritos, onToggleFavorito }) => {
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
                <h3>{estab.nome || estab.nomeEstabelecimento}</h3>
                <p><strong>Tipo:</strong> {estab.tipo || estab.tipoEstabelecimento}</p>
                <p><strong>Localização:</strong> {estab.localizacao || `${estab.ruaNumero}, ${estab.codigoPostal}`}</p>
                <button onClick={() => onToggleFavorito(estab)}>Remover dos Favoritos</button>
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
