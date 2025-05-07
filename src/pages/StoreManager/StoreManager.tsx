import React, { useState } from 'react';
import './StoreManager.css';

function StoreManager() {
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);
  const logisticsCenters = ['Center A', 'Center B', 'Center C'];
  const products = [
    { name: 'Product 1', quantity: 100, center: 'Center A' },
    { name: 'Product 2', quantity: 50, center: 'Center B' },
    { name: 'Product 3', quantity: 200, center: 'Center C' },
  ];

  const handleCenterChange = (center: string) => {
    setSelectedCenters((prev) =>
      prev.includes(center)
        ? prev.filter((c) => c !== center)
        : [...prev, center]
    );
  };

  const filteredProducts = products.filter((product) =>
    selectedCenters.includes(product.center)
  );

  return (
    <div className="store-manager-container p-6 bg-red-50 min-h-screen">
      <h1 className="text-2xl text-red-700 font-bold mb-6">Gestión de Tienda</h1>

      <div className="logistics-center-selector mb-6">
        <h2 className="text-lg text-red-600 font-semibold mb-2">Selecciona centros logísticos:</h2>
        <ul className="list-none space-y-2">
          {logisticsCenters.map((center) => (
            <li key={center}>
              <label className="flex items-center gap-2 text-red-800">
                <input
                  type="checkbox"
                  value={center}
                  checked={selectedCenters.includes(center)}
                  onChange={() => handleCenterChange(center)}
                  className="accent-red-600"
                />
                {center}
              </label>
            </li>
          ))}
        </ul>
      </div>

      <div className="product-list">
        <h2 className="text-lg text-red-600 font-semibold mb-2">Productos:</h2>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 bg-red-100 p-4 rounded shadow">
            <div className="font-bold text-red-800">Nombre</div>
            <div className="font-bold text-red-800">Cantidad</div>
            <div className="font-bold text-red-800">Centro</div>
            {filteredProducts.map((product, index) => (
              <React.Fragment key={index}>
                <div className="border-b border-red-300 py-2 text-red-700">{product.name}</div>
                <div className="border-b border-red-300 py-2 text-red-700">{product.quantity}</div>
                <div className="border-b border-red-300 py-2 text-red-700">{product.center}</div>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <p className="text-red-500">No hay productos para los centros seleccionados.</p>
        )}
      </div>
    </div>
  );
}

export default StoreManager;