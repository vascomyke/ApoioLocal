import React, { useState } from 'react';
import { User, ArrowLeft } from 'lucide-react';

const PaginaLogin = ({ onNavigate, onLogin }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Simular login - em produção seria uma chamada à API
    const userData = {
      id: 1,
      nome: 'João Silva',
      email: formData.email
    };
    onLogin(userData);
    onNavigate('dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <User className="mx-auto mb-4 text-indigo-600" size={48} />
          <h2 className="text-2xl font-bold text-gray-800">Login</h2>
          <p className="text-gray-600 mt-2">Aceda à sua conta</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              placeholder="seu@email.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
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

          <button
            type="submit"
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-md transition-colors duration-200"
          >
            Login
          </button>
        </form>

        <div className="mt-6 space-y-4">
          <button
            onClick={() => onNavigate('home')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-md transition-colors duration-200 flex items-center justify-center"
          >
            <ArrowLeft className="mr-2" size={16} />
            Voltar
          </button>

          <div className="text-center">
            <span className="text-gray-600">Não está registado? </span>
            <button
              onClick={() => onNavigate('registar')}
              className="text-indigo-600 hover:text-indigo-800 font-semibold transition-colors duration-200"
            >
              Registar
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginaLogin;
