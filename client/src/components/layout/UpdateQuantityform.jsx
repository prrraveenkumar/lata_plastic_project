import React,{useEffect, useState} from 'react'
import Input from '../ui/Input';

function UpdateQuantityform({ product, setShowUpdateQuantityform, updateStock }) {
    const [quantity, setQuantity] = useState(product.stockQuantity);

    useEffect(() => {
        setQuantity(product.stockQuantity);
    }, [product]);

    const handleUpdate = () => {
        updateStock(product._id, quantity, 'set');
        setShowUpdateQuantityform(false);
    };

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 flex flex-col">
                <h3 className='text-black m-1'>Update Quantity for {product.name}</h3>
                <Input
                    type="number"
                    value={quantity}
                    onChange={(e) => setQuantity(e.target.value)}
                />
                <button onClick={handleUpdate}>Update</button>
            </div>
        </div>
    )
}

export default UpdateQuantityform