import React, { useState } from 'react';
import './VerEstabelecimentos.css';

const estabelecimentosExemplo = [
  { id: 1, nome: 'Restaurante Central', tipo: 'Restaurante', localizacao: 'Rua A, nº 12', descricao: 'Comida tradicional portuguesa' },
  { id: 2, nome: 'Loja do Bairro', tipo: 'Loja', localizacao: 'Av. da Liberdade, nº 45', descricao: 'Produtos locais e artesanato' },
  { id: 3, nome: 'Serviços 24h', tipo: 'Serviço', localizacao: 'Rua das Flores, nº 9', descricao: 'Assistência técnica' }
];

const VerEstabelecimentos = ({ onNavigate, favoritos, onToggleFavorito }) => {
  const [verMaisId, setVerMaisId] = useState(null);

  return (
    <div className="estabs-container">
      <div className="estabs-box">
        <h2>Todos os Estabelecimentos</h2>
        <div className="estab-lista">
          {estabelecimentosExemplo.map((estab) => {
            const isFav = favoritos.some((f) => f.id === estab.id);
            const mostrarDetalhes = verMaisId === estab.id;

            return (
              <div key={estab.id} className="estab-card">
                <h3>
                  {estab.nome}{' '}
                  <button className="fav-btn" onClick={() => onToggleFavorito(estab)}>
                    {isFav ? '⭐' : '☆'}
                  </button>
                </h3>
                <p><strong>Tipo:</strong> {estab.tipo}</p>
                <p><strong>Localização:</strong> {estab.localizacao}</p>

                {mostrarDetalhes && (
                  <div className="detalhes">
                    <p><strong>Descrição:</strong> {estab.descricao}</p>
                    {/* Podes adicionar mais campos aqui */}
                  </div>
                )}

                <button onClick={() => setVerMaisId(estab.id)}>Ver mais</button>
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
