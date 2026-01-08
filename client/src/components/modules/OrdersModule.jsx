import { useState, useEffect } from 'react';
import { RefreshCw, Plus, Trash2 } from 'lucide-react';
import { Input, Select } from '../ui';
import CreateOrderForm from '../ui/CreateOrderForm.jsx';

const OrdersModule = ({ makeRequest, user }) => {
  const [orders, setOrders] = useState([]);
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    oldBalance: 0,
    productList: []
  })

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
        <CreateOrderForm setShowCreateForm={setShowCreateForm}  data={formData} setParentFormData={setFormData} />
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
              <button
                onClick={() => {
                  setFormData({
                    clientId: order.client?._id,
                    oldBalance: order.oldBalance,
                    productList: order.productList
                  });
                  setShowCreateForm(true);
                }}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                View
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default OrdersModule;

