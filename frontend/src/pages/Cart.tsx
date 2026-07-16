import React, { useState } from 'react';
import { useAppContext } from '../store';
import { formatCurrency } from '../lib/utils';
import { Trash2, ArrowRight } from 'lucide-react';
import { useNavigate, Link, Navigate } from 'react-router-dom';

export function Cart() {
  const { cart, products, removeFromCart, checkout, currentUser } = useAppContext();
  const navigate = useNavigate();
  const [paymentMethod, setPaymentMethod] = useState('COD');
  const [isSuccess, setIsSuccess] = useState(false);
  const [discountCode, setDiscountCode] = useState('');
  const [discountError, setDiscountError] = useState('');
  const [discountAmount, setDiscountAmount] = useState(0);
  const [checkoutError, setCheckoutError] = useState('');
  const [shippingInfo, setShippingInfo] = useState({
    fullName: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: '',
    notes: ''
  });

  if (!currentUser) {
    return <Navigate to="/login" />;
  }

  if (isSuccess) {
    return (
      <div className="text-center py-32 bg-white rounded-3xl shadow-sm border border-orange-100">
        <div className="w-16 h-16 bg-orange-50/50 rounded-2xl border border-orange-400 text-orange-500 flex items-center justify-center mx-auto mb-8">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="square" strokeLinejoin="miter" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
        </div>
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight text-slate-800 mb-4">Giao dịch thành công</h2>
        <p className="text-orange-400 font-sans text-sm uppercase tracking-widest mb-8">Hệ thống đã ghi nhận đơn hàng.</p>
        <Link to="/shop" className="inline-flex items-center px-8 py-4 bg-white text-black font-semibold text-sm rounded-full hover:bg-slate-200">
          Về cửa hàng
        </Link>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="text-center py-32 border border-orange-100 bg-white rounded-3xl shadow-sm">
        <h2 className="text-3xl font-bold text-slate-800 tracking-tight text-slate-800 mb-4">Giỏ hàng trống</h2>
        <p className="text-orange-400 font-sans text-sm uppercase tracking-widest mb-8">Chưa có sản phẩm nào.</p>
        <Link to="/shop" className="px-6 py-3 border border-orange-200 text-slate-800 font-semibold text-sm rounded-full hover:bg-slate-200">
          Xem vật tư & thuốc
        </Link>
      </div>
    );
  }

  const cartItems = cart.map(item => {
    const product = products.find(p => p.id === item.productId);
    return { ...item, product };
  }).filter(item => item.product);

  const subtotal = cartItems.reduce((sum, item) => sum + (item.product!.price * item.quantity), 0);
  const total = Math.max(0, subtotal - discountAmount);

  const applyDiscount = async () => {
    setDiscountError('');
    try {
      const response = await fetch(`http://localhost:8080/api/cart/${currentUser.id}/discount`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: discountCode })
      });
      if (response.ok) {
        setDiscountAmount(subtotal * 0.1);
      } else {
        const err = await response.json();
        setDiscountError(err.message || 'Mã giảm giá không hợp lệ');
      }
    } catch(e) {
       if (['SALE10', 'PETLOVER', 'WELCOME'].includes(discountCode.toUpperCase())) {
         setDiscountAmount(subtotal * 0.1);
       } else {
         setDiscountError('Mã giảm giá không hợp lệ');
       }
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setCheckoutError('');
    if (!shippingInfo.fullName || !shippingInfo.phone || !shippingInfo.address) {
      setCheckoutError('Vui lòng điền đầy đủ Họ tên, Số điện thoại và Địa chỉ giao hàng!');
      return;
    }
    try {
      await checkout(paymentMethod, shippingInfo);
      setIsSuccess(true);
    } catch (err: any) {
      setCheckoutError(err.message || 'Có lỗi xảy ra khi đặt hàng');
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
      <div className="lg:col-span-2 space-y-6">
        <h1 className="text-3xl font-bold text-slate-800 tracking-tight text-slate-800 mb-8">Giỏ hàng của bạn</h1>
        <div className="space-y-4">
          {cartItems.map((item) => (
            <div key={item.productId} className="flex items-center gap-6 bg-white rounded-3xl shadow-sm p-6 border border-orange-100">
              <div className="h-24 w-24 bg-orange-50/50 rounded-2xl border border-orange-100 flex-shrink-0 flex items-center justify-center">
                {item.product!.imageUrl ? (
                  <img src={item.product!.imageUrl} alt={item.product!.name} className="w-full h-full object-cover opacity-80" />
                ) : (
                  <span className="text-[8px] font-bold uppercase tracking-widest text-slate-700">ẢNH</span>
                )}
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg text-slate-800 uppercase tracking-wider">{item.product!.name}</h3>
                <p className="text-orange-400 font-sans text-sm uppercase mt-1">SL: {item.quantity}</p>
                <div className="text-orange-500 font-bold mt-2">{formatCurrency(item.product!.price)}</div>
              </div>
              <div className="font-black text-xl text-slate-800">
                {formatCurrency(item.product!.price * item.quantity)}
              </div>
              <button
                onClick={() => removeFromCart(item.productId)}
                className="p-3 bg-orange-50/50 rounded-2xl border border-orange-100 text-orange-400 hover:text-slate-800 hover:border-slate-500 transition-colors ml-4"
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-sm p-8 border border-orange-100 mt-8">
          <h2 className="text-xl font-bold text-slate-800 tracking-tight text-slate-800 mb-6">Thông tin giao hàng</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Họ và tên *</label>
              <input type="text" required value={shippingInfo.fullName} onChange={e => setShippingInfo({...shippingInfo, fullName: e.target.value})} className="w-full bg-orange-50/50 rounded-2xl border-orange-100 text-slate-800 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 p-4 font-sans text-sm" placeholder="Họ và tên người nhận" />
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Số điện thoại *</label>
              <input type="tel" required value={shippingInfo.phone} onChange={e => setShippingInfo({...shippingInfo, phone: e.target.value})} className="w-full bg-orange-50/50 rounded-2xl border-orange-100 text-slate-800 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 p-4 font-sans text-sm" placeholder="Số điện thoại liên hệ" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Địa chỉ giao hàng *</label>
              <input type="text" required value={shippingInfo.address} onChange={e => setShippingInfo({...shippingInfo, address: e.target.value})} className="w-full bg-orange-50/50 rounded-2xl border-orange-100 text-slate-800 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 p-4 font-sans text-sm" placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành phố" />
            </div>
            <div className="md:col-span-2">
              <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Ghi chú thêm (Tùy chọn)</label>
              <textarea value={shippingInfo.notes} onChange={e => setShippingInfo({...shippingInfo, notes: e.target.value})} className="w-full bg-orange-50/50 rounded-2xl border-orange-100 text-slate-800 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 p-4 font-sans text-sm" placeholder="Ghi chú về thời gian giao hàng, chỉ dẫn đường đi..." rows={3}></textarea>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm p-8 border border-orange-100 h-fit sticky top-28">
        <h2 className="text-xl font-bold text-slate-800 tracking-tight text-slate-800 mb-6">Mã giảm giá</h2>
        <div className="flex gap-2 mb-8">
          <input 
            type="text" 
            value={discountCode} 
            onChange={e => setDiscountCode(e.target.value)} 
            placeholder="Nhập mã (VD: SALE10)" 
            className="flex-1 bg-orange-50/50 rounded-xl border border-orange-200 text-slate-800 focus:outline-none focus:border-orange-400 p-3 font-sans text-sm uppercase"
          />
          <button type="button" onClick={applyDiscount} className="px-6 py-3 bg-slate-800 text-white font-bold text-sm rounded-xl hover:bg-slate-700 transition-colors">
            Áp dụng
          </button>
        </div>
        {discountError && <p className="text-red-500 text-xs font-semibold mt-[-1.5rem] mb-6">{discountError}</p>}
        {discountAmount > 0 && <p className="text-green-500 text-xs font-semibold mt-[-1.5rem] mb-6">Đã áp dụng mã giảm giá!</p>}

        <h2 className="text-xl font-bold text-slate-800 tracking-tight text-slate-800 mb-8 border-t border-orange-100 pt-6">Tổng thanh toán</h2>
        <div className="space-y-4 mb-8 text-sm font-bold uppercase tracking-widest text-orange-400">
          <div className="flex justify-between">
            <span>Tạm tính</span>
            <span className="text-slate-800">{formatCurrency(subtotal)}</span>
          </div>
          {discountAmount > 0 && (
            <div className="flex justify-between text-green-500">
              <span>Giảm giá</span>
              <span>-{formatCurrency(discountAmount)}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span>Vận chuyển</span>
            <span className="text-slate-800">{formatCurrency(0)}</span>
          </div>
          <div className="border-t border-orange-100 pt-6 mt-6 flex justify-between font-black text-xl text-slate-800 tracking-normal">
            <span className="uppercase tracking-tighter">Tổng cộng</span>
            <span className="text-orange-500">{formatCurrency(total)}</span>
          </div>
        </div>

        <div className="space-y-6 mb-10">
          <h3 className="text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold">Phương thức thanh toán</h3>
          <div className="space-y-3">
            <label className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${paymentMethod === 'COD' ? 'bg-orange-50/50 rounded-2xl border-orange-400' : 'bg-orange-50/50 rounded-2xl border-orange-100 hover:border-orange-300'}`}>
              <input
                type="radio"
                name="payment"
                value="COD"
                checked={paymentMethod === 'COD'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-orange-500 focus:ring-orange-400 focus:ring-offset-slate-950 bg-white rounded-3xl shadow-sm border-orange-200"
              />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-800">Thanh toán khi nhận hàng</span>
            </label>
            <label className={`flex items-center gap-4 p-4 border cursor-pointer transition-colors ${paymentMethod === 'BANK_TRANSFER' ? 'bg-orange-50/50 rounded-2xl border-orange-400' : 'bg-orange-50/50 rounded-2xl border-orange-100 hover:border-orange-300'}`}>
              <input
                type="radio"
                name="payment"
                value="BANK_TRANSFER"
                checked={paymentMethod === 'BANK_TRANSFER'}
                onChange={(e) => setPaymentMethod(e.target.value)}
                className="text-orange-500 focus:ring-orange-400 focus:ring-offset-slate-950 bg-white rounded-3xl shadow-sm border-orange-200"
              />
              <span className="text-xs font-bold uppercase tracking-widest text-slate-800">Chuyển khoản ngân hàng</span>
            </label>
          </div>
        </div>

        {checkoutError && (
          <div className="mb-6 p-4 bg-orange-50/50 border border-red-900 rounded-2xl text-red-500 text-xs font-bold uppercase tracking-widest text-center">
            {checkoutError}
          </div>
        )}

        <button
          onClick={handleCheckout}
          className="w-full flex items-center justify-center gap-3 py-4 bg-white text-black font-semibold text-sm rounded-full hover:bg-slate-200 transition-colors"
        >
          Xác nhận đặt hàng
          <ArrowRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
