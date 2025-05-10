import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../hooks/useLogin';
import './Login.css';

interface LoginProps {
  onLogin: (role: string) => void;
}

function Login({ onLogin }: LoginProps) {
  const [dni, setDni] = useState('');
  const [password, setPassword] = useState('');
  const loginMutation = useLogin();
  const navigate = useNavigate();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    const dniRegex = /^\d{8}[A-Za-z]$/;
    const isDNIValid = dniRegex.test(dni);
    const isPasswordValid = password.length === 9;

    if (!isDNIValid) {
      alert('El usuario debe ser un DNI válido (8 números seguidos de 1 letra).');
      return;
    }

    if (!isPasswordValid) {
      alert('La contraseña debe tener exactamente 9 caracteres.');
      return;
    }

    loginMutation.mutate({ dni, password },
      {
        onSuccess: (data) => {
          localStorage.setItem('userData', JSON.stringify(data)); // Store user data in localStorage
          const role = data.user.role;
          console.log('Login successful:', role);
          onLogin(role);
          navigate('/home', { state: { role } });
        },
        onError: (error) => {
          console.error('Login failed:', error);
          // Handle login error (e.g., show error message)
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-red-100 py-6 flex flex-col justify-center sm:py-12">
      <div className="flex justify-center mb-6">
        <img src="/Spar-Logo.png" alt="SPAR Logo" className="h-40" />
      </div>
      <form onSubmit={handleLogin} className="login-form relative py-3 sm:max-w-xl sm:mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-700 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold text-red-700">Inicia sesión</h1>
            </div>
            <div className="divide-y divide-red-200">
              <div className="py-8 text-base leading-6 space-y-4 text-gray-800 sm:text-lg sm:leading-7">
                <div className="form-group relative">
                  <label
                    htmlFor="dni"
                    className="absolute left-0 -top-3.5 text-red-700 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-red-700 peer-focus:text-sm"
                  >
                    Usuario
                  </label>
                  <input
                    type="text"
                    id="dni"
                    value={dni}
                    onChange={(e) => setDni(e.target.value)}
                    placeholder="Nombre de usuario"
                    required
                    className="peer placeholder-transparent h-10 w-full border-b-2 border-red-300 text-gray-900 focus:outline-none focus:border-red-600"
                  />
                </div>
                <div className="form-group relative">
                  <label
                    htmlFor="password"
                    className="absolute left-0 -top-3.5 text-red-700 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-red-700 peer-focus:text-sm"
                  >
                    Contraseña
                  </label>
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Tu contraseña"
                    required
                    className="peer placeholder-transparent h-10 w-full border-b-2 border-red-300 text-gray-900 focus:outline-none focus:border-red-600"
                  />
                </div>
                <div className="relative">
                  <button
                    type="submit"
                    className="bg-red-600 hover:bg-red-700 text-white rounded-md px-4 py-2 transition-colors w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? 'Logging in...' : 'Login'}
                  </button>
                  {loginMutation.isError && <p>Error: {loginMutation.error.message}</p>}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}

export default Login;