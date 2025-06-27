import React, { useState, useEffect } from 'react';
import './GerirEstabelecimentos.css';

const GerirEstabelecimentos = ({ onNavigate, favoritos, onToggleFavorito }) => {
  const [estabs, setEstabs] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      fetch(`http://localhost:3001/api/businesses/user/${user.id}`)
        .then(res => res.json())
        .then(data => setEstabs(Array.isArray(data.data) ? data.data : []))
        .catch(() => setEstabs([]));
    }
  }, []);

  const removerEstab = async (id) => {
    try {
      const response = await fetch(`http://localhost:3001/api/businesses/${id}`, {
        method: 'DELETE'
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setEstabs(estabs.filter((e) => e.id !== id));
      } else {
        alert(data.message || 'Erro ao remover estabelecimento.');
      }
    } catch (error) {
      alert('Erro de ligação ao servidor.');
    }
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
    // Optionally, call your backend to update the business as well
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
                        name="name"
                        value={editData.name}
                        onChange={handleInputChange}
                      />
                    ) : (
                      <>
                        {estab.name}
                        <button className="fav-btn" onClick={() => onToggleFavorito(estab)}>
                          {isFav ? '⭐' : '☆'}
                        </button>
                      </>
                    )}
                  </h3>

                  <p>
                    <strong>Tipo:</strong>{' '}
                    {isEditing ? (
                      <input name="category" value={editData.category} onChange={handleInputChange} />
                    ) : (
                      estab.category
                    )}
                  </p>

                  <p>
                    <strong>Localização:</strong>{' '}
                    {isEditing ? (
                      <>
                        <input name="address" value={editData.address} onChange={handleInputChange} />
                        <input name="postalCode" value={editData.postalCode} onChange={handleInputChange} />
                      </>
                    ) : (
                      `${estab.address}, ${estab.postalCode || ''}`
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