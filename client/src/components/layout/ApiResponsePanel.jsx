import { CheckCircle, XCircle } from 'lucide-react';

const ApiResponsePanel = ({ apiResponse }) => {
  if (!apiResponse) return null;

  return (
    <div className="mt-4 bg-white rounded-lg shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold text-gray-700">API Response</h3>
        {apiResponse.success ? (
          <CheckCircle className="w-5 h-5 text-green-600" />
        ) : (
          <XCircle className="w-5 h-5 text-red-600" />
        )}
      </div>
      <div className="text-xs space-y-2">
        <div className="flex items-center space-x-2">
          <span className="font-medium text-gray-600">Status:</span>
          <span className={`px-2 py-1 rounded ${apiResponse.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {apiResponse.status}
          </span>
        </div>
        <div>
          <span className="font-medium text-gray-600">Endpoint:</span>
          <p className="text-gray-800 break-all">{apiResponse.method} {apiResponse.endpoint}</p>
        </div>
        <div>
          <span className="font-medium text-gray-600">Response:</span>
          <pre className="mt-1 p-2 bg-gray-50 rounded text-black overflow-auto max-h-60">
            {JSON.stringify(apiResponse.data, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  );
};

export default ApiResponsePanel;

