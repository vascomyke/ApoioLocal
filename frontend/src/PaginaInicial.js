import React from 'react';
import './PaginaInicial.css';
import { Building2, User, Users, Heart, MapPin } from 'lucide-react';

const PaginaInicial = ({ onNavigate }) => {
  return (
    <div className="pagina-container">
  <div className="pagina-content">
    <div className="titulo">
      <Building2 size={80} style={{ color: '#5a67d8', marginBottom: '1rem' }} />
      <h1>AlbiComércio</h1>
      <p>
        Plataforma completa para registo, gestão e descoberta de estabelecimentos em Castelo Branco. 
        Conectamos negócios locais com a comunidade, promovendo o desenvolvimento económico da região.
      </p>
    </div>

    <div className="botoes">
      <button className="botao-login" onClick={() => onNavigate('login')}>
        <User style={{ marginRight: '8px' }} size={20} />
        Login
      </button>

      <button className="botao-registo" onClick={() => onNavigate('registar')}>
        <Users style={{ marginRight: '8px' }} size={20} />
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
