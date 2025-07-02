import React, { useState } from 'react';
import './RegistarEstabelecimento.css';

const RegistarEstabelecimento = ({ onNavigate, onRegistar }) => {
  const [formData, setFormData] = useState({
    nomeEstabelecimento: '',
    tipoEstabelecimento: '',
    ruaNumero: '',
    codigoPostal: '',
    telemovelEmpresa: '',
    emailEmpresa: '',
    site: '',
    descricao: '',
    fotos: null
  });

  const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Get user from localStorage
    const user = JSON.parse(localStorage.getItem('user'));

    // Prepare the payload to match your backend's expected fields
    const payload = {
      name: formData.nomeEstabelecimento,
      category: formData.tipoEstabelecimento,
      address: formData.ruaNumero,
      postalCode: formData.codigoPostal,
      phone: formData.telemovelEmpresa,
      email: formData.emailEmpresa,
      website: formData.site,
      description: formData.descricao,
      images: [], // You can handle file uploads later if needed
      userId: user.id // Attach the user ID
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/businesses`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        alert('Estabelecimento registado com sucesso!');
        if (typeof onRegistar === 'function') {
          onRegistar(data.data); // Optionally update parent state
        }
        onNavigate('dashboard'); // Navigate to dashboard
      } else {
        alert(data.message || 'Erro ao registar estabelecimento.');
      }
    } catch (error) {
      alert('Erro de ligação ao servidor.');
    }
  };

  return (
    <div className="estabelecimento-container">
      <div className="estabelecimento-box">
        <h2>Registar Estabelecimento</h2>
        <form onSubmit={handleSubmit}>
          <label>Nome do Estabelecimento*</label>
          <input type="text" name="nomeEstabelecimento" required onChange={handleChange} />

          <label>Tipo de Estabelecimento*</label>
          <select name="tipoEstabelecimento" required onChange={handleChange}>
            <option value="">Selecione</option>
            <option value="Restaurante">Restaurante</option>
            <option value="Loja">Loja</option>
            <option value="Serviço">Serviço</option>
            <option value="Café">Café</option>
            <option value="Bar">Bar</option>
            <option value="Supermercado">Supermercado</option>
            <option value="Padaria">Padaria</option>
            <option value="Talho">Talho</option>
            <option value="Farmácia">Farmácia</option>
            <option value="Clínica">Clínica</option>
            <option value="Ginásio">Ginásio</option>
            <option value="Hotel">Hotel</option>
            <option value="Papelaria">Papelaria</option>
            <option value="Lavandaria">Lavandaria</option>
            <option value="Outro">Outro</option>
          </select>

          <label>Rua e Número*</label>
          <input type="text" name="ruaNumero" required onChange={handleChange} />

          <label>Código Postal*</label>
          <input type="text" name="codigoPostal" required onChange={handleChange} />

          <label>Telemóvel da Empresa*</label>
          <input type="tel" name="telemovelEmpresa" required onChange={handleChange} />

          <label>Email Empresarial*</label>
          <input type="email" name="emailEmpresa" required onChange={handleChange} />

          <label>Website</label>
          <input
            type="url"
            name="site"
            onChange={handleChange}
            aria-describedby="websiteHint"
          />
          <small id="websiteHint" className="input-hint" style={{ display: 'block', marginTop: '0px', marginBottom: '10px' }}>
            Introduz um website válido, incluindo o protocolo (e.g., https://...).
          </small>

          <label>Descrição</label>
          <textarea name="descricao" rows="3" onChange={handleChange}></textarea>

          <label>Fotos </label>
          <input type="file" name="fotos" accept="image/*" onChange={handleChange} />

          <button type="submit" className="btn-primary">Registar</button>
          <button type="button" className="btn-secondary" onClick={() => onNavigate('dashboard')}>Voltar</button>
        </form>
      </div>
    </div>
  );
};

export default RegistarEstabelecimento;
