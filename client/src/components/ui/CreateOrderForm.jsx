import react, {useState, UseEffect} from 'react'
import Input from './Input';
import Select from './Select';
import { Trash2 } from 'lucide-react';
import { makeRequest } from '../../utils/api.js';

const CreateOrderForm = ({ setShowCreateForm, Data, loadOrders }) => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);

  // Use a safer initialization for formData
  const [formData, setFormData] = useState({
    clientId: Data?.matchedClient?._id || "",
    oldBalance: Data?.extracted?.oldBalance || 0,
    // Safely map matchedItems from Gemini result to your form format
    productList: Data?.matchedItems?.map(item => ({
      productId: item.productId || "",
      quantity: item.quantity || 0,
      pricePerUnit: item.price || ""
    })) || [],
  });

  const [newProduct, setNewProduct] = useState({
    productId: "",
    quantity: 1,
    pricePerUnit: "",
  });

  // ... (loadClients and loadProducts remain the same)
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
    }, []);

  const createOrder = async () => {
    // Basic validation before sending
    if (!formData.clientId || formData.productList.length === 0) {
      alert("Please select a client and add at least one product.");
      return;
    }

    const result = await makeRequest('/orders/', 'POST', formData);
    if (result && result.success !== false) {
      setShowCreateForm(false);
      if (loadOrders) loadOrders(); // Check if function exists before calling
      setFormData({ clientId: '', oldBalance: 0, productList: [] });
    }
  };


  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
      {/* Increased max-width and added overflow handling for long lists */}
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-6">
        
        <div className="flex justify-between items-center border-b pb-4">
          <h3 className="text-xl font-bold text-gray-800">Create New Order</h3>
          <button onClick={() => setShowCreateForm(false)} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
            <Trash2 className="w-5 h-5 text-gray-400 rotate-45" /> {/* Use X icon or simple X */}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select 
            label="Client" 
            value={formData.clientId} 
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} 
            options={clients.map(c => ({ value: c._id, label: `${c.fullname} (${c.mobileno})` }))} 
          />
          <Input 
            label="Old Balance" 
            type="number" 
            value={formData.oldBalance} 
            onChange={(e) => setFormData({ ...formData, oldBalance: parseFloat(e.target.value) || 0 })} 
          />
        </div>

        {/* ... (Rest of your Add Products section) ... */}
        
        {/* Render List safely */}
        <div className="space-y-2">
          {formData.productList.map((item, idx) => {
            const prod = products.find(p => p._id === item.productId);
            return (
              <div key={idx} className="flex items-center justify-between p-3 bg-blue-50/50 border border-blue-100 rounded-lg">
                <span className="text-sm font-medium text-blue-900">
                  {prod?.name || "Unknown Product"} — {item.quantity} x ₹{item.pricePerUnit}
                </span>
                <button onClick={() => setFormData({ ...formData, productList: formData.productList.filter((_, i) => i !== idx) })} className="text-red-500 hover:bg-red-100 p-1 rounded">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button onClick={() => setShowCreateForm(false)} className="px-6 py-2 text-gray-600 font-medium">Cancel</button>
          <button 
            onClick={createOrder} 
            disabled={formData.productList.length === 0} 
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-all"
          >
            Confirm & Save Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderForm;