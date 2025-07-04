import React, { useState, useEffect } from 'react';
import './GerirEstabelecimentos.css';

const GerirEstabelecimentos = ({ onNavigate, favoritos, onToggleFavorito }) => {
  const [estabs, setEstabs] = useState([]);
  const [editId, setEditId] = useState(null);
  const [editData, setEditData] = useState({});

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  useEffect(() => {
    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.id) {
      fetch(`${API_BASE_URL}/api/businesses/user/${user.id}`)
        .then(res => res.json())
        .then(data => setEstabs(Array.isArray(data.data) ? data.data : []))
        .catch(() => setEstabs([]));
    }
  }, []);

  const removerEstab = async (id) => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/businesses/${id}`, {
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
    setEditData((prev) => ({ ...prev, [name]: value }));
  };

  const guardarEdicao = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/businesses/${editId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: editData.name,
          category: editData.category,
          address: editData.address,
          postalCode: editData.postalCode,
          phone: editData.phone,
          email: editData.email,
          website: editData.website,
          description: editData.description,
        }),
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setEstabs(estabs.map((e) => (e.id === editId ? data.data : e)));
        setEditId(null);
      } else {
        alert(data.message || 'Erro ao atualizar estabelecimento.');
      }
    } catch (error) {
      alert('Erro de ligação ao servidor.');
    }
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
              const isEditing = editId === estab.id;
              const isFav = favoritos.some((f) => f.id === estab.id);

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

                  {isEditing ? (
                    <>
                      <p>
                        <strong>Telemóvel:</strong>{' '}
                        <input
                          name="phone"
                          value={editData.phone}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <strong>Email:</strong>{' '}
                        <input
                          name="email"
                          value={editData.email}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <strong>Website:</strong>{' '}
                        <input
                          name="website"
                          value={editData.website}
                          onChange={handleInputChange}
                        />
                      </p>
                      <p>
                        <strong>Descrição:</strong>{' '}
                        <textarea
                          name="description"
                          value={editData.description}
                          onChange={handleInputChange}
                          className="textarea-grande"
                        />
                      </p>
                    </>
                  ) : (
                    <>
                      <p><strong>Telemóvel:</strong> {estab.phone}</p>
                      <p><strong>Email:</strong> {estab.email}</p>
                      <p><strong>Website:</strong> {estab.website}</p>
                      <p><strong>Descrição:</strong> {estab.description}</p>
                    </>
                  )}

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