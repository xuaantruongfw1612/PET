import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAppContext } from '../store';
import { LogOut, User as UserIcon, ShoppingCart, PawPrint } from 'lucide-react';
import { cn } from '../lib/utils';
import { ChatWidget } from './ChatWidget';

export function Layout() {
  const { currentUser, logout, cart } = useAppContext();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { name: 'Trang chủ', path: '/' },
    { name: 'Nhà thuốc', path: '/shop' },
  ];

  if (currentUser?.role === 'customer') {
    navItems.push({ name: 'Hồ sơ', path: '/dashboard' });
  } else if (currentUser && currentUser.role !== 'customer') {
    navItems.push({ name: 'Quản trị', path: '/admin' });
  }

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen bg-orange-50/50 rounded-2xl text-slate-800 flex flex-col font-sans">
      <header className="bg-orange-50/50 rounded-2xl border-b border-orange-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-20 items-center">
            <div className="flex items-center gap-8">
              <Link to="/" className="flex-shrink-0 flex items-center gap-2">
                <PawPrint className="h-6 w-6 text-orange-500" />
                <span className="text-xl font-bold text-slate-800 tracking-tight">PetCare</span>
              </Link>
              <nav className="hidden sm:flex sm:space-x-10 text-xs font-bold uppercase tracking-widest text-orange-400">
                {navItems.map(item => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={cn(
                      "pb-1 hover:text-slate-800 transition-colors",
                      location.pathname === item.path 
                        ? "text-slate-800 border-b-2 border-white" 
                        : "border-transparent"
                    )}
                  >
                    {item.name}
                  </Link>
                ))}
              </nav>
            </div>
            <div className="flex items-center gap-6">
              <Link to="/cart" className="relative text-orange-400 hover:text-slate-800 transition-colors">
                <ShoppingCart className="h-5 w-5" />
                {cartItemsCount > 0 && (
                  <span className="absolute -top-2 -right-2 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-bold leading-none text-slate-800 bg-orange-500 rounded-full">
                    {cartItemsCount}
                  </span>
                )}
              </Link>
              
              {currentUser ? (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-orange-400 font-bold hidden sm:flex">
                    <UserIcon className="h-4 w-4" />
                    <span>{currentUser.name}</span>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="text-orange-400 hover:text-slate-800 transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              ) : (
                <Link
                  to="/login"
                  className="px-6 py-2 border border-orange-200 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-white hover:text-black transition-colors"
                >
                  Login
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <Outlet />
      </main>
      <ChatWidget />

      <footer className="mt-auto border-t border-orange-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <PawPrint className="h-5 w-5 text-orange-500" />
            <span className="text-sm font-bold text-slate-800 tracking-tight">PetCare</span>
          </div>
          <p className="text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold">© 2026 PetCare. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
