import React from 'react';
import { Building2, User, Users, Heart, MapPin } from 'lucide-react';

const PaginaInicial = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-12">
          <Building2 className="mx-auto mb-6 text-indigo-600" size={80} />
          <h1 className="text-5xl font-bold text-gray-800 mb-4">
            Gestão de Estabelecimentos
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Plataforma completa para registo, gestão e descoberta de estabelecimentos em Castelo Branco. 
            Conectamos negócios locais com a comunidade, promovendo o desenvolvimento económico da região.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 gap-6 max-w-md mx-auto">
          <button
            onClick={() => onNavigate('login')}
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200"
          >
            <User className="inline mr-2" size={20} />
            Login
          </button>
          
          <button
            onClick={() => onNavigate('registar')}
            className="bg-white hover:bg-gray-50 text-indigo-600 font-semibold py-4 px-8 rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-200 border-2 border-indigo-200"
          >
            <Users className="inline mr-2" size={20} />
            Registar
          </button>
        </div>
        
        <div className="mt-16 grid md:grid-cols-3 gap-8 text-center">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Building2 className="mx-auto mb-4 text-indigo-600" size={48} />
            <h3 className="text-lg font-semibold mb-2">Registe o seu Estabelecimento</h3>
            <p className="text-gray-600">Dê visibilidade ao seu negócio na comunidade local</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <Heart className="mx-auto mb-4 text-red-500" size={48} />
            <h3 className="text-lg font-semibold mb-2">Descubra Favoritos</h3>
            <p className="text-gray-600">Encontre e guarde os seus estabelecimentos preferidos</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md">
            <MapPin className="mx-auto mb-4 text-green-600" size={48} />
            <h3 className="text-lg font-semibold mb-2">Explore Castelo Branco</h3>
            <p className="text-gray-600">Conheça todos os estabelecimentos da região</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaginaInicial;
