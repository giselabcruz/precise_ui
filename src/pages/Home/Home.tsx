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
    <div className="min-h-screen flex flex-col w-full h-full">
      <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
        <div className="text-lg font-bold">Company Logo</div>
        <div className="relative">
          <button onClick={toggleMenu} className="bg-gray-700 px-4 py-2 rounded-full">👤</button>
          {menuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1">
              <button onClick={handleLogout} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Settings</button>
              <button onClick={handleLogout} className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left">Logout</button>
            </div>
          )}
        </div>
      </header>
      <main className="flex-grow p-6 bg-gray-100">
        {userRole === 'store-manager' && (
          <StorageManager/>
        )}
        {userRole === 'supplier' && (
          <Supplier/>
        )}
      </main>
    </div>
  );
};

export default Home;