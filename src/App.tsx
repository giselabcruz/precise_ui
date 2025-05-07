import './App.css'
import { Routes, Route } from 'react-router-dom';
import Login from './pages/Login/Login'; 
import Home from './pages/Home/Home';
import { useState } from 'react';

function App() {
  const [userRole, setUserRole] = useState<string | null>(null);

  return (
    <Routes>
      <Route path="/" element={<Login onLogin={(role) => setUserRole(role)} />} />
      {userRole && <Route path="/home" element={<Home userRole={userRole} />} />}
    </Routes>
  );
}

export default App;
