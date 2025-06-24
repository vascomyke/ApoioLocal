import React, { useState, useEffect } from 'react';
import './GerirEstabelecimentos.css';

const GerirEstabelecimentos = ({ onNavigate, estabelecimentos, favoritos, onToggleFavorito }) => {
  const [estabs, setEstabs] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    setEstabs(estabelecimentos || []);
  }, [estabelecimentos]);

  const removerEstab = (id) => {
    setEstabs(estabs.filter((e) => e.id !== id));
  };

  const handleEditClick = (estab) => {
    setEditId(estab.id);
    setEditData(estab);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setEditData({ ...editData, [name]: value });
  };

  const guardarEdicao = () => {
    setEstabs(estabs.map((e) => (e.id === editId ? editData : e)));
    setEditId(null);
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
              const isEditing = estab.id === editId;

              return (
                <div key={estab.id} className="gerir-card">
                  <h3>
                    {isEditing ? (
                      <input
                        name="nomeEstabelecimento"
                        value={editData.nomeEstabelecimento}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <>
                        {estab.nomeEstabelecimento}
                        <button className="fav-btn" onClick={() => onToggleFavorito(estab)}>
                          {isFav ? '⭐' : '☆'}
                        </button>
                      </>
                    )}
                  </h3>

                  <p>
                    <strong>Tipo:</strong>{' '}
                    {isEditing ? (
                      <input name="tipoEstabelecimento" value={editData.tipoEstabelecimento} onChange={handleInputChange} />
                    ) : (
                      estab.tipoEstabelecimento
                    )}
                  </p>

                  <p>
                    <strong>Localização:</strong>{' '}
                    {isEditing ? (
                      <>
                        <input name="ruaNumero" value={editData.ruaNumero} onChange={handleInputChange} />
                        <input name="codigoPostal" value={editData.codigoPostal} onChange={handleInputChange} />
                      </>
                    ) : (
                      `${estab.ruaNumero}, ${estab.codigoPostal}`
                    )}
                  </p>

                  <div className="botoes">
                    {isEditing ? (
                      <button className="btn-editar" onClick={guardarEdicao}>Guardar</button>
                    ) : (
                      <button className="btn-editar" onClick={() => handleEditClick(estab)}>Editar</button>
                    )}
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
