import './App.css'
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login';
import StoreManager from './pages/StoreManager/StoreManager';
import Supplier from './pages/Supplier/Supplier';
import { useState } from 'react';

function App() {
  const [userRole, setUserRole] = useState<string | null>(null);

  return (
    <Routes>
      <Route path="/" element={<Login onLogin={(role: string) => setUserRole(role)} />} />
      {userRole === 'store-manager' && (
        <Route path="/store-manager" element={<StoreManager />} />
      )}
      {userRole === 'supplier' && (
        <Route path="/supplier" element={<Supplier />} />
      )}
    </Routes>
  );
}

export default App;
