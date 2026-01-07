import { useState, useEffect } from 'react';
import { Header, Sidebar, ApiResponsePanel, LoadingSpinner } from './components/layout';
import { AuthModule, Dashboard, ClientsModule, ProductsModule, OrdersModule, PaymentsModule, OCRModule } from './components/modules';
import { makeRequest } from './utils/api';

const App = () => {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('auth');
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
      setActiveTab('dashboard');
    }
  }, []);

  const handleMakeRequest = async (endpoint, method = 'GET', data = null, useFormData = false) => {
    return await makeRequest(endpoint, method, data, useFormData, setApiResponse, setLoading);
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    setUser(null);
    setActiveTab('auth');
    handleMakeRequest('/users/logout', 'POST');
  };

  const renderActiveModule = () => {

    switch (activeTab) {
      case 'auth':
        return <AuthModule makeRequest={handleMakeRequest} setUser={setUser} setActiveTab={setActiveTab} />;
      case 'dashboard':
        return <Dashboard user={user} makeRequest={handleMakeRequest} setActiveTab={setActiveTab} />;
      case 'clients':
        return <ClientsModule makeRequest={handleMakeRequest} user={user} setActiveTab={setActiveTab} />;
      case 'products':
        return <ProductsModule makeRequest={handleMakeRequest} user={user} />;
      case 'orders':
        return <OrdersModule makeRequest={handleMakeRequest} user={user} />;
      case 'payments':
        return <PaymentsModule makeRequest={handleMakeRequest} user={user} />;
      case 'ocr':
        return <OCRModule makeRequest={handleMakeRequest} />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen w-full bg-gray-50">
      <Header user={user} onLogout={handleLogout} />

      <div className="w-full mx-auto px-4 py-6">
        <div className="grid w-full grid-cols-12 gap-6">
          <div className="col-span-3">
            <Sidebar user={user} activeTab={activeTab} onTabChange={setActiveTab} />
            <ApiResponsePanel apiResponse={apiResponse} />
          </div>

          <div className="col-span-9 relative min-h-100">
            {renderActiveModule()}

            {/* The spinner only appears on top when loading is true */}
            {loading && (
              <div className="absolute inset-0 z-50 flex items-center justify-center bg-white/70 backdrop-blur-sm rounded-lg">
                <LoadingSpinner />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
