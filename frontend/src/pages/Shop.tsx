import React from 'react';
import { useAppContext } from '../store';
import { formatCurrency } from '../lib/utils';
import { ShoppingCart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function Shop() {
  const { products, addToCart, currentUser } = useAppContext();
  const navigate = useNavigate();

  const handleAddToCart = (productId: string) => {
    if (!currentUser) {
      navigate('/login');
      return;
    }
    addToCart(productId, 1);
  };

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight mb-4">Nhà thuốc & <span className="text-orange-400">Vật tư</span></h1>
        <p className="text-orange-400 font-sans text-sm uppercase tracking-widest">Danh mục // Số lượng: {products.length}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {products.map(product => (
          <div key={product.id} className="bg-white rounded-3xl shadow-sm border border-orange-100 flex flex-col group hover:border-orange-300 transition-colors">
            <div className="aspect-w-1 aspect-h-1 bg-orange-50/50 rounded-2xl h-56 relative border-b border-orange-100 p-4 flex items-center justify-center">
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="object-cover w-full h-full opacity-80 group-hover:opacity-100 transition-opacity" referrerPolicy="no-referrer" />
              ) : (
                <div className="flex items-center justify-center h-full w-full text-[10px] font-bold uppercase tracking-wider font-semibold text-slate-700">CHƯA CÓ ẢNH</div>
              )}
              {product.stock <= 5 && product.stock > 0 && (
                <span className="absolute top-4 right-4 bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                  Sắp hết
                </span>
              )}
              {product.stock === 0 && (
                <span className="absolute top-4 right-4 bg-red-500/10 text-red-500 border border-red-500/20 text-[10px] font-bold uppercase tracking-widest px-2 py-1">
                  Hết hàng
                </span>
              )}
            </div>
            <div className="p-6 flex-1 flex flex-col">
              <div className="text-[10px] uppercase tracking-wider font-semibold text-orange-500 font-bold mb-2">{product.category}</div>
              <h3 className="font-bold text-lg text-slate-800 uppercase tracking-wider mb-2 line-clamp-1">{product.name}</h3>
              <p className="text-sm text-orange-400 mb-6 line-clamp-2 flex-1">{product.description}</p>
              
              <div className="flex items-center justify-between mt-auto">
                <span className="font-black text-xl text-slate-800">{formatCurrency(product.price)}</span>
                <button
                  onClick={() => handleAddToCart(product.id)}
                  disabled={product.stock === 0}
                  className="w-12 h-12 bg-white text-black rounded-full flex items-center justify-center hover:bg-slate-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  <ShoppingCart className="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
