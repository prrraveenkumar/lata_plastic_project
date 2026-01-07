const ActionButton = ({ icon: Icon, label, onClick }) => (
  <button
    onClick={onClick}
    className="flex items-center space-x-3 p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition"
  >
    <Icon className="w-5 h-5 text-gray-600" />
    <span className="text-sm font-medium text-gray-700">{label}</span>
  </button>
);

export default ActionButton;

