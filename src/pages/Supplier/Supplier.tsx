import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './Supplier.css';
import { MapContainer, TileLayer, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';

function Supplier() {
  const [activeTab, setActiveTab] = useState<'productos' | 'alertas'>('productos');
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);
  const [mensajesAsignados, setMensajesAsignados] = useState<string[]>([]);
  const [mostrarMapa, setMostrarMapa] = useState(false);
  const [logisticsCenters, setLogisticsCenters] = useState<{ name: string; stock: { name: string; quantity: number }[] }[]>([]);
  const [stockAlerts, setStockAlerts] = useState([]);

  useEffect(() => {
    async function fetchCentersWithStock() {
      try {
        const centersResponse = await axios.get('http://localhost:4000/api/v1/logisticCenters');
        const centers = centersResponse.data;

        const centersWithStock = await Promise.all(
          centers.map(async (center: any) => {
            const stockResponse = await axios.get(
              `http://localhost:4000/api/v1/stocks/logistic-center/${center._id}`
            );
            return {
              name: center.name,
              stock: stockResponse.data.map((s: any) => ({
                name: s.product?.name || 'Producto desconocido',
                quantity: s.quantity
              }))
            };
          })
        );

        setLogisticsCenters(centersWithStock);
      } catch (error) {
        console.error('Error al obtener centros logísticos y stock:', error);
      }
    }

    async function fetchAlerts() {
      try {
        const response = await axios.get('http://localhost:4000/api/v1/stocks/notifications');
        const data = response.data;

        const formatted = data.map((alert: any) => ({
          store: alert.supermarket?.name || 'Tienda desconocida',
          product: alert.product?.name || 'Producto desconocido',
          quantity: alert.quantity?.toString() || '0',
          date: alert.createdAt ? new Date(alert.createdAt).toLocaleString() : 'Fecha no disponible',
        }));

        setStockAlerts(formatted);
      } catch (error) {
        console.error('Error al obtener alertas:', error);
      }
    }

    fetchCentersWithStock();
    fetchAlerts();
  }, []);

  const handleCenterChange = (center: string) => {
    setSelectedCenters((prev) =>
      prev.includes(center) ? prev.filter((c) => c !== center) : [...prev, center]
    );
  };

  const toggleDropdown = () => {
    setIsDropdownVisible((prev) => !prev);
  };

  const filteredProducts = logisticsCenters
    .filter(center => selectedCenters.includes(center.name))
    .flatMap(center => (center.stock || []).map(product => ({ ...product, center: center.name })));

  const gc100Path: [number, number][] = [
    [27.9956, -15.385],
    [28.0058, -15.3954],
    [28.0110, -15.4032],
    [28.0210, -15.4122],
    [28.0300, -15.4200],
  ];

  const handleAceptarReposicion = (
    centro: string,
    supermercado: string,
    producto: string,
    cantidad: string,
    fecha: string
  ) => {
    const hora = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const nuevoMensaje = `✅ Reposición confirmada:\n📦 Producto: ${producto}\n🔢 Cantidad: ${cantidad}\n🕓 Fecha de alerta: ${fecha}\n🏪 Tienda: ${supermercado}\n🕒 Asignado a Proveedor SPAR a las ${hora}\n🛣 Ruta: GC-100`;

    setMensajesAsignados((prev) => [...prev, nuevoMensaje]);
    setMostrarMapa(true);
    setStockAlerts((prev) =>
      prev.filter((a) => !(a.store === supermercado && a.product === producto))
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-white to-green-200 py-12 px-6">
      <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur-md shadow-2xl rounded-3xl p-10 border border-gray-200">
        <h1 className="text-4xl font-extrabold text-center text-green-700 mb-8">Panel de Proveedor</h1>

        {mensajesAsignados.length > 0 && (
          <div className="mb-6 space-y-3">
            {mensajesAsignados.map((msg, index) => (
              <div
                key={index}
                className="whitespace-pre-line p-4 bg-green-100 border border-green-300 text-green-800 rounded-lg shadow-md text-center font-medium"
              >
                {msg}
              </div>
            ))}
          </div>
        )}

        {mostrarMapa && (
          <div className="mb-10">
            <h3 className="text-lg font-semibold text-green-800 mb-2 text-center">🗺 Carretera GC-100</h3>
            <div className="rounded-xl overflow-hidden border border-green-300 shadow-md" style={{ height: '300px' }}>
              <MapContainer
                center={[28.015, -15.405]}
                zoom={13}
                scrollWheelZoom={false}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Polyline positions={gc100Path} color="green" />
              </MapContainer>
            </div>
          </div>
        )}

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

        {activeTab === 'productos' && (
          <>
            <div className="text-center mb-10">
              <button
                onClick={toggleDropdown}
                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2.5 px-8 rounded-full shadow-md"
              >
                Seleccionar centros logísticos
              </button>

              {isDropdownVisible && (
                <div className="mt-6 flex justify-center">
                  <div className="bg-white border border-green-200 rounded-xl p-6 shadow-lg w-fit">
                    {logisticsCenters.map((center) => (
                      <label key={center.name} className="block text-md font-medium text-gray-800 mb-3">
                        <input
                          type="checkbox"
                          checked={selectedCenters.includes(center.name)}
                          onChange={() => handleCenterChange(center.name)}
                          className="mr-2 accent-green-500"
                        />
                        {center.name}
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
              <p className="italic text-gray-500">Selecciona un centro logístico para ver productos.</p>
            )}
          </>
        )}

        {activeTab === 'alertas' && (
          <>
            <h2 className="text-2xl font-semibold mb-4 text-red-600">🚨 Alertas de Reposición</h2>
            {stockAlerts.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full border-collapse bg-white rounded-xl shadow-md">
                  <thead>
                    <tr className="bg-red-100 text-red-800 text-sm uppercase tracking-wider">
                      <th className="px-6 py-3 border-b border-red-200 text-left">📦 Producto</th>
                      <th className="px-6 py-3 border-b border-red-200 text-left">🔢 Cantidad</th>
                      <th className="px-6 py-3 border-b border-red-200 text-left">🕓 Fecha</th>
                      <th className="px-6 py-3 border-b border-red-200 text-left">🛒 Tienda</th>
                      <th className="px-6 py-3 border-b border-red-200 text-left">✔️ Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stockAlerts.map((alert, index) => (
                      <tr key={index} className="hover:bg-red-50 transition-colors duration-200">
                        <td className="px-6 py-3 border-b border-gray-100">{alert.product}</td>
                        <td className="px-6 py-3 border-b border-gray-100">{alert.quantity}</td>
                        <td className="px-6 py-3 border-b border-gray-100">{alert.date}</td>
                        <td className="px-6 py-3 border-b border-gray-100">{alert.store}</td>
                        <td className="px-6 py-3 border-b border-gray-100">
                          <button
                            onClick={() =>
                              handleAceptarReposicion('Centro A', alert.store, alert.product, alert.quantity, alert.date)
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
            ) : (
              <p className="text-center italic text-gray-500">
                No hay alertas de reposición pendientes.
              </p>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Supplier;