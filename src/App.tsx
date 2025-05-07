import './App.css';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login/Login'; 
import Home from './pages/Home/Home';
import { useState, useEffect } from 'react';

function App() {
  const [userRole, setUserRole] = useState<string | null>(
    () => localStorage.getItem('userRole') // Retrieve userRole from localStorage on initial load
  );

  useEffect(() => {
    if (userRole) {
      localStorage.setItem('userRole', userRole); // Save userRole to localStorage when it changes
    } else {
      localStorage.removeItem('userRole'); // Remove userRole from localStorage if it becomes null
    }
  }, [userRole]);

  return (
    <Routes>
      <Route
        path="/"
        element={
          userRole ? (
            <Navigate to="/home" replace /> // Redirect to home if userRole exists
          ) : (
            <Login onLogin={(role) => setUserRole(role)} />
          )
        }
      />
      {userRole && <Route path="/home" element={<Home userRole={userRole} onLogout={() => setUserRole(null)} />} />}
    </Routes>
  );
}

export default App;