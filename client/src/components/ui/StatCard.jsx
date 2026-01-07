const StatCard = ({ icon: Icon, label, value, color }) => {
  const colors = {
    red: 'bg-red-50 text-red-700',
    blue: 'bg-blue-50 text-blue-700',
    green: 'bg-green-50 text-green-700'
  };

  return (
    <div className={`p-4 rounded-lg ${colors[color]}`}>
      <div className="flex items-center space-x-3">
        <Icon className="w-8 h-8" />
        <div>
          <p className="text-2xl font-bold">{value}</p>
          <p className="text-sm">{label}</p>
        </div>
      </div>
    </div>
  );
};

export default StatCard;

