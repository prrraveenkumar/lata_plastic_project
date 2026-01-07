import { useState } from 'react';
import { Input, Select } from '../ui';

const AuthModule = ({ makeRequest, setUser, setActiveTab }) => {
  const [isRegister, setIsRegister] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({
    fullname: '',
    mobileno: '',
    password: '',
    email: '',
    address: '',
    role: 'client'
  });

  const handleSubmit = async () => {
    setError(null);
    
    // Basic validation
    if (!formData.mobileno || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }
    
    const endpoint = isRegister ? '/users/register' : '/users/login';
    const data = isRegister ? formData : { mobileno: formData.mobileno, password: formData.password };
    
    const result = await makeRequest(endpoint, 'POST', data);
    
    if (result && result.success && result.data && result.data.user) {
      localStorage.setItem('user', JSON.stringify(result.data.user));
      setUser(result.data.user);
      setActiveTab('dashboard');
    } else if (result && !result.success) {
      setError(result.message || 'Login failed. Please check your credentials.');
    } else if (!result) {
      setError('Cannot connect to server. Please ensure the backend is running.');
    }
  };

  return (
    <div className="bg-white w-full rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">
        {isRegister ? 'Register' : 'Login'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">{error}</p>
        </div>
      )}

      <div className="space-y-4">
        {isRegister && (
          <>
            <Input
              label="Full Name"
              value={formData.fullname}
              onChange={(e) => setFormData({ ...formData, fullname: e.target.value })}
            />
            <Input
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
            <Input
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
            />
            <Select
              label="Role"
              value={formData.role}
              onChange={(e) => setFormData({ ...formData, role: e.target.value })}
              options={[
                { value: 'client', label: 'Client' },
                { value: 'staff', label: 'Staff' },
                { value: 'admin', label: 'Admin' }
              ]}
            />
          </>
        )}

        <Input
          label="Mobile Number"
          value={formData.mobileno}
          onChange={(e) => setFormData({ ...formData, mobileno: e.target.value })}
        />

        <Input
          label="Password"
          type="password"
          value={formData.password}
          onChange={(e) => setFormData({ ...formData, password: e.target.value })}
        />

        <button
          onClick={handleSubmit}
          className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 font-medium"
        >
          {isRegister ? 'Register' : 'Login'}
        </button>
      </div>

      <button
        onClick={() => setIsRegister(!isRegister)}
        className="w-full mt-4 text-sm text-blue-600 hover:text-blue-700"
      >
        {isRegister ? 'Already have an account? Login' : "Don't have an account? Register"}
      </button>
    </div>
  );
};

export default AuthModule;

