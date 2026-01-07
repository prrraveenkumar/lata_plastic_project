import { RefreshCw } from 'lucide-react';

const LoadingSpinner = () => {
  return (
    <div className="flex items-center justify-center py-12">
      <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
    </div>
  );
};

export default LoadingSpinner;

