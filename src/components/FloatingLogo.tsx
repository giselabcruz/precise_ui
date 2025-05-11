import React, { useEffect, useState } from 'react';

const FloatingLogo: React.FC = () => {
  const [isAtBottom, setIsAtBottom] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;

      // Si el usuario está cerca del fondo (5px de margen)
      setIsAtBottom(scrollTop + windowHeight >= documentHeight - 5);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  if (!isAtBottom) return null; // No renderiza el logo si no está abajo

  return (
    <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-50 fade-in">
      <img
        src="/logo_precise.png"
        alt="Precise Logo"
        className="h-40 opacity-80 hover:opacity-100 transition-opacity"
      />
    </div>
  );
};

export default FloatingLogo;