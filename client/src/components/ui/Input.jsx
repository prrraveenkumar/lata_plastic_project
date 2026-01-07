const Input = ({ label, type = 'text', value, onChange, ...props }) => (
  <div>
    {label && <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>}
    <input
      type={type}
      value={value}
      onChange={onChange}
      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black"
      {...props}
    />
  </div>
);

export default Input;

