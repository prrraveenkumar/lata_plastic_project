import { Package, LogOut } from 'lucide-react';

const Header = ({ user, onLogout }) => {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <Package className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Lata Plastics</h1>
            <p className="text-sm text-gray-500">One stop solution for all your stopper rubber needs</p>
          </div>
        </div>
        {user && (
          <div className="flex items-center space-x-4">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{user.fullname}</p>
              <p className="text-xs text-gray-500">{user.role}</p>
            </div>
            <button
              onClick={onLogout}
              className="flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;

