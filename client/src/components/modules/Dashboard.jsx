import { useEffect, useState } from 'react';
import { DollarSign, ShoppingCart, CheckCircle, User, Package } from 'lucide-react';
import { StatCard, ActionButton } from '../ui';

const Dashboard = ({ user, makeRequest, setActiveTab }) => {
  const [stats, setStats] = useState(null);
  const [viewTab, setViewTab] = useState('orders');  

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    if (user?.role === 'client') {
      const result = await makeRequest('/clients/my-credit');
      if (result && result.data) {
        setStats(result.data);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Welcome, {user?.fullname}!</h2>
        <p className="text-gray-600">Role: <span className="font-medium text-gray-900">{user?.role}</span></p>
        <p className="text-gray-600">Mobile: <span className="font-medium text-gray-900">{user?.mobileno}</span></p>
      </div>

      {stats && (
        <div className="grid grid-cols-3 gap-4">
          <StatCard icon={DollarSign} label="Credit Balance" value={`₹${stats.creditBalance || 0}`} color="red" />
          <StatCard icon={ShoppingCart} label="Total Orders" value={stats.totalOrders} color="blue" />
          <StatCard icon={CheckCircle} label="Paid Orders" value={stats.paidOrders} color="green" />
        </div>
      )}

      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 gap-4">
          {user?.role === 'client' && (
            <>
              <ActionButton icon={DollarSign} label="View My Payments" onClick={() => setViewTab('payments')} />
              <ActionButton icon={ShoppingCart} label="View My Orders" onClick={() => setViewTab('orders')} />
            </>
          )}
          {user?.role !== 'client' && (
            <>
              <ActionButton icon={User} label="View Payments" onClick={() => setActiveTab('payments')} />
              <ActionButton icon={Package} label="View Products" onClick={() => { makeRequest('/products/'); setActiveTab('products'); }} />
              <ActionButton icon={User} label="Get All Clients" onClick={() => { makeRequest('/clients?page=1&limit=10'); setActiveTab('clients'); }} />
              <ActionButton icon={ShoppingCart} label="Get All Orders" onClick={() => { makeRequest('/orders?page=1&limit=10'); setActiveTab('orders'); }} />
            </>
          )}
          {user?.role === 'client' && viewTab === 'payments' && stats?.payments && stats.payments.map((payment) => (
            <div key={payment.id} className="border-b border-gray-200 py-2">
              <p className="text-sm text-gray-600">Amount: <span className="font-medium text-gray-900">₹{payment.amount}</span></p>
              <p className="text-sm text-gray-600">Status: <span className="font-medium text-gray-900">{payment.status}</span></p>
              <p className="text-sm text-gray-600">Date: <span className="font-medium text-gray-900">{payment.createdAt}</span></p>
            </div>
          ))}
           {user?.role === 'client' && viewTab === 'orders' && stats?.orders && stats.orders.map((order) => (
            <div key={order.id} className="border-b border-gray-200 py-2">
              <p className="text-sm text-gray-600">Amount: <span className="font-medium text-gray-900">₹{order.totalAmount}</span></p>
              <p className="text-sm text-gray-600">Status: <span className="font-medium text-gray-900">{order.paymentStatus}</span></p>
              <p className="text-sm text-gray-600">Date: <span className="font-medium text-gray-900">{order.createdAt}</span></p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

