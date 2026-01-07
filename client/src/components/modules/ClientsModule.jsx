import { useState, useEffect } from 'react'; // Added useEffect import
import { RefreshCw, Plus } from 'lucide-react';
import { Input, InfoItem } from '../ui';
import { SearchBar } from '../ui/SearchBar';

const ClientsModule = ({ makeRequest, user }) => {
  const [clients, setClients] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    fullname: '', mobileno: '', password: '', email: '', address: ''
  });

  const loadClients = async () => {
    const result = await makeRequest('/clients?page=1&limit=50');
    if (result?.data?.clients) {
      setClients(result.data.clients);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const addClient = async () => {
    const result = await makeRequest('/clients', 'POST', formData);
    if (result && result.success !== false) {
      setShowAddForm(false);
      loadClients();
      setFormData({ fullname: '', mobileno: '', password: '', email: '', address: '' });
    }
  };

  const viewClientDetails = async (clientId) => {
    const result = await makeRequest(`/clients/${clientId}`);
    if (result?.data) {
      setSelectedClient(result.data);
    }
  };

  return (
    <>
      <div className="space-y-6">
        {/* Search Bar placed inside the spacing wrapper */}
        <SearchBar 
          makeRequest={makeRequest} 
          endpoint="/clients" 
          onResultsFound={(res) => setClients(res?.data?.clients || res?.clients || [])} 
        />

        <div className="bg-white rounded-lg shadow-sm p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-gray-900">Clients Management</h2>
            <div className="flex space-x-2">
              <button onClick={loadClients} className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
                <RefreshCw className="w-4 h-4" />
                <span>Refresh</span>
              </button>
              {user?.role !== 'client' && (
                <button onClick={() => setShowAddForm(!showAddForm)} className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Plus className="w-4 h-4" />
                  <span>Add Client</span>
                </button>
              )}
            </div>
          </div>

          {showAddForm && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
              <h3 className="font-semibold text-gray-900">Add New Client</h3>
              <div className="grid grid-cols-2 gap-4">
                <Input label="Full Name" value={formData.fullname} onChange={(e) => setFormData({ ...formData, fullname: e.target.value })} />
                <Input label="Mobile Number" value={formData.mobileno} onChange={(e) => setFormData({ ...formData, mobileno: e.target.value })} />
                <Input label="Password" type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} />
                <Input label="Email" type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} />
              </div>
              <Input label="Address" value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} />
              <div className="flex space-x-2">
                <button onClick={addClient} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Add Client</button>
                <button onClick={() => setShowAddForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
              </div>
            </div>
          )}

          <div className="space-y-2">
            {clients.map((client) => (
              <div key={client._id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100">
                <div>
                  <p className="font-medium text-gray-900">{client.fullname}</p>
                  <p className="text-sm text-gray-600">{client.mobileno}</p>
                </div>
                <button onClick={() => viewClientDetails(client._id)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  View Details
                </button>
              </div>
            ))}
          </div>
        </div>

        {selectedClient && (
          <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Client Details</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <InfoItem label="Name" value={selectedClient.client.fullname} />
              <InfoItem label="Mobile" value={selectedClient.client.mobileno} />
              <InfoItem label="Email" value={selectedClient.client.email} />
              <InfoItem label="Total Credit" value={`₹${selectedClient.client.totalCredit || 0}`} />
            </div>
            
            <h4 className="font-semibold text-gray-900 mb-2">Orders ({selectedClient.orders.length})</h4>
            <div className="space-y-2">
              {selectedClient.orders.slice(0, 5).map((order) => (
                <div key={order._id} className="p-3 bg-gray-50 rounded">
                  <p className="text-sm font-medium">{order.billNumber}</p>
                  <p className="text-sm text-gray-600">Total: ₹{order.totalAmount} | Status: {order.paymentStatus}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default ClientsModule;