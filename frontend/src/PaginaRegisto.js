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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Prepare the payload to match your backend's expected fields
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
        // Registration successful
        onLogin(data.user || payload); // Adjust as per your backend response
        onNavigate('dashboard');
      } else {
        // Handle registration error (show message to user)
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
          <h2 className="text-2xl font-bold text-gray-800">Registar Utilizador</h2>
          <p className="text-gray-600 mt-2">Crie a sua conta para começar</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-2">
            <div>
              <label className="input-label">
                Nome Completo *
              </label>
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
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email *
              </label>
              <input
                type="email"
                name="emailUtilizador"
                value={formData.emailUtilizador}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="joao@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password *
              </label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="••••••••"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Data de Nascimento *
              </label>
              <input
                type="date"
                name="dataNascimento"
                value={formData.dataNascimento}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nacionalidade *
              </label>
              <input
                type="text"
                name="nacionalidade"
                value={formData.nacionalidade}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Portuguesa"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Género *
              </label>
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

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Telemóvel *
              </label>
              <input
                type="tel"
                name="telemovel"
                value={formData.telemovel}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="912345678"
                required
              />
            </div>
          </div>

          <div className="flex items-center">
            <input
              type="checkbox"
              name="souResidente"
              checked={formData.souResidente}
              onChange={handleInputChange}
              className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
            />
            <label className="ml-2 block text-sm text-gray-700">
              Sou Residente em Castelo Branco
            </label>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200"
            >
              Registar
            </button>

            <button
              type="button"
              onClick={() => onNavigate('home')}
              className="button-secondary"
            >
              <ArrowLeft className="mr-2" size={16} />
              Voltar
            </button>

            <div className="login-redirect">
              <span className="text-gray-600">Já está registado? </span>
              <button
                type="button"
                onClick={() => onNavigate('login')}
                className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200"
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
