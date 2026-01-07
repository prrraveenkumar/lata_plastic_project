import { useState } from 'react';
import { Upload } from 'lucide-react';
import { CreateOrderForm } from '../ui'

const OCRModule = ({ makeRequest }) => {
  const [file, setFile] = useState(null);
  const [ocrResult, setOcrResult] = useState(null);
  const [showCreateForm, setShowCreateForm] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const processOCR = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    const result = await makeRequest('/ocr/process-slip', 'POST', formData, true);
    if (result && result.data) {
      setOcrResult(result.data);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-6">OCR - Order Slip Processing</h2>

      <div className="space-y-6">
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
          <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <input type="file" onChange={handleFileChange} accept="image/*" className="mb-4 text-black" />
        </div>

        <div className="flex  justify-between">
          <button onClick={processOCR} disabled={!file} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
            Process Order Slip
          </button>
          {ocrResult && <button onClick={() => setShowCreateForm(true)} disabled={!file} className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400">
            Create Order
          </button>
          }
        </div>

        {showCreateForm && <CreateOrderForm key={ocrResult.extracted?.clientName || "new-form"} data={ocrResult} setShowCreateForm={setShowCreateForm} />}
        {ocrResult && (
          <div className="space-y-4">
            <div className="p-4 bg-green-50 rounded-lg">
              <h3 className="font-semibold text-green-900 mb-2">Extracted Data</h3>
              <div className="text-black-sm space-y-1">
                <p className='text-black'>Client: <strong>{ocrResult.extracted?.clientName || 'Not found'}</strong></p>
                <p className='text-black'>Old Balance: <strong>₹{ocrResult.extracted?.oldBalance || 0}</strong></p>
                <p className='text-black'>Total Amount: <strong>₹{ocrResult.extracted?.totalAmount || 0}</strong></p>
              </div>
            </div>

            {ocrResult.matchedClient && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">Matched Client</h3>
                <p className="text-black">{ocrResult.matchedClient.fullname} - {ocrResult.matchedClient.mobileno}</p>
              </div>
            )}

            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-semibold text-gray-900 mb-2">Products</h3>
              <div className="space-y-2">
                {ocrResult.matchedItems?.map((product, idx) => (
                  <div key={idx} className="p-2 bg-white rounded text-sm">
                    <p className="font-medium text-black">{product.name}</p>
                    <p className="text-black">Qty: {product.quantity} | Price: ₹{product.price} | Total: ₹{product.totalPrice}</p>
                    {product.note && <p className="text-red-600 text-xs">{product.note}</p>}
                  </div>
                ))}
              </div>
            </div>

            {ocrResult.extracted && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold text-gray-900 mb-2">Raw OCR Text</h3>
                <pre className="text-xs text-gray-700 whitespace-pre-wrap">{JSON.stringify(ocrResult?.extracted, null, 2)}</pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default OCRModule;

