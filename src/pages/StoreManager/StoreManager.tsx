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
    <div className="store-manager-container">
      <h1 className="text-xl font-bold mb-4">Store Manager</h1>
      <div className="logistics-center-selector mb-4">
        <h2 className="text-lg font-semibold">Select Logistics Centers:</h2>
        <ul className="list-none space-y-2">
          {logisticsCenters.map((center) => (
            <li key={center}>
              <label>
                <input
                  type="checkbox"
                  value={center}
                  checked={selectedCenters.includes(center)}
                  onChange={() => handleCenterChange(center)}
                />
                {center}
              </label>
            </li>
          ))}
        </ul>
      </div>
      <div className="product-list">
        <h2 className="text-lg font-semibold">Products:</h2>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 bg-gray-100 p-4 rounded shadow">
            <div className="font-bold">Name</div>
            <div className="font-bold">Quantity</div>
            <div className="font-bold">Logistics Center</div>
            {filteredProducts.map((product, index) => (
              <React.Fragment key={index}>
                <div className="border-b border-gray-300 py-2">{product.name}</div>
                <div className="border-b border-gray-300 py-2">{product.quantity}</div>
                <div className="border-b border-gray-300 py-2">{product.center}</div>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <p>No products available for the selected logistics centers.</p>
        )}
      </div>
    </div>
  );
}

export default StoreManager;