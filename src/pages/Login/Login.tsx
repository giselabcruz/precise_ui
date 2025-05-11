import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLogin } from '../../hooks/useLogin';
import './Login.css';
import FloatingLogo from '../../components/FloatingLogo';

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

    loginMutation.mutate(
      { dni, password },
      {
        onSuccess: (data) => {
          localStorage.setItem('userData', JSON.stringify(data));
          const role = data.user.role;
          onLogin(role);
          navigate('/home', { state: { role } });
        },
        onError: (error) => {
          console.error('Login failed:', error);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-white py-6 flex flex-col justify-center sm:py-12 relative text-black">
      <div className="flex justify-center mb-6">
        <img src="/Spar-Logo.png" alt="SPAR Logo" className="h-40" />
      </div>
      <form onSubmit={handleLogin} className="login-form relative py-3 sm:max-w-xl sm:mx-auto">
        {/* Banda inclinada verde */}
        <div className="absolute inset-0 bg-gradient-to-r from-green-600 to-green-800 shadow-lg transform -skew-y-6 sm:skew-y-0 sm:-rotate-6 sm:rounded-3xl"></div>

        <div className="relative px-4 py-10 bg-white text-black shadow-lg sm:rounded-3xl sm:p-20">
          <div className="max-w-md mx-auto">
            <div>
              <h1 className="text-2xl font-semibold text-black">Inicia sesión</h1>
            </div>
            <div className="divide-y divide-gray-200">
              <div className="py-8 text-base leading-6 space-y-4 sm:text-lg sm:leading-7">
                {/* Campo DNI */}
                <div className="form-group relative">
                  <label
                    htmlFor="dni"
                    className="absolute left-0 -top-3.5 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-black"
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
                    className="peer placeholder-transparent h-10 w-full border-b-2 border-black text-black focus:outline-none focus:border-green-600"
                  />
                </div>

                {/* Campo Contraseña */}
                <div className="form-group relative">
                  <label
                    htmlFor="password"
                    className="absolute left-0 -top-3.5 text-sm peer-placeholder-shown:text-base peer-placeholder-shown:text-gray-500 peer-placeholder-shown:top-2 transition-all peer-focus:-top-3.5 peer-focus:text-sm peer-focus:text-black"
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
                    className="peer placeholder-transparent h-10 w-full border-b-2 border-black text-black focus:outline-none focus:border-green-600"
                  />
                </div>

                {/* Botón verde */}
                <div className="relative">
                  <button
                    type="submit"
                    className="bg-green-600 hover:bg-green-700 text-white rounded-md px-4 py-2 transition-colors w-full"
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? 'Iniciando...' : 'Iniciar sesión'}
                  </button>
                  {loginMutation.isError && (
                    <p className="text-red-500 mt-2">Error: {loginMutation.error.message}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
      <FloatingLogo />
    </div>
  );
}

export default Login;