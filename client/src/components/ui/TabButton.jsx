const TabButton = ({ icon: Icon, label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition ${
      active ? 'bg-blue-50 text-blue-700' : 'text-gray-700 hover:bg-gray-50'
    }`}
  >
    <Icon className="w-4 h-4" />
    <span>{label}</span>
  </button>
);

export default TabButton;

