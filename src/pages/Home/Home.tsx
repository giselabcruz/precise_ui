import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './Home.css';
import StorageManager from '../StoreManager/StoreManager';
import Supplier from '../Supplier/Supplier';
import FloatingLogo from '../../components/FloatingLogo';

interface HomeProps {
  userRole: string;
  onLogout: () => void;
}

const Home: React.FC<HomeProps> = ({ userRole, onLogout }) => {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const toggleMenu = () => setMenuOpen(!menuOpen);

  const handleLogout = () => {
    onLogout();
    navigate('/');
  };

  return (
    <div className="min-h-screen flex flex-col w-full bg-gradient-to-br from-red-50 via-white to-red-100">
      {/* Header */}
      <header className="bg-red-600 text-white px-6 py-4 shadow-lg flex justify-between items-center">
        <div className="flex items-center gap-4">
          <img src="/Spar-Logo.png" alt="SPAR Logo" className="h-12" />
          <h1 className="text-2xl font-bold tracking-wide">Panel de Logística SPAR</h1>
        </div>
        <div className="relative">
          <button
            onClick={toggleMenu}
            className="bg-red-700 hover:bg-red-800 transition px-4 py-2 rounded-full shadow-md text-white"
            aria-label="Menú de usuario"
          >
            👤
          </button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-xl z-20">
              <button
                onClick={handleLogout}
                className="block w-full px-4 py-2 text-sm text-gray-800 hover:bg-red-100 text-left"
              >
                Cerrar sesión
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow px-6 py-8 bg-white/60">
        {userRole === 'store_manager' && <StorageManager />}
        {userRole === 'supplier' && <Supplier />}
      </main>

      {/* Footer/logo */}
      <footer className="mt-auto">
        <FloatingLogo />
      </footer>
    </div>
  );
};

export default Home;