import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import StorageManager from '../StoreManager/StoreManager';
import Supplier from '../Supplier/Supplier';

interface HomeProps {
  userRole: string;
}

const Home: React.FC<HomeProps> = ({ userRole }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => {
    setMenuOpen(!menuOpen);
  };

  const handleLogout = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col w-full h-full bg-red-50">
      <header className="bg-red-600 text-white p-4 flex justify-between items-center shadow-md">
        <div className="flex items-center gap-4">
          <img src="/Spar-Logo.png" alt="SPAR Logo" className="h-15" />
          <span className="text-xl font-bold">Logística</span>
        </div>
        <div className="relative">
          <button
            onClick={toggleMenu}
            className="bg-red-700 px-4 py-2 rounded-full hover:bg-red-800 transition-colors"
          >
            👤
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <button
                onClick={handleLogout}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-100 w-full text-left"
              >
                Configuración
              </button>
              <button
                onClick={handleLogout}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-red-100 w-full text-left"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="flex-grow p-6 bg-red-100">
        {userRole === 'store-manager' && <StorageManager />}
        {userRole === 'supplier' && <Supplier />}
      </main>
    </div>
  );
};

export default Home;