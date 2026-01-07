import { User, Package, ShoppingCart, DollarSign, FileText } from 'lucide-react';
import { TabButton } from '../ui';

const Sidebar = ({ user, activeTab, onTabChange }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm p-4">
      <h3 className="text-sm font-semibold text-gray-700 mb-3">Modules</h3>
      <nav className="space-y-1">
        {!user ? (
          <TabButton 
            icon={User} 
            label="Authentication" 
            active={activeTab === 'auth'} 
            onClick={() => onTabChange('auth')} 
          />
        ) : (
          <>
            <TabButton 
              icon={Package} 
              label="Dashboard" 
              active={activeTab === 'dashboard'} 
              onClick={() => onTabChange('dashboard')} 
            />
            {user?.role == "admin" && (
              <TabButton 
                icon={User} 
                label="Clients" 
                active={activeTab === 'clients'} 
                onClick={() => onTabChange('clients')} 
              />
            )}
            <TabButton 
              icon={Package} 
              label="Products" 
              active={activeTab === 'products'} 
              onClick={() => onTabChange('products')} 
            />
            <TabButton 
              icon={ShoppingCart} 
              label="Orders" 
              active={activeTab === 'orders'} 
              onClick={() => onTabChange('orders')} 
            />
            <TabButton 
              icon={DollarSign} 
              label="Payments" 
              active={activeTab === 'payments'} 
              onClick={() => onTabChange('payments')} 
            />
           {user?.role == "admin" && (
             <TabButton 
               icon={FileText} 
               label="OCR" 
               active={activeTab === 'ocr'} 
               onClick={() => onTabChange('ocr')} 
             />
           )}
          </>
        )}
      </nav>
    </div>
  );
};

export default Sidebar;

