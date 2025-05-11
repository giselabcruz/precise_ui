import React, { useState } from 'react';
import './Supplier.css';
import FloatingLogo from '../../components/FloatingLogo';

function Supplier() {
  const [activeTab, setActiveTab] = useState<'productos' | 'alertas'>('productos');
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [asignacionMensaje, setAsignacionMensaje] = useState<string | null>(null);

  const markets = ['Supermercado A', 'Supermercado B', 'Supermercado C'];

  const products = [
    { name: 'Producto 1', quantity: 100, center: 'Supermercado A' },
    { name: 'Producto 2', quantity: 50, center: 'Supermercado B' },
    { name: 'Producto 3', quantity: 200, center: 'Supermercado C' },
  ];

  const stockAlerts = [
    { store: 'Supermercado A', product: 'Producto 1' },
    { store: 'Supermercado C', product: 'Producto 3' },
  ];

  const handleCenterChange = (center: string) => {
    setSelectedCenters((prev) =>
      prev.includes(center) ? prev.filter((c) => c !== center) : [...prev, center]
    );
  };

  const toggleDropdown = () => {
    setIsDropdownVisible((prev) => !prev);
  };

  const filteredProducts = products.filter((product) =>
    selectedCenters.includes(product.center)
  );

  const handleAceptarReposicion = async (centro: string, supermercado: string, producto: string) => {
    try {
      const res = await fetch('/api/ruta-optima', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ centro, supermercado }),
      });

      const data = await res.json();
      const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

      setAsignacionMensaje(`✅ Entrega de "${producto}" asignada a Proveedor SPAR a las ${hora}`);

      if (data.ruta) {
        alert(`🛣 Ruta óptima desde ${centro} hasta ${supermercado}:\n${data.ruta.join(' ➝ ')}`);
      } else {
        alert('❌ No se pudo encontrar una ruta.');
      }
    } catch (error) {
      alert('⚠️ Error al contactar con el servidor.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 py-12 px-6">
      <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-10 border border-gray-200">
        <h1 className="text-4xl font-extrabold text-center text-green-700 mb-8">
          Panel de Proveedor
        </h1>

        {/* Mensaje de asignación */}
        {asignacionMensaje && (
          <div className="mb-6 p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg shadow-md text-center font-medium">
            {asignacionMensaje}
          </div>
        )}

        {/* Navegación entre secciones */}
        <div className="flex justify-center gap-6 mb-10">
          <button
            onClick={() => setActiveTab('productos')}
            className={`px-6 py-2 font-semibold rounded-full shadow transition ${
              activeTab === 'productos'
                ? 'bg-green-600 text-white'
                : 'bg-white border border-green-300 text-green-700 hover:bg-green-100'
            }`}
          >
            📦 Ver productos
          </button>
          <button
            onClick={() => setActiveTab('alertas')}
            className={`px-6 py-2 font-semibold rounded-full shadow transition ${
              activeTab === 'alertas'
                ? 'bg-red-600 text-white'
                : 'bg-white border border-red-300 text-red-700 hover:bg-red-100'
            }`}
          >
            🚨 Ver alertas
          </button>
        </div>

        {/* Sección: Productos */}
        {activeTab === 'productos' && (
          <>
            <div className="text-center mb-10">
              <button
                onClick={toggleDropdown}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-8 rounded-full shadow-md"
              >
                Seleccionar supermercados
              </button>

              {isDropdownVisible && (
                <div className="mt-6 flex justify-center">
                  <div className="bg-white border border-green-200 rounded-xl p-6 shadow-lg w-fit">
                    {markets.map((market) => (
                      <label key={market} className="block text-md font-medium text-gray-800 mb-3">
                        <input
                          type="checkbox"
                          checked={selectedCenters.includes(market)}
                          onChange={() => handleCenterChange(market)}
                          className="mr-2 accent-green-500"
                        />
                        {market}
                      </label>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <h2 className="text-2xl font-semibold text-green-800 mb-4">📦 Productos Disponibles</h2>
            {filteredProducts.length > 0 ? (
              <ul className="list-disc list-inside text-gray-800 space-y-1">
                {filteredProducts.map((product, index) => (
                  <li key={index}>
                    <span className="font-bold">{product.name}</span> — {product.quantity} unidades en{' '}
                    <span className="italic text-green-600">{product.center}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="italic text-gray-500">Selecciona un supermercado para ver productos.</p>
            )}
          </>
        )}

        {/* Sección: Alertas */}
        {activeTab === 'alertas' && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-red-600">🚨 Alertas de Reposición</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full border-collapse bg-white rounded-xl shadow-md">
                <thead>
                  <tr className="bg-red-100 text-red-800 text-sm uppercase tracking-wider">
                    <th className="px-6 py-3 border-b border-red-200 text-left">🛒 Tienda</th>
                    <th className="px-6 py-3 border-b border-red-200 text-left">📦 Producto</th>
                    <th className="px-6 py-3 border-b border-red-200 text-left">✔️ Acción</th>
                  </tr>
                </thead>
                <tbody>
                  {stockAlerts.map((alert, index) => (
                    <tr key={index} className="hover:bg-red-50 transition-colors duration-200">
                      <td className="px-6 py-3 border-b border-gray-100">{alert.store}</td>
                      <td className="px-6 py-3 border-b border-gray-100">{alert.product}</td>
                      <td className="px-6 py-3 border-b border-gray-100">
                        <button
                          onClick={() =>
                            handleAceptarReposicion('Centro A', alert.store, alert.product)
                          }
                          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded shadow text-sm"
                        >
                          Aceptar y ver ruta
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Supplier;