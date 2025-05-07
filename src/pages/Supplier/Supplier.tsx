import React, { useState } from 'react';
import './Supplier.css';

function Supplier() {
  const [selectedCenters, setSelectedCenters] = useState<string[]>([]);
  const [isDropdownVisible, setIsDropdownVisible] = useState(false);

  const markets = ['Supermercado A', 'Supermercado B', 'Supermercado C'];
  const products = [
    { name: 'Producto 1', quantity: 100, center: 'Supermercado A' },
    { name: 'Producto 2', quantity: 50, center: 'Supermercado B' },
    { name: 'Producto 3', quantity: 200, center: 'Supermercado C' },
  ];

  const handleCenterChange = (center: string) => {
    setSelectedCenters((prev) =>
      prev.includes(center)
        ? prev.filter((c) => c !== center)
        : [...prev, center]
    );
  };

  const toggleDropdown = () => {
    setIsDropdownVisible((prev) => !prev);
  };

  const filteredProducts = products.filter((product) =>
    selectedCenters.includes(product.center)
  );

  return (
    <div className="supplier-container p-6 bg-red-50 min-h-screen">
      <h1 className="text-2xl text-red-700 font-bold mb-6">Panel de Proveedor</h1>

      <div className="logistics-center-selector mb-8">
        <div className="relative flex items-center justify-center">
          <button
            id="dropdownDefault"
            onClick={toggleDropdown}
            className="text-red-700 bg-white border border-red-300 rounded-lg shadow-sm hover:bg-red-100 focus:ring-4 focus:ring-red-200 font-medium text-sm px-4 py-2.5 text-center inline-flex items-center transition"
            type="button"
          >
            Seleccionar Supermercados
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isDropdownVisible && (
            <div className="absolute top-full mt-2 z-10 w-64 p-4 bg-white border border-red-200 rounded-lg shadow-lg">
              <ul className="space-y-2 text-sm text-red-800">
                <li className="flex items-center">
                  <label className="ml-2 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-red-600"
                      checked={selectedCenters.length === markets.length}
                      onChange={() =>
                        selectedCenters.length === markets.length
                          ? setSelectedCenters([])
                          : setSelectedCenters(markets)
                      }
                    />
                    <span className="ml-2">Todos</span>
                  </label>
                </li>
                {markets.map((center) => (
                  <li className="flex items-center" key={center}>
                    <label className="ml-2 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        className="w-4 h-4 accent-red-600"
                        checked={selectedCenters.includes(center)}
                        onChange={() => handleCenterChange(center)}
                      />
                      <span className="ml-2">{center}</span>
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>

      <div className="product-list">
        <h2 className="text-xl text-red-600 font-semibold mb-4">Productos disponibles</h2>
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-3 gap-4 bg-red-100 p-4 rounded shadow">
            <div className="font-bold text-red-800">Nombre</div>
            <div className="font-bold text-red-800">Cantidad</div>
            <div className="font-bold text-red-800">Supermercado</div>
            {filteredProducts.map((product, index) => (
              <React.Fragment key={index}>
                <div className="border-b border-red-300 py-2 text-red-700">{product.name}</div>
                <div className="border-b border-red-300 py-2 text-red-700">{product.quantity}</div>
                <div className="border-b border-red-300 py-2 text-red-700">{product.center}</div>
              </React.Fragment>
            ))}
          </div>
        ) : (
          <p className="text-red-500">No hay productos disponibles para los supermercados seleccionados.</p>
        )}
      </div>
    </div>
  );
}

export default Supplier;