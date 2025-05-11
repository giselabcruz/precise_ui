import React, { useState } from 'react';
import './StoreManager.css';

function StoreManager() {
  const assignedStore = 'Supermercado A';

  const products = [
    { name: 'Producto 1', quantity: 100, center: 'Supermercado A' },
    { name: 'Producto 2', quantity: 50, center: 'Supermercado B' },
    { name: 'Producto 3', quantity: 200, center: 'Supermercado C' },
    { name: 'Leche Entera', quantity: 80, center: 'Supermercado A' },
    { name: 'Yogur Natural', quantity: 40, center: 'Supermercado A' },
    { name: 'Pan Integral', quantity: 30, center: 'Supermercado A' },
  ];

  const filteredProducts = products.filter(
    (product) => product.center === assignedStore
  );

  const [alertProduct, setAlertProduct] = useState('');
  const [alertQuantity, setAlertQuantity] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [alerts, setAlerts] = useState<{ product: string; quantity: string; date: string }[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertProduct || !alertQuantity) return;

    const alreadyAlerted = alerts.some((a) => a.product === alertProduct);
    if (alreadyAlerted) {
      setErrorMessage(`⚠️ Ya has generado una alerta para "${alertProduct}". No puedes repetirla.`);
      setSuccessMessage('');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const newAlert = {
      product: alertProduct,
      quantity: alertQuantity,
      date: new Date().toLocaleString(),
    };

    setAlerts((prev) => [...prev, newAlert]);
    setSuccessMessage(`✅ Alerta generada para "${alertProduct}" por ${alertQuantity} unidades.`);
    setErrorMessage('');
    setAlertProduct('');
    setAlertQuantity('');
    setShowSuggestions(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className="store-manager-container min-h-screen bg-gradient-to-br from-red-100 via-white to-red-200 text-gray-900 py-12 px-6 md:px-16">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-10 border border-gray-200">
        <h1 className="text-4xl font-extrabold text-center text-red-700 mb-4">
          🛍 Gestión de Inventario - {assignedStore}
        </h1>
        <p className="text-center text-gray-600 mb-10">
          Estás visualizando los productos disponibles en tu tienda asignada.
        </p>

        {/* Lista de productos */}
        <div className="mb-10">
          <h2 className="text-2xl font-semibold text-red-700 mb-4">📦 Productos</h2>
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-xl border border-red-200 shadow-md text-red-800">
              <div className="font-bold uppercase tracking-wider">Nombre</div>
              <div className="font-bold uppercase tracking-wider">Cantidad</div>
              {filteredProducts.map((product, index) => (
                <React.Fragment key={index}>
                  <div className="border-t border-gray-200 pt-2">{product.name}</div>
                  <div className="border-t border-gray-200 pt-2">{product.quantity}</div>
                </React.Fragment>
              ))}
            </div>
          ) : (
            <p className="italic text-red-500">No hay productos disponibles para tu tienda.</p>
          )}
        </div>

        {/* Generador de alertas */}
        <div className="mt-8 mb-10 relative">
          <h2 className="text-2xl font-semibold text-yellow-700 mb-4">⚠️ Generar Alerta de Reposición ⚠️</h2>

          <form onSubmit={handleAlertSubmit} className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="w-full md:w-1/2 relative">
              <input
                type="text"
                placeholder="Escribe el nombre del producto..."
                value={alertProduct}
                onChange={(e) => {
                  setAlertProduct(e.target.value);
                  setShowSuggestions(true);
                }}
                onFocus={() => setShowSuggestions(true)}
                className="w-full p-3 border border-yellow-300 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-300"
                required
              />
              {alertProduct && showSuggestions && (
                <ul className="absolute z-10 mt-1 w-full bg-white border border-yellow-300 rounded-md shadow max-h-40 overflow-y-auto">
                  {filteredProducts
                    .filter(
                      (p) =>
                        !alerts.some((a) => a.product === p.name) &&
                        p.name.toLowerCase().includes(alertProduct.toLowerCase())
                    )
                    .map((product, index) => (
                      <li
                        key={index}
                        onClick={() => {
                          setAlertProduct(product.name);
                          setShowSuggestions(false);
                        }}
                        className="px-4 py-2 cursor-pointer hover:bg-yellow-100"
                      >
                        {product.name}
                      </li>
                    ))}
                </ul>
              )}
            </div>

            <input
              type="number"
              placeholder="Cantidad necesaria"
              value={alertQuantity}
              onChange={(e) => setAlertQuantity(e.target.value)}
              className="w-full md:w-1/4 p-3 border border-yellow-300 rounded-lg shadow-sm focus:ring-2 focus:ring-yellow-300"
              min="1"
              required
            />

            <button
              type="submit"
              className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-3 px-6 rounded-lg shadow-md transition"
            >
              Enviar Alerta
            </button>
          </form>

          {successMessage && (
            <p className="mt-4 text-green-700 font-medium">{successMessage}</p>
          )}
          {errorMessage && (
            <p className="mt-4 text-red-700 font-medium">{errorMessage}</p>
          )}
        </div>

        {/* Lista de alertas generadas */}
        <div className="mt-10">
          <h2 className="text-2xl font-semibold text-red-600 mb-4">📋 Alertas Generadas</h2>
          {alerts.length > 0 ? (
            <div className="bg-white border border-red-200 rounded-xl p-6 shadow-md">
              <table className="min-w-full table-auto text-left text-sm text-red-800">
                <thead>
                  <tr className="bg-red-100 uppercase text-red-700 text-xs">
                    <th className="px-4 py-2">Producto</th>
                    <th className="px-4 py-2">Cantidad Solicitada</th>
                    <th className="px-4 py-2">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert, index) => (
                    <tr key={index} className="hover:bg-red-50 transition">
                      <td className="px-4 py-2 border-b">{alert.product}</td>
                      <td className="px-4 py-2 border-b">{alert.quantity}</td>
                      <td className="px-4 py-2 border-b">{alert.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="italic text-red-500">Aún no se han generado alertas.</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default StoreManager;