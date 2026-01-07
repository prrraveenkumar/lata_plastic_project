import { useState, useEffect } from 'react';
import { RefreshCw, Plus, Trash2 } from 'lucide-react';
import { Input, Select } from '../ui';

const OrdersModule = ({ makeRequest, user }) => {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    oldBalance: 0,
    productList: []
  });
  const [newProduct, setNewProduct] = useState({ productId: '', quantity: 0, pricePerUnit: '' });

  const loadOrders = async () => {
    const result = await makeRequest('/orders?page=1&limit=50');
    if (result && result.data && result.data.orders) {
      setOrders(result.data.orders);
    }
  };

  const loadClients = async () => {
    const result = await makeRequest('/clients?page=1&limit=100');
    if (result && result.data && result.data.clients) {
      setClients(result.data.clients);
    }
  };

  const loadProducts = async () => {
    const result = await makeRequest('/products?page=1&limit=100');
    if (result && result.data && result.data.products) {
      setProducts(result.data.products);
    }
  };

  useEffect(() => {
    loadClients();
    loadProducts();
    loadOrders();
  }, []);

  const addProductToOrder = () => {
    if (newProduct.productId) {
      setFormData({
        ...formData,
        productList: [...formData.productList, { ...newProduct }]
      });
      setNewProduct({ productId: '', quantity: 1, pricePerUnit: '' });
    }
  };

  const createOrder = async () => {
    const result = await makeRequest('/orders/', 'POST', formData);
    if (result && result.success !== false) {
      setShowCreateForm(false);
      loadOrders();
      setFormData({ clientId: '', oldBalance: 0, productList: [] });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Orders Management</h2>
        <div className="flex space-x-2">
          <button onClick={loadOrders} className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          {user?.role !== 'client' && (
            <button onClick={() => setShowCreateForm(!showCreateForm)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
              <Plus className="w-4 h-4" />
              <span>Create Order</span>
            </button>
          )}
        </div>
      </div>

      {showCreateForm && (
        <div className=" fixed inset-0 flex items-center justify-center bg-white/20 backdrop-blur-sm z-50 ">
          <div className=" fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 
              border border-black rounded-lg space-y-4 bg-white/70 backdrop-blur-md p-4 shadow-xl">
            <div className = "flex justify-between">
              <h3 className="font-semibold text-gray-900">Create New Order</h3>
              <button onClick={() => setShowCreateForm(false)} className="text-gray-600 hover:text-gray-800 bg-transparent">X</button>
            </div>
            <div>
              <Select label="Client" value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} options={clients.map(c => ({ value: c._id, label: `${c.fullname} (${c.mobileno})` }))} />
              <Input label="Old Balance" type="number" value={formData.oldBalance} onChange={(e) => setFormData({ ...formData, oldBalance: parseFloat(e.target.value) || 0 })} />
            </div>

            <div className="border-t pt-4">
              <h4 className="font-medium text-gray-900 mb-2">Add Products</h4>
              <div className="grid grid-cols-4 gap-2 mb-2">
                <Select value={newProduct.productId} onChange={(e) => setNewProduct({ ...newProduct, productId: e.target.value })} options={products.map(p => ({ value: p._id, label: `${p.name} (₹${p.price})` }))} />
                <Input type="number" placeholder="Quantity" value={newProduct.quantity} onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 1 })} />
                <Input type="number" placeholder="Price/Unit" value={newProduct.pricePerUnit} onChange={(e) => setNewProduct({ ...newProduct, pricePerUnit: e.target.value })} />
                <button onClick={addProductToOrder} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Add</button>
              </div>

              {formData.productList.length > 0 && (
                <div className="space-y-2 text-gray-900">
                  {formData.productList.map((item, idx) => {
                    const prod = products.find(p => p._id === item.productId);
                    return (
                      <div key={idx} className="flex items-center justify-between p-2 bg-white rounded">
                        <span className="text-sm">{prod?.name} - Qty: {item.quantity} - Price: ₹{item.pricePerUnit || prod?.price}</span>
                        <button onClick={() => setFormData({ ...formData, productList: formData.productList.filter((_, i) => i !== idx) })} className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            <div className="flex space-x-2">
              <button onClick={createOrder} disabled={formData.productList.length === 0} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">Create Order</button>
              <button onClick={() => setShowCreateForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {orders.map((order) => (
          <div key={order._id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-gray-900">{order.billNumber}</h3>
                <p className="text-sm text-gray-600">Client: {order.client?.fullname}</p>
                <div className="flex space-x-4 mt-2 text-sm">
                  <span className='text-gray-900'>Total: <strong>₹{order.totalAmount}</strong></span>
                  <span className='text-gray-900'>Paid: <strong>₹{order.amountPaid || 0}</strong></span>
                  <span className={`px-2 py-1 rounded text-xs ${order.paymentStatus === 'Paid' ? 'bg-green-100 text-green-800' :
                      order.paymentStatus === 'Partially Paid' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                    }`}>{order.paymentStatus}</span>
                </div>
              </div>
              <button onClick={() => makeRequest(`/orders/${order._id}`)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersModule;

