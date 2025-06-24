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

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    setFormData({
      ...formData,
      [name]: files ? files[0] : value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const novoEstabelecimento = {
      id: Date.now(),
      ...formData
    };
    onRegistar(novoEstabelecimento); // ✅ agora funciona
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
          <input type="url" name="site" onChange={handleChange} />

          <label>Descrição</label>
          <textarea name="descricao" rows="3" onChange={handleChange}></textarea>

          <label>Fotos (simulado)</label>
          <input type="file" name="fotos" accept="image/*" onChange={handleChange} />

          <button type="submit" className="btn-primary">Registar</button>
          <button type="button" className="btn-secondary" onClick={() => onNavigate('dashboard')}>Voltar</button>
        </form>
      </div>
    </div>
  );
};

export default RegistarEstabelecimento;
