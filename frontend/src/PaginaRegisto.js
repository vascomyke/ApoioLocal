import React, { useState } from 'react';
import './PaginaRegisto.css';
import { Users, ArrowLeft } from 'lucide-react';

const PaginaRegisto = ({ onNavigate, onLogin }) => {
  const [formData, setFormData] = useState({
    nomeUtilizador: '',
    emailUtilizador: '',
    password: '',
    dataNascimento: '',
    nacionalidade: '',
    genero: '',
    telemovel: '',
    souResidente: false
  });

  const [mostrarSenha, setMostrarSenha] = useState(false);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      nome: formData.nomeUtilizador,
      email: formData.emailUtilizador,
      password: formData.password,
      dataNascimento: formData.dataNascimento,
      nacionalidade: formData.nacionalidade,
      genero: formData.genero,
      telemovel: formData.telemovel,
      souResidente: formData.souResidente
    };

    try {
      const response = await fetch('http://localhost:3001/api/users/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        onLogin(data.user || payload);
        onNavigate('dashboard');
      } else {
        alert(data.message || 'Erro ao registar utilizador.');
      }
    } catch (error) {
      alert('Erro de ligação ao servidor.');
    }
  };

  return (
    <div className="registo-container">
      <div className="registo-box">
        <div className="text-center mb-8">
          <Users className="mx-auto mb-4 text-indigo-600" size={48} />
          <h2 className="text-3xl font-extrabold text-gray-800">Crie a sua conta</h2>
          <p className="text-gray-600 mt-2">Preencha os seus dados para se registar</p>
        </div>

        <form onSubmit={handleSubmit} className="form-registo">
          <div className="form-grid">
            <div>
              <label className="input-label">Nome Completo *</label>
              <input
                type="text"
                name="nomeUtilizador"
                value={formData.nomeUtilizador}
                onChange={handleInputChange}
                className="input-field"
                placeholder="João Silva"
                required
              />
            </div>

            <div>
              <label className="input-label">Email *</label>
              <input
                type="email"
                name="emailUtilizador"
                value={formData.emailUtilizador}
                onChange={handleInputChange}
                className="input-field"
                placeholder="joao@email.com"
                required
              />
            </div>

            <div>
              <label className="input-label">Password *</label>
              <div className="campo-senha">
                <input
                  type={mostrarSenha ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="input-field"
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  className="btn-ver"
                  onClick={() => setMostrarSenha(!mostrarSenha)}
                >
                  {mostrarSenha ? 'Ocultar' : 'Mostrar'}
                </button>
              </div>
            </div>

            <div>
              <label className="input-label">Data de Nascimento *</label>
              <input
                type="date"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleInputChange}
                className="input-field"
                required
              />
            </div>

            <div>
              <label className="input-label">Nacionalidade *</label>
              <select
                name="nacionalidade"
                value={formData.nacionalidade}
                onChange={handleInputChange}
                className="select-field"
                required
              >
                <option value="">Selecione</option>
                <option value="Portuguesa">Portuguesa</option>
                <option value="Britânica">Britânica</option>
                <option value="Estadunidense">Estadunidense</option>
                <option value="Canadiana">Canadiana</option>
                <option value="Australiana">Australiana</option>
                <option value="Francesa">Francesa</option>
                <option value="Espanhola">Espanhola</option>
                <option value="Alemã">Alemã</option>
                <option value="Brasileira">Brasileira</option>
                <option value="Japonesa">Japonesa</option>
                <option value="Chinesa">Chinesa</option>
                <option value="Indiana">Indiana</option>
                <option value="Mexicana">Mexicana</option>
                <option value="Argentina">Argentina</option>
                <option value="Sul-Africana">Sul-Africana</option>
                <option value="Egípcia">Egípcia</option>
                <option value="Coreana">Coreana</option>
                <option value="Italiana">Italiana</option>
                <option value="Sueca">Sueca</option>
                <option value="Norueguesa">Norueguesa</option>
                <option value="Neozelandesa">Neozelandesa</option>
                <option value="Singapurense">Singapurense</option>
                <option value="Outra">Outra</option>
              </select>
            </div>

            <div>
              <label className="input-label">Género *</label>
              <select
                name="genero"
                value={formData.genero}
                onChange={handleInputChange}
                className="select-field"
                required
              >
                <option value="">Selecione</option>
                <option value="Masculino">Masculino</option>
                <option value="Feminino">Feminino</option>
                <option value="Outro">Outro</option>
                <option value="Prefiro não dizer">Prefiro não dizer</option>
              </select>
            </div>

            <div className="full-width">
              <label className="input-label">Telemóvel *</label>
              <input
                type="tel"
                name="telemovel"
                value={formData.telemovel}
                onChange={handleInputChange}
                className="input-field"
                placeholder="912345678"
                required
              />
            </div>
          </div>

          <div className="checkbox-row">
            <input
              type="checkbox"
              name="souResidente"
              checked={formData.souResidente}
              onChange={handleInputChange}
              className="checkbox-input"
            />
            <label className="checkbox-label">Sou Residente em Castelo Branco</label>
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-submit">Registar</button>

            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="button-secondary"
            >
              <ArrowLeft className="mr-2" size={16} /> Voltar
            </button>

            <div className="login-redirect">
              <span className="text-gray-600">Já está registado? </span>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-indigo-600 hover:text-indigo-800 font-semibold"
              >
                Login
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PaginaRegisto;
