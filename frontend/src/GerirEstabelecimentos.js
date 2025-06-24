import React, { useState, useEffect } from 'react';
import './GerirEstabelecimentos.css';

const GerirEstabelecimentos = ({ onNavigate, estabelecimentos, favoritos, onToggleFavorito }) => {
  const [estabs, setEstabs] = useState([]);

  useEffect(() => {
    setEstabs(estabelecimentos || []);
  }, [estabelecimentos]);

  const removerEstab = (id) => {
    setEstabs(estabs.filter((e) => e.id !== id));
  };

  const editarEstab = (id) => {
    alert(`Função de edição simulada para ID ${id}`);
  };

  return (
    <div className="gerir-container">
      <div className="gerir-box">
        <h2>Meus Estabelecimentos</h2>

        {estabs.length === 0 ? (
          <p className="nenhum">Não tem estabelecimentos registados.</p>
        ) : (
          <div className="gerir-lista">
            {estabs.map((estab) => {
              const isFav = favoritos.some((f) => f.id === estab.id);
              return (
                <div key={estab.id} className="gerir-card">
                  <h3>
                    {estab.nomeEstabelecimento}{' '}
                    <button className="fav-btn" onClick={() => onToggleFavorito(estab)}>
                      {isFav ? '⭐' : '☆'}
                    </button>
                  </h3>
                  <p><strong>Tipo:</strong> {estab.tipoEstabelecimento}</p>
                  <p><strong>Localização:</strong> {estab.ruaNumero}, {estab.codigoPostal}</p>
                  <div className="botoes">
                    <button className="btn-editar" onClick={() => editarEstab(estab.id)}>Editar</button>
                    <button className="btn-remover" onClick={() => removerEstab(estab.id)}>Remover</button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <button className="btn-voltar" onClick={() => onNavigate('dashboard')}>Voltar</button>
      </div>
    </div>
  );
};

export default GerirEstabelecimentos;
