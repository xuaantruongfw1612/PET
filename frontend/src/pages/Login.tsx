import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '../store';
import { PawPrint } from 'lucide-react';

export function Login() {
  const { login, register } = useAppContext();
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [role, setRole] = useState<'customer' | 'consultant' | 'sales'>('customer');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (isLogin) {
      try {
        const success = await login(email, password);
        if (success) {
          navigate('/');
        } else {
          setError('Invalid credentials');
        }
      } catch (err: any) {
        setError(err.message || 'Có lỗi xảy ra');
      }
    } else {
      const success = await register({
        name,
        email,
        phone,
        password,
        role: 'customer' // Default role for new signups
      });
      if (success) {
        navigate('/');
      } else {
        setError('Email already exists');
      }
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 bg-white rounded-3xl shadow-sm p-10 border border-orange-100 rounded-sm">
        <div className="text-center">
          <PawPrint className="mx-auto h-12 w-12 text-orange-500" />
          <h2 className="mt-6 text-3xl font-bold text-slate-800 tracking-tight text-slate-800">
            {isLogin ? 'Đăng nhập' : 'Đăng ký tài khoản'}
          </h2>
          <p className="mt-2 text-[10px] font-bold uppercase tracking-wider font-semibold text-orange-400">
            {isLogin ? 'Hoặc ' : 'Đã có tài khoản? '}
            <button
              onClick={() => {
                setIsLogin(!isLogin);
                setError('');
              }}
              className="text-orange-500 hover:text-slate-800 transition-colors"
            >
              {isLogin ? 'đăng ký mới' : 'đăng nhập tại đây'}
            </button>
          </p>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-orange-50/50 rounded-2xl border border-red-900 text-red-500 p-3 text-xs uppercase tracking-widest font-bold text-center">
              {error === 'Invalid credentials' ? 'Sai thông tin đăng nhập' : error === 'Email already exists' ? 'Email đã tồn tại' : error}
            </div>
          )}
          <div className="space-y-4">
            {!isLogin && (
              <>
                <div>
                  <label htmlFor="name" className="text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2 block">Họ và tên</label>
                  <input
                    id="name"
                    name="name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 bg-orange-50/50 rounded-2xl border border-orange-200 placeholder-slate-700 text-slate-800 focus:outline-none focus:border-orange-400 sm:text-sm transition-colors"
                    placeholder="Nhập họ và tên"
                  />
                </div>
                <div>
                  <label htmlFor="phone" className="text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2 block">Số điện thoại</label>
                  <input
                    id="phone"
                    name="phone"
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 bg-orange-50/50 rounded-2xl border border-orange-200 placeholder-slate-700 text-slate-800 focus:outline-none focus:border-orange-400 sm:text-sm transition-colors"
                    placeholder="Nhập số điện thoại"
                  />
                </div>
              </>
            )}
            <div>
              <label htmlFor="email-address" className="text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2 block">Địa chỉ Email</label>
              <input
                id="email-address"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-orange-50/50 rounded-2xl border border-orange-200 placeholder-slate-700 text-slate-800 focus:outline-none focus:border-orange-400 sm:text-sm transition-colors"
                placeholder="Nhập email"
              />
            </div>
            <div>
              <label htmlFor="password" className="text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2 block">Mật khẩu</label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="appearance-none block w-full px-4 py-3 bg-orange-50/50 rounded-2xl border border-orange-200 placeholder-slate-700 text-slate-800 focus:outline-none focus:border-orange-400 sm:text-sm transition-colors"
                placeholder="Nhập mật khẩu"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              className="w-full flex justify-center py-4 px-4 bg-orange-500 text-white font-bold text-sm rounded-full hover:bg-orange-600 transition-colors"
            >
              {isLogin ? 'Đăng nhập' : 'Đăng ký'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
