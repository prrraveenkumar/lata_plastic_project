const InfoItem = ({ label, value }) => (
  <div>
    <p className="text-sm text-gray-600">{label}</p>
    <p className="font-medium text-gray-900">{value || 'N/A'}</p>
  </div>
);

export default InfoItem;

