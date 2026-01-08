import { useState } from 'react';
import { RefreshCw, Plus } from 'lucide-react';
import { Input, Select } from '../ui';
import { useEffect } from 'react';
import UpdateQuantityform from '../layout/UpdateQuantityform';

const ProductsModule = ({ makeRequest, user }) => {
  const [products, setProducts] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    stockQuantity: '',
    unit: 'kg',
    category: 'regular'
  });

  const [showUpdateQuantityform, setShowUpdateQuantityform] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);

  const loadProducts = async () => {
    const result = await makeRequest('/products', 'GET');
    if (result && result.data && result.data.products) {
      setProducts(result.data.products);
      console.log(result.data.products);
    }
  };

  const addProduct = async () => {
    const result = await makeRequest('/products', 'POST', formData);
    if (result && result.success !== false) {
      setShowAddForm(false);
      loadProducts();
      setFormData({ name: '', description: '', price: '', stockQuantity: '', unit: 'kg', category: 'regular' });
    }
  };

  const updateStock = async (productId, quantity, operation) => {
    await makeRequest(`/products/${productId}/stock`, 'PATCH', { stockQuantity: quantity, operation });
    loadProducts();
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">{user?.role === 'admin' ? 'Products Management' : 'All Products'}</h2>
        <div className="flex space-x-2">
          <button onClick={loadProducts} className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          {user?.role === 'admin' && (
            <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              <span>Add Product</span>
            </button>
          )}
        </div>
      </div>

      {showAddForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900">Add New Product</h3>
          <div className="grid grid-cols-2 gap-4">
            <Input label="Product Name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} />
            <Input label="Price" type="number" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} />
            <Input label="Stock Quantity" type="number" value={formData.stockQuantity} onChange={(e) => setFormData({ ...formData, stockQuantity: e.target.value })} />
            <Select label="Unit" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} options={[
              { value: 'kg', label: 'Kilogram' },
              { value: 'liter', label: 'Liter' },
              { value: 'piece', label: 'Piece' },
              { value: 'box', label: 'Box' }
            ]} />
          </div>
          <Input label="Description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
          <Select label="Category" value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value })} options={[
            { value: 'regular', label: 'Regular' },
            { value: 'premium', label: 'Premium' },
            { value: 'wholesale', label: 'Wholesale' }
          ]} />
          <div className="flex space-x-2">
            <button onClick={addProduct} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Product</button>
            <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {products.map((product) => (
          <div key={product._id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
                <div className="flex space-x-4 mt-2 text-sm">
                  <span className="text-gray-700">Price: <strong>₹{product.price}</strong></span>
                  <span className="text-gray-700">Stock: <strong>{product.stockQuantity} {product.unit}</strong></span>
                  <span className="text-gray-700">Category: <strong>{product.category}</strong></span>
                </div>
              </div>
              {user?.role === 'admin' && (
                <div className="flex space-x-2">
                  <button onClick={() => { setShowUpdateQuantityform(true); setSelectedProduct(product); }} className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-sm">Update Stock</button>
                  <button onClick={() => updateStock(product._id, 50, 'set')} className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">Set 50</button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
      {showUpdateQuantityform && <UpdateQuantityform product={selectedProduct} setShowUpdateQuantityform={setShowUpdateQuantityform} updateStock={updateStock} />}

    </div>
  );
};

export default ProductsModule;

