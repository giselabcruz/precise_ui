import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './StoreManager.css';

function StoreManager() {
  const [assignedStores, setAssignedStores] = useState<{ _id: string; name: string }[]>([]);
  const [products, setProducts] = useState<{ product: { _id: string; name: string }; quantity: number }[]>([]);
  const [alerts, setAlerts] = useState<{ product: string; quantity: string; date: string; store: string }[]>([]);
  const [activeTab, setActiveTab] = useState<'productos' | 'alertas'>('productos');
  const [alertProduct, setAlertProduct] = useState('');
  const [alertQuantity, setAlertQuantity] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await axios.get('http://localhost:4000/api/v1/supermarkets?storeManagerId=87654321A');
        const stores = res.data;
        setAssignedStores(stores);

        if (stores.length > 0) {
          const storeId = stores[0]._id;

          const stockRes = await axios.get(`http://localhost:4000/api/v1/stocks/supermarket/${storeId}`);
          setProducts(stockRes.data);

          const alertsRes = await axios.get(`http://localhost:4000/api/v1/stocks/supermarket/${storeId}/notifications`);
          const formatted = alertsRes.data.map((a: any) => ({
            product: a.product.name,
            quantity: a.quantity,
            date: a.createdAt ? new Date(a.createdAt).toLocaleString() : 'Fecha no disponible',
            store: stores[0].name,
          }));
          setAlerts(formatted);
        }
      } catch (error) {
        console.error('Error al obtener los datos:', error);
      }
    }

    fetchData();
  }, []);

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertProduct || !alertQuantity) return;

    const selectedProduct = products.find(p => p.product.name === alertProduct);
    if (!selectedProduct) {
      setErrorMessage('⚠️ Producto no encontrado.');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    const alreadyAlerted = alerts.some((a) => a.product === alertProduct);
    if (alreadyAlerted) {
      setErrorMessage(`⚠️ Ya has generado una alerta para "${alertProduct}".`);
      setSuccessMessage('');
      setTimeout(() => setErrorMessage(''), 3000);
      return;
    }

    try {
      const storeId = assignedStores[0]?._id;
      if (!storeId) throw new Error('No hay supermercado asignado');

      await axios.post(`http://localhost:4000/api/v1/stocks/supermarket/${storeId}/notifications`, {
        productId: selectedProduct.product._id,
        requestedQuantity: parseInt(alertQuantity, 10),
        date: new Date().toLocaleString()
      });

      const newAlert = {
        product: alertProduct,
        quantity: alertQuantity,
        date: new Date().toLocaleString(),
        store: assignedStores[0].name,
      };

      setAlerts((prev) => [...prev, newAlert]);
      setSuccessMessage(`✅ Alerta generada para "${alertProduct}".`);
      setErrorMessage('');
      setAlertProduct('');
      setAlertQuantity('');
      setShowSuggestions(false);
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (error) {
      console.error('Error al enviar la alerta:', error);
      setErrorMessage('❌ Error al generar la alerta.');
      setTimeout(() => setErrorMessage(''), 3000);
    }
  };

  return (
    <div className="store-manager-container min-h-screen bg-gradient-to-br from-red-100 via-white to-red-200 text-gray-900 py-12 px-6 md:px-16">
      <div className="max-w-4xl mx-auto bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-10 border border-gray-200">
        <h1 className="text-4xl font-extrabold text-center text-red-700 mb-8">
          🛍 Gestión de Inventario - Supermercado asignado: {assignedStores[0]?.name || 'Cargando...'}
        </h1>

        <div className="flex justify-center gap-6 mb-10">
          <button
            onClick={() => setActiveTab('productos')}
            className={`px-6 py-2 font-semibold rounded-full shadow transition ${
              activeTab === 'productos'
                ? 'bg-red-600 text-white'
                : 'bg-white border border-red-300 text-red-700 hover:bg-red-100'
            }`}
          >
            📦 Ver productos
          </button>
          <button
            onClick={() => setActiveTab('alertas')}
            className={`px-6 py-2 font-semibold rounded-full shadow transition ${
              activeTab === 'alertas'
                ? 'bg-yellow-500 text-white'
                : 'bg-white border border-yellow-300 text-yellow-700 hover:bg-yellow-100'
            }`}
          >
            ⚠️ Alertas
          </button>
        </div>

        {activeTab === 'productos' && (
          <div className="mb-10">
            <h2 className="text-2xl font-semibold text-red-700 mb-4">📦 Productos</h2>
            {products.length > 0 ? (
              <div className="grid grid-cols-2 gap-4 bg-white p-6 rounded-xl border border-red-200 shadow-md text-red-800">
                <div className="font-bold uppercase tracking-wider">Nombre</div>
                <div className="font-bold uppercase tracking-wider">Cantidad</div>
                {products.map((product, index) => (
                  <React.Fragment key={index}>
                    <div className="border-t border-gray-200 pt-2">{product.product.name}</div>
                    <div className="border-t border-gray-200 pt-2">{product.quantity}</div>
                  </React.Fragment>
                ))}
              </div>
            ) : (
              <p className="italic text-red-500">No hay productos disponibles para tu tienda.</p>
            )}
          </div>
        )}

        {activeTab === 'alertas' && (
          <>
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
                      {products
                        .filter(
                          (p) =>
                            !alerts.some((a) => a.product === p.product.name) &&
                            p.product.name.toLowerCase().includes(alertProduct.toLowerCase())
                        )
                        .map((product, index) => (
                          <li
                            key={index}
                            onClick={() => {
                              setAlertProduct(product.product.name);
                              setShowSuggestions(false);
                            }}
                            className="px-4 py-2 cursor-pointer hover:bg-yellow-100"
                          >
                            {product.product.name}
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

              {successMessage && <p className="mt-4 text-green-700 font-medium">{successMessage}</p>}
              {errorMessage && <p className="mt-4 text-red-700 font-medium">{errorMessage}</p>}
            </div>

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
                        <th className="px-4 py-2">Tienda</th>
                      </tr>
                    </thead>
                    <tbody>
                      {alerts.map((alert, index) => (
                        <tr key={index} className="hover:bg-red-50 transition">
                          <td className="px-4 py-2 border-b">{alert.product}</td>
                          <td className="px-4 py-2 border-b">{alert.quantity}</td>
                          <td className="px-4 py-2 border-b">{alert.date}</td>
                          <td className="px-4 py-2 border-b">{alert.store}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="italic text-red-500">Aún no se han generado alertas.</p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default StoreManager;