import React, { useState, useEffect, useMemo } from 'react'; // Added useMemo
import Input from './Input';
import Select from './Select';
import { Trash2, PlusCircle } from 'lucide-react'; // Added PlusCircle icon
import { makeRequest } from '../../utils/api.js';

const CreateOrderForm = ({ setShowCreateForm, data, loadOrders }) => {
  const [clients, setClients] = useState([]);
  const [products, setProducts] = useState([]);

  const [formData, setFormData] = useState({
    clientId: "",
    oldBalance: 0,
    productList: [],
  });

  const [newProduct, setNewProduct] = useState({
    productId: "",
    quantity: 1,
    pricePerUnit: "",
  });

  // 1. DYNAMIC CALCULATIONS (Grand Total)
  const totals = useMemo(() => {
    const subtotal = formData.productList.reduce((acc, item) =>
      acc + (item.quantity * (item.pricePerUnit || 0)), 0
    );
    const grandTotal = subtotal + (parseFloat(formData.oldBalance) || 0);
    return { subtotal, grandTotal };
  }, [formData.productList, formData.oldBalance]);

  useEffect(() => {
    loadClients();
    loadProducts();
  }, []);

  useEffect(() => {
    if (!data) return;

    setFormData({
      clientId: data.matchedClient?._id ?? "",
      oldBalance: data.extracted?.oldBalance ?? 0,
      productList: data.matchedItems?.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        pricePerUnit: item.price
      })) ?? []
    });
  }, [data]);

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
  // 2. ADD PRODUCT LOGIC
  const addProduct = () => {
    if (!newProduct.productId) return alert("Select a product first");

    // Check if product already exists in list
    const existingIndex = formData.productList.findIndex(p => p.productId === newProduct.productId);

    if (existingIndex > -1) {
      const updatedList = [...formData.productList];
      updatedList[existingIndex].quantity += newProduct.quantity;
      setFormData({ ...formData, productList: updatedList });
    } else {
      setFormData({
        ...formData,
        productList: [...formData.productList, { ...newProduct }]
      });
    }
    setNewProduct({ productId: "", quantity: 1, pricePerUnit: "" });
  };

  const createOrder = async () => {
    if (!formData.clientId || formData.productList.length === 0) {
      alert("Please select a client and add at least one product.");
      return;
    }
    const result = await makeRequest('/orders/', 'POST', formData);
    if (result && result.success !== false) {
      setShowCreateForm(false);
      if (loadOrders) loadOrders();
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 flex flex-col">

        {/* Header */}
        <div className="flex justify-between items-center border-b pb-4 mb-4">
          <h3 className="text-xl font-bold text-gray-800">Create New Order</h3>
          <button onClick={() => setShowCreateForm(false)} className="text-gray-400 hover:text-red-500 font-bold text-2xl">×</button>
        </div>

        {/* Client & Balance Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Select
            label="Client Name"
            value={formData.clientId}
            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
            options={clients.map(c => ({ value: c._id, label: `${c.fullname} (${c.mobileno})` }))}
          />
          <Input
            label="Old Balance (₹)"
            type="number"
            value={formData.oldBalance}
            onChange={(e) => setFormData({ ...formData, oldBalance: e.target.value })}
          />
        </div>

        {/* Add New Product Section */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-6">
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Quick Add Item</h4>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
            <Select
              value={newProduct.productId}
              onChange={(e) => {
                const p = products.find(prod => prod._id === e.target.value);
                setNewProduct({ ...newProduct, productId: e.target.value, pricePerUnit: p?.price || "" });
              }}
              options={products.map(p => ({ value: p._id, label: p.name }))}
            />
            <Input
              placeholder="Qty"
              type="number"
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({ ...newProduct, quantity: parseInt(e.target.value) || 0 })}
            />
            <Input
              placeholder="Price"
              type="number"
              value={newProduct.pricePerUnit}
              onChange={(e) => setNewProduct({ ...newProduct, pricePerUnit: parseFloat(e.target.value) || 0 })}
            />
            <button onClick={addProduct} className="bg-green-600 text-white h-10 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700">
              <PlusCircle size={18} /> Add
            </button>
          </div>
        </div>

        {/* Order Summary Table */}
        <div className="flex-1 overflow-y-auto min-h-[200px] mb-6">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-gray-600 text-sm uppercase">
              <tr>
                <th className="p-2">Item Name</th>
                <th className="p-2">Qty</th>
                <th className="p-2">Rate</th>
                <th className="p-2">Amount</th>
                <th className="p-2"></th>
              </tr>
            </thead>
            <tbody>
              {formData.productList.map((item, idx) => {
                const prod = products.find(p => p._id === item.productId);
                return (
                  <tr key={idx} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium text-gray-700">{prod?.name || "Searching..."}</td>
                    <td className="p-2 text-gray-700">{item.quantity}</td>
                    <td className="p-2 text-gray-700">₹{item.pricePerUnit}</td>
                    <td className="p-2 font-bold text-blue-700">₹{(item.quantity * item.pricePerUnit).toFixed(2)}</td>
                    <td className="p-2 text-right">
                      <button onClick={() => setFormData({ ...formData, productList: formData.productList.filter((_, i) => i !== idx) })} className="text-red-400 hover:text-red-600">
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Totals Footer */}
        <div className="bg-blue-50 p-4 rounded-lg space-y-2 border border-blue-100">
          <div className="flex justify-between text-gray-600">
            <span>Items Subtotal:</span>
            <span>₹{totals.subtotal.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-gray-600 border-b pb-2">
            <span>Previous Balance:</span>
            <span>+ ₹{parseFloat(formData.oldBalance || 0).toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-blue-900 pt-1">
            <span>Grand Total:</span>
            <span>₹{totals.grandTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button onClick={() => setShowCreateForm(false)} className="px-6 py-2 border rounded-lg hover:bg-gray-100">Cancel</button>
          <button onClick={createOrder} className="px-8 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-md transition-all active:scale-95">
            Create Order
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateOrderForm;