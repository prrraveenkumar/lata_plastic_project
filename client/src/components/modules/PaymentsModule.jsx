import { useState, useEffect } from 'react';
import { RefreshCw, DollarSign } from 'lucide-react';
import { Input, Select } from '../ui';

const PaymentsModule = ({ makeRequest, user }) => {
  const [payments, setPayments] = useState([]);
  const [clients, setClients] = useState([]);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [formData, setFormData] = useState({
    clientId: '',
    paymentAmount: '',
    paymentMethod: 'cash',
    referenceNumber: ''
  });

  const loadPayments = async () => {
    const result = await makeRequest('/payments?page=1&limit=50');
    if (result && result.data && result.data.payments) {
      setPayments(result.data.payments);
    }
  };

  const loadClients = async () => {
    const result = await makeRequest('/clients?page=1&limit=100');
    if (result && result.data && result.data.clients) {
      setClients(result.data.clients);
    }
  };

  useEffect(() => {
    loadClients();
  }, []);

  const processPayment = async () => {
    const result = await makeRequest('/clients/process-payment', 'POST', formData);
    if (result && result.success !== false) {
      setShowPaymentForm(false);
      loadPayments();
      setFormData({ clientId: '', paymentAmount: '', paymentMethod: 'cash', referenceNumber: '' });
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-900">Payments Management</h2>
        <div className="flex space-x-2">
          <button onClick={loadPayments} className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200">
            <RefreshCw className="w-4 h-4" />
            <span>Refresh</span>
          </button>
          {user?.role !== 'client' && (
            <button onClick={() => setShowPaymentForm(!showPaymentForm)} className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
              <DollarSign className="w-4 h-4" />
              <span>Process Payment</span>
            </button>
          )}
        </div>
      </div>

      {showPaymentForm && (
        <div className="mb-6 p-4 bg-gray-50 rounded-lg space-y-4">
          <h3 className="font-semibold text-gray-900">Process Client Payment</h3>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Client" value={formData.clientId} onChange={(e) => setFormData({ ...formData, clientId: e.target.value })} options={clients.map(c => ({ value: c._id, label: `${c.fullname} (${c.mobileno})` }))} />
            <Input label="Payment Amount" type="number" value={formData.paymentAmount} onChange={(e) => setFormData({ ...formData, paymentAmount: e.target.value })} />
            <Select label="Payment Method" value={formData.paymentMethod} onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })} options={[
              { value: 'cash', label: 'Cash' },
              { value: 'card', label: 'Card' },
              { value: 'upi', label: 'UPI' },
              { value: 'bank_transfer', label: 'Bank Transfer' }
            ]} />
            <Input label="Reference Number" value={formData.referenceNumber} onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })} />
          </div>
          <div className="flex space-x-2">
            <button onClick={processPayment} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">Process Payment</button>
            <button onClick={() => setShowPaymentForm(false)} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {payments.map((payment) => (
          <div key={payment._id} className="p-4 bg-gray-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-semibold text-gray-900">₹{payment.amount}</p>
                <p className="text-sm text-gray-600">Client: {payment.client?.fullname}</p>
                <div className="flex space-x-4 mt-2 text-sm text-gray-600">
                  <span>Method: <strong>{payment.paymentMethod}</strong></span>
                  {payment.referenceNumber && <span>Ref: <strong>{payment.referenceNumber}</strong></span>}
                  <span>By: <strong>{payment.receivedBy?.fullname}</strong></span>
                </div>
              </div>
              <button onClick={() => makeRequest(`/payments/${payment._id}`)} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">View</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PaymentsModule;

