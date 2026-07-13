import React, { useState } from 'react';
import { useAppContext } from '../store';
import { formatCurrency, formatDate } from '../lib/utils';
import { Navigate } from 'react-router-dom';
import { Users, Calendar, ShoppingBag, PackageSearch, Activity, CheckCircle, XCircle, Stethoscope, Tag, MessageSquare, UserCircle } from 'lucide-react';

export function Admin() {
  const { currentUser, appointments, updateAppointmentStatus, orders, updateOrderStatus, users, products, addProduct, updateProduct, deleteProduct, services, addService, updateService, deleteService, promotions, addPromotion, updatePromotion, deletePromotion } = useAppContext();
  const [userSearch, setUserSearch] = useState('');
  const [viewingPetUserId, setViewingPetUserId] = useState<string | null>(null);
  const { pets } = useAppContext();
  const [activeTab, setActiveTab] = useState<'appointments' | 'orders' | 'products' | 'users' | 'staffs' | 'revenue' | 'services' | 'promotions' | 'chat' | 'profile'>(
    currentUser?.role === 'sales' ? 'orders' : 'appointments'
  );
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProductId, setEditingProductId] = useState<string | null>(null);
  const [productForm, setProductForm] = useState({ name: '', description: '', price: 0, category: 'Thức ăn', stock: 0, imageUrl: '' });
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState('');
  const [viewingUserOrdersId, setViewingUserOrdersId] = useState<string | null>(null);
  const [adjustingStock, setAdjustingStock] = useState<{ id: string, type: 'import' | 'export' } | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustReason, setAdjustReason] = useState<string>('');
  const { adjustStock } = useAppContext();

  // Service form state
  const [showServiceForm, setShowServiceForm] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | null>(null);
  const [serviceForm, setServiceForm] = useState({ name: '', description: '', price: 0, durationMinutes: 30, isActive: true });

  // Promotion form state
  const [showPromoForm, setShowPromoForm] = useState(false);
  const [editingPromoId, setEditingPromoId] = useState<string | null>(null);
  const [promoForm, setPromoForm] = useState({ code: '', discountPercent: 0, startDate: '', endDate: '', isActive: true });

  // User form state
  const [showUserForm, setShowUserForm] = useState(false);
  const [editingUserId, setEditingUserId] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({ name: '', email: '', role: 'customer', password: '' });

  const { addUser, updateUserRole, toggleUserLock, deleteUser, updateProfile } = useAppContext();

  if (!currentUser || currentUser.role === 'customer') {
    return <Navigate to="/login" />;
  }

  const statusLabels = {
    pending: 'Chờ xử lý',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  };

  const handleAppStatus = (id: string, status: 'confirmed' | 'cancelled' | 'completed') => {
    updateAppointmentStatus(id, status);
  };

  const handleOrderStatus = (id: string, status: 'processing' | 'completed' | 'cancelled') => {
    updateOrderStatus(id, status);
  };

  const totalRevenue = orders
    .filter(o => o.status === 'completed')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const completedApps = appointments.filter(a => a.status === 'completed').length;

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingProductId) {
      updateProduct(editingProductId, productForm);
    } else {
      addProduct(productForm);
    }
    setShowProductForm(false);
    setEditingProductId(null);
    setProductForm({ name: '', description: '', price: 0, category: 'Thức ăn', stock: 0, imageUrl: '' });
  };

  const handleEditProduct = (product: any) => {
    setProductForm({
      name: product.name,
      description: product.description,
      price: product.price,
      category: product.category,
      stock: product.stock,
      imageUrl: product.imageUrl || ''
    });
    setEditingProductId(product.id);
    setShowProductForm(true);
  };

  const handleDeleteProduct = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa vật tư này?')) {
      deleteProduct(id);
    }
  };

  const handleAdjustStockSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (adjustingStock && adjustAmount > 0) {
      adjustStock(adjustingStock.id, adjustAmount, adjustingStock.type, adjustReason);
      setAdjustingStock(null);
      setAdjustAmount(0);
      setAdjustReason('');
    }
  };

  const handleSaveService = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingServiceId) {
      updateService(editingServiceId, serviceForm);
    } else {
      addService(serviceForm);
    }
    setShowServiceForm(false);
    setEditingServiceId(null);
    setServiceForm({ name: '', description: '', price: 0, durationMinutes: 30, isActive: true });
  };

  const handleEditService = (service: any) => {
    setServiceForm({
      name: service.name,
      description: service.description,
      price: service.price,
      durationMinutes: service.durationMinutes,
      isActive: service.isActive
    });
    setEditingServiceId(service.id);
    setShowServiceForm(true);
  };

  const handleDeleteService = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa dịch vụ này?')) {
      deleteService(id);
    }
  };

  const handleSavePromo = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPromoId) {
      updatePromotion(editingPromoId, promoForm);
    } else {
      addPromotion(promoForm);
    }
    setShowPromoForm(false);
    setEditingPromoId(null);
    setPromoForm({ code: '', discountPercent: 0, startDate: '', endDate: '', isActive: true });
  };

  const handleEditPromo = (promo: any) => {
    setPromoForm({
      code: promo.code,
      discountPercent: promo.discountPercent,
      startDate: promo.startDate,
      endDate: promo.endDate,
      isActive: promo.isActive
    });
    setEditingPromoId(promo.id);
    setShowPromoForm(true);
  };

  const handleDeletePromo = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa khuyến mãi này?')) {
      deletePromotion(id);
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingUserId) {
      updateUserRole(editingUserId, userForm.role as any);
      updateProfile(editingUserId, { name: userForm.name, email: userForm.email, password: userForm.password || undefined });
    } else {
      addUser({
        name: userForm.name,
        email: userForm.email,
        password: userForm.password,
        role: userForm.role as any
      });
      alert('Tạo tài khoản thành công! Thông báo đăng nhập đã được giả lập gửi qua email.');
    }
    setShowUserForm(false);
    setEditingUserId(null);
    setUserForm({ name: '', email: '', role: 'customer', password: '' });
  };

  const handleEditUser = (u: any) => {
    setEditingUserId(u.id);
    setUserForm({ name: u.name, email: u.email, role: u.role, password: '' });
    setShowUserForm(true);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa tài khoản này?')) {
      deleteUser(id);
    }
  };

  const handleToggleLockUser = (id: string) => {
    toggleUserLock(id);
  };

  return (
    <div className="flex flex-col md:flex-row gap-12">
      {/* Sidebar */}
      <div className="w-full md:w-72 flex-shrink-0">
        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-8 sticky top-28 space-y-4">
          <h2 className="text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold mb-8">
            {currentUser.role === 'admin' ? 'Quản trị viên' : currentUser.role === 'consultant' ? 'Nhân viên tư vấn' : 'Nhân viên kinh doanh'}
          </h2>
          {(currentUser.role === 'admin' || currentUser.role === 'consultant') && (
            <button
              onClick={() => setActiveTab('appointments')}
              className={`w-full flex items-center gap-4 px-4 py-4 uppercase tracking-widest text-xs font-black transition-colors ${activeTab === 'appointments' ? 'bg-orange-50/50 rounded-2xl text-orange-500 border border-orange-400/30' : 'text-orange-400 hover:text-slate-800 border border-transparent hover:border-orange-200'}`}
            >
              <Calendar className="h-4 w-4" /> Lịch hẹn
            </button>
          )}
          {(currentUser.role === 'admin' || currentUser.role === 'sales') && (
            <button
              onClick={() => setActiveTab('orders')}
              className={`w-full flex items-center gap-4 px-4 py-4 uppercase tracking-widest text-xs font-black transition-colors ${activeTab === 'orders' ? 'bg-orange-50/50 rounded-2xl text-orange-500 border border-orange-400/30' : 'text-orange-400 hover:text-slate-800 border border-transparent hover:border-orange-200'}`}
            >
              <ShoppingBag className="h-4 w-4" /> Đơn hàng
            </button>
          )}
          {(currentUser.role === 'admin' || currentUser.role === 'sales') && (
            <button
              onClick={() => setActiveTab('products')}
              className={`w-full flex items-center gap-4 px-4 py-4 uppercase tracking-widest text-xs font-black transition-colors ${activeTab === 'products' ? 'bg-orange-50/50 rounded-2xl text-orange-500 border border-orange-400/30' : 'text-orange-400 hover:text-slate-800 border border-transparent hover:border-orange-200'}`}
            >
              <PackageSearch className="h-4 w-4" /> Kho vật tư
            </button>
          )}
          <button
            onClick={() => setActiveTab('users')}
            className={`w-full flex items-center gap-4 px-4 py-4 uppercase tracking-widest text-xs font-black transition-colors ${activeTab === 'users' ? 'bg-orange-50/50 rounded-2xl text-orange-500 border border-orange-400/30' : 'text-orange-400 hover:text-slate-800 border border-transparent hover:border-orange-200'}`}
          >
            <Users className="h-4 w-4" /> Khách hàng
          </button>
          {(currentUser.role === 'admin' || currentUser.role === 'consultant') && (
            <button
              onClick={() => setActiveTab('services')}
              className={`w-full flex items-center gap-4 px-4 py-4 uppercase tracking-widest text-xs font-black transition-colors ${activeTab === 'services' ? 'bg-orange-50/50 rounded-2xl text-orange-500 border border-orange-400/30' : 'text-orange-400 hover:text-slate-800 border border-transparent hover:border-orange-200'}`}
            >
              <Stethoscope className="h-4 w-4" /> Dịch vụ
            </button>
          )}
          {(currentUser.role === 'admin' || currentUser.role === 'sales') && (
            <button
              onClick={() => setActiveTab('promotions')}
              className={`w-full flex items-center gap-4 px-4 py-4 uppercase tracking-widest text-xs font-black transition-colors ${activeTab === 'promotions' ? 'bg-orange-50/50 rounded-2xl text-orange-500 border border-orange-400/30' : 'text-orange-400 hover:text-slate-800 border border-transparent hover:border-orange-200'}`}
            >
              <Tag className="h-4 w-4" /> Khuyến mãi
            </button>
          )}
          {currentUser.role === 'admin' && (
            <button
              onClick={() => setActiveTab('staffs')}
              className={`w-full flex items-center gap-4 px-4 py-4 uppercase tracking-widest text-xs font-black transition-colors ${activeTab === 'staffs' ? 'bg-orange-50/50 rounded-2xl text-orange-500 border border-orange-400/30' : 'text-orange-400 hover:text-slate-800 border border-transparent hover:border-orange-200'}`}
            >
              <Users className="h-4 w-4" /> Nhân sự
            </button>
          )}
          {(currentUser.role === 'admin' || currentUser.role === 'sales') && (
            <button
              onClick={() => setActiveTab('revenue')}
              className={`w-full flex items-center gap-4 px-4 py-4 uppercase tracking-widest text-xs font-black transition-colors ${activeTab === 'revenue' ? 'bg-orange-50/50 rounded-2xl text-orange-500 border border-orange-400/30' : 'text-orange-400 hover:text-slate-800 border border-transparent hover:border-orange-200'}`}
            >
              <Activity className="h-4 w-4" /> Thống kê
            </button>
          )}
          {(currentUser.role === 'admin' || currentUser.role === 'consultant') && (
            <button
              onClick={() => setActiveTab('chat')}
              className={`w-full flex items-center gap-4 px-4 py-4 uppercase tracking-widest text-xs font-black transition-colors ${activeTab === 'chat' ? 'bg-orange-50/50 rounded-2xl text-orange-500 border border-orange-400/30' : 'text-orange-400 hover:text-slate-800 border border-transparent hover:border-orange-200'}`}
            >
              <MessageSquare className="h-4 w-4" /> Chat tư vấn
            </button>
          )}
          <button
            onClick={() => setActiveTab('profile')}
            className={`w-full flex items-center gap-4 px-4 py-4 uppercase tracking-widest text-xs font-black transition-colors ${activeTab === 'profile' ? 'bg-orange-50/50 rounded-2xl text-orange-500 border border-orange-400/30' : 'text-orange-400 hover:text-slate-800 border border-transparent hover:border-orange-200'}`}
          >
            <UserCircle className="h-4 w-4" /> Hồ sơ cá nhân
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="bg-white rounded-3xl shadow-sm border border-orange-100 p-8 min-h-[600px]">
          {activeTab === 'appointments' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight text-slate-800">Quản lý lịch hẹn</h2>
              <div className="overflow-x-auto border border-orange-100 bg-orange-50/50 rounded-2xl">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-white rounded-3xl shadow-sm border-b border-orange-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Ngày hẹn</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Mã khách hàng</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Trạng thái</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {appointments.slice().reverse().map((app) => (
                      <tr key={app.id} className="hover:bg-white rounded-3xl shadow-sm transition-colors">
                        <td className="px-6 py-6 whitespace-nowrap text-sm text-slate-800 font-sans uppercase tracking-widest">
                          {formatDate(app.date)} <br/><span className="text-orange-400">{app.time}</span>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-sm text-orange-400 font-sans uppercase tracking-widest">
                          ID_{app.userId.substring(0, 8)}
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border 
                            ${app.status === 'pending' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : 
                              app.status === 'completed' ? 'border-orange-400 text-orange-500 bg-orange-500/10' : 
                              app.status === 'cancelled' ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-white text-slate-800 bg-white/10'}`}>
                            {statusLabels[app.status]}
                          </span>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-right text-xs font-black uppercase tracking-widest space-x-4">
                          {app.status === 'pending' && (
                            <>
                              <button onClick={() => handleAppStatus(app.id, 'confirmed')} className="text-orange-400 hover:text-slate-800 transition-colors">Nhận</button>
                              <button onClick={() => alert('Đã gửi thông báo đề xuất dời lịch cho khách hàng.')} className="text-indigo-400 hover:text-indigo-600 transition-colors">Dời lịch</button>
                              <button onClick={() => handleAppStatus(app.id, 'cancelled')} className="text-red-400 hover:text-slate-800 transition-colors">Từ chối</button>
                            </>
                          )}
                          {app.status === 'confirmed' && (
                            <button onClick={() => handleAppStatus(app.id, 'completed')} className="text-orange-500 hover:text-slate-800 transition-colors">Hoàn thành</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight text-slate-800">Quản lý đơn hàng</h2>
                <button onClick={() => alert('Đã xuất danh sách đơn hàng thành file Excel')} className="px-6 py-3 bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-slate-700 transition-colors">
                  Xuất Báo Cáo
                </button>
              </div>
              <div className="overflow-x-auto border border-orange-100 bg-orange-50/50 rounded-2xl">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-white rounded-3xl shadow-sm border-b border-orange-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Mã đơn</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Giao hàng</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Tổng tiền</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Trạng thái</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {orders.slice().reverse().map((order) => (
                      <tr key={order.id} className="hover:bg-white rounded-3xl shadow-sm transition-colors">
                        <td className="px-6 py-6 whitespace-nowrap text-sm font-sans text-orange-400 uppercase tracking-widest">
                          {order.id.substring(0, 8)}
                        </td>
                        <td className="px-6 py-6 text-sm font-sans text-slate-800">
                          {order.shippingInfo ? (
                            <div>
                              <div className="font-bold">{order.shippingInfo.fullName} - {order.shippingInfo.phone}</div>
                              <div className="text-xs text-slate-500 max-w-xs truncate" title={order.shippingInfo.address}>{order.shippingInfo.address}</div>
                            </div>
                          ) : (
                            <span className="text-slate-400">Không có</span>
                          )}
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-lg font-black text-slate-800">
                          {formatCurrency(order.totalAmount)}
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border 
                            ${order.status === 'pending' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : 
                              order.status === 'completed' ? 'border-orange-400 text-orange-500 bg-orange-500/10' : 
                              order.status === 'cancelled' ? 'border-red-500 text-red-500 bg-red-500/10' : 'border-white text-slate-800 bg-white/10'}`}>
                            {statusLabels[order.status]}
                          </span>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-right text-xs font-black uppercase tracking-widest space-x-4">
                          {order.status === 'pending' && (
                            <>
                              <button onClick={() => handleOrderStatus(order.id, 'processing')} className="text-orange-400 hover:text-slate-800 transition-colors">Duyệt</button>
                              <button onClick={() => handleOrderStatus(order.id, 'cancelled')} className="text-red-400 hover:text-slate-800 transition-colors">Hủy</button>
                            </>
                          )}
                          {order.status === 'processing' && (
                            <button onClick={() => handleOrderStatus(order.id, 'completed')} className="text-orange-500 hover:text-slate-800 transition-colors">Hoàn thành</button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight text-slate-800">Quản lý kho vật tư</h2>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    placeholder="Tìm tên vật tư..."
                    value={productSearch}
                    onChange={(e) => setProductSearch(e.target.value)}
                    className="px-4 py-3 bg-orange-50/50 rounded-full border border-orange-200 text-sm focus:outline-none focus:border-orange-400"
                  />
                  <select
                    value={productCategoryFilter}
                    onChange={(e) => setProductCategoryFilter(e.target.value)}
                    className="px-4 py-3 bg-orange-50/50 rounded-full border border-orange-200 text-sm focus:outline-none focus:border-orange-400"
                  >
                    <option value="">Tất cả danh mục</option>
                    <option value="Thức ăn">Thức ăn</option>
                    <option value="Phụ kiện">Phụ kiện</option>
                    <option value="Thuốc">Thuốc</option>
                    <option value="Vật tư y tế">Vật tư y tế</option>
                  </select>
                  <button
                    onClick={() => {
                      setEditingProductId(null);
                      setProductForm({ name: '', description: '', price: 0, category: 'Thức ăn', stock: 0, imageUrl: '' });
                      setShowProductForm(!showProductForm);
                    }}
                    className="px-6 py-3 bg-orange-500 text-white font-semibold text-sm rounded-full hover:bg-orange-600 transition-colors"
                  >
                    {showProductForm ? 'Đóng form' : 'Thêm vật tư'}
                  </button>
                </div>
              </div>

              {showProductForm && (
                <div className="bg-orange-50/50 rounded-2xl p-8 border border-orange-100 mb-8">
                  <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Tên vật tư *</label>
                      <input type="text" required value={productForm.name} onChange={e => setProductForm({...productForm, name: e.target.value})} className="w-full bg-white rounded-xl border border-orange-200 text-slate-800 focus:outline-none focus:border-orange-400 p-4 font-sans text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Mô tả</label>
                      <textarea value={productForm.description} onChange={e => setProductForm({...productForm, description: e.target.value})} className="w-full bg-white rounded-xl border border-orange-200 text-slate-800 focus:outline-none focus:border-orange-400 p-4 font-sans text-sm" rows={2}></textarea>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Giá (VNĐ) *</label>
                      <input type="number" required min="0" value={productForm.price} onChange={e => setProductForm({...productForm, price: Number(e.target.value)})} className="w-full bg-white rounded-xl border border-orange-200 text-slate-800 focus:outline-none focus:border-orange-400 p-4 font-sans text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Phân loại *</label>
                      <select value={productForm.category} onChange={e => setProductForm({...productForm, category: e.target.value})} className="w-full bg-white rounded-xl border border-orange-200 text-slate-800 focus:outline-none focus:border-orange-400 p-4 font-sans text-sm">
                        <option value="Thức ăn">Thức ăn</option>
                        <option value="Phụ kiện">Phụ kiện</option>
                        <option value="Thuốc">Thuốc</option>
                        <option value="Khác">Khác</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Tồn kho *</label>
                      <input type="number" required min="0" value={productForm.stock} onChange={e => setProductForm({...productForm, stock: Number(e.target.value)})} className="w-full bg-white rounded-xl border border-orange-200 text-slate-800 focus:outline-none focus:border-orange-400 p-4 font-sans text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">URL Hình ảnh</label>
                      <input type="url" value={productForm.imageUrl} onChange={e => setProductForm({...productForm, imageUrl: e.target.value})} className="w-full bg-white rounded-xl border border-orange-200 text-slate-800 focus:outline-none focus:border-orange-400 p-4 font-sans text-sm" />
                    </div>
                    <div className="md:col-span-2 flex gap-4 pt-4">
                      <button type="submit" className="px-8 py-3 bg-orange-500 text-white font-semibold text-sm rounded-full hover:bg-orange-600">
                        {editingProductId ? 'Cập nhật' : 'Thêm mới'}
                      </button>
                      <button type="button" onClick={() => setShowProductForm(false)} className="px-8 py-3 bg-white text-slate-800 border border-orange-200 font-semibold text-sm rounded-full hover:bg-orange-50">
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {products.map(p => (
                  <div key={p.id} className="border border-orange-100 bg-orange-50/50 rounded-2xl p-6 flex flex-col gap-4 hover:border-orange-300 transition-colors group">
                    <div className="flex gap-6">
                      <div className="w-20 h-20 border border-orange-100 bg-white rounded-3xl shadow-sm flex-shrink-0 flex items-center justify-center overflow-hidden">
                          {p.imageUrl ? (
                            <img src={p.imageUrl} alt={p.name} className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity" />
                          ) : (
                            <span className="text-[8px] font-bold uppercase tracking-widest text-slate-700">ẢNH</span>
                          )}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-slate-800 uppercase tracking-wider text-sm line-clamp-2">{p.name}</h4>
                        <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mt-1">{p.category}</div>
                        <div className="text-orange-500 font-bold mt-2">{formatCurrency(p.price)}</div>
                        <div className="text-[10px] uppercase tracking-widest font-bold text-orange-400 mt-2">Tồn kho: <span className={p.stock < 10 ? 'text-red-500' : 'text-slate-800'}>{p.stock}</span></div>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-orange-100/50">
                      {adjustingStock?.id === p.id ? (
                        <form onSubmit={handleAdjustStockSubmit} className="flex flex-col gap-2 w-full">
                          <div className="text-[10px] font-bold text-orange-500 uppercase tracking-wider">{adjustingStock.type === 'import' ? 'Nhập kho' : 'Xuất kho'}</div>
                          <input type="number" min="1" required value={adjustAmount || ''} onChange={e => setAdjustAmount(Number(e.target.value))} className="w-full bg-white rounded-xl border border-orange-200 p-2 text-xs" placeholder="Số lượng" />
                          {adjustingStock.type === 'export' && (
                             <input type="text" required value={adjustReason} onChange={e => setAdjustReason(e.target.value)} className="w-full bg-white rounded-xl border border-orange-200 p-2 text-xs" placeholder="Lý do xuất" />
                          )}
                          <div className="flex gap-2">
                             <button type="submit" className="flex-1 bg-orange-500 text-white rounded-xl py-2 text-[10px] font-bold uppercase tracking-wider">Lưu</button>
                             <button type="button" onClick={() => setAdjustingStock(null)} className="flex-1 bg-white text-slate-800 rounded-xl py-2 text-[10px] font-bold uppercase tracking-wider border border-orange-200">Hủy</button>
                          </div>
                        </form>
                      ) : (
                        <>
                          <button onClick={() => setAdjustingStock({ id: p.id, type: 'import' })} className="text-[10px] font-bold uppercase tracking-wider text-green-500 hover:text-green-700 transition-colors">Nhập kho</button>
                          <button onClick={() => setAdjustingStock({ id: p.id, type: 'export' })} className="text-[10px] font-bold uppercase tracking-wider text-orange-500 hover:text-orange-700 transition-colors">Xuất kho</button>
                          <button onClick={() => handleEditProduct(p)} className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 hover:text-indigo-700 transition-colors">Sửa</button>
                          <button onClick={() => handleDeleteProduct(p.id)} className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors">Xóa</button>
                        </>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'services' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight text-slate-800">Quản lý dịch vụ</h2>
                <button
                  onClick={() => {
                    setEditingServiceId(null);
                    setServiceForm({ name: '', description: '', price: 0, durationMinutes: 30, isActive: true });
                    setShowServiceForm(!showServiceForm);
                  }}
                  className="px-6 py-3 bg-orange-500 text-white font-semibold text-sm rounded-full hover:bg-orange-600 transition-colors"
                >
                  {showServiceForm ? 'Đóng form' : 'Thêm dịch vụ'}
                </button>
              </div>

              {showServiceForm && (
                <div className="bg-orange-50/50 rounded-2xl p-8 border border-orange-100 mb-8">
                  <form onSubmit={handleSaveService} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="md:col-span-2">
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Tên dịch vụ *</label>
                      <input type="text" required value={serviceForm.name} onChange={e => setServiceForm({...serviceForm, name: e.target.value})} className="w-full bg-white rounded-xl border border-orange-200 text-slate-800 focus:outline-none focus:border-orange-400 p-4 font-sans text-sm" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Mô tả *</label>
                      <textarea required value={serviceForm.description} onChange={e => setServiceForm({...serviceForm, description: e.target.value})} className="w-full bg-white rounded-xl border border-orange-200 text-slate-800 focus:outline-none focus:border-orange-400 p-4 font-sans text-sm" rows={2}></textarea>
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Giá (VNĐ) *</label>
                      <input type="number" required min="0" value={serviceForm.price} onChange={e => setServiceForm({...serviceForm, price: Number(e.target.value)})} className="w-full bg-white rounded-xl border border-orange-200 text-slate-800 focus:outline-none focus:border-orange-400 p-4 font-sans text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Thời gian (Phút) *</label>
                      <input type="number" required min="1" value={serviceForm.durationMinutes} onChange={e => setServiceForm({...serviceForm, durationMinutes: Number(e.target.value)})} className="w-full bg-white rounded-xl border border-orange-200 text-slate-800 focus:outline-none focus:border-orange-400 p-4 font-sans text-sm" />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3 mt-2">
                      <input type="checkbox" id="isActiveService" checked={serviceForm.isActive} onChange={e => setServiceForm({...serviceForm, isActive: e.target.checked})} className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500" />
                      <label htmlFor="isActiveService" className="text-sm font-semibold text-slate-800">Đang hoạt động</label>
                    </div>
                    <div className="md:col-span-2 flex gap-4 pt-4">
                      <button type="submit" className="px-8 py-3 bg-orange-500 text-white font-semibold text-sm rounded-full hover:bg-orange-600">
                        {editingServiceId ? 'Cập nhật' : 'Thêm mới'}
                      </button>
                      <button type="button" onClick={() => setShowServiceForm(false)} className="px-8 py-3 bg-white text-slate-800 border border-orange-200 font-semibold text-sm rounded-full hover:bg-orange-50">
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="overflow-x-auto border border-orange-100 bg-orange-50/50 rounded-2xl">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-white rounded-3xl shadow-sm border-b border-orange-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Tên dịch vụ</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Giá</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Thời gian</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Trạng thái</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {services.map(s => (
                      <tr key={s.id} className="hover:bg-white rounded-3xl shadow-sm transition-colors">
                        <td className="px-6 py-6 text-sm font-black text-slate-800 tracking-wider">
                          <div className="uppercase">{s.name}</div>
                          <div className="font-sans text-orange-400 font-normal mt-1">{s.description}</div>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-sm font-bold text-slate-800">{formatCurrency(s.price)}</td>
                        <td className="px-6 py-6 whitespace-nowrap text-sm font-bold text-slate-800">{s.durationMinutes} phút</td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          {s.isActive ? (
                            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-green-500/30 text-green-500 bg-green-500/10">Hoạt động</span>
                          ) : (
                            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-slate-500/30 text-slate-500 bg-slate-500/10">Tạm ngưng</span>
                          )}
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-right text-xs font-black uppercase tracking-widest space-x-4">
                          <button onClick={() => handleEditService(s)} className="text-indigo-500 hover:text-indigo-700 transition-colors">Sửa</button>
                          <button onClick={() => handleDeleteService(s.id)} className="text-red-500 hover:text-red-700 transition-colors">Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'promotions' && (
            <div className="space-y-8">
              <div className="flex justify-between items-center">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight text-slate-800">Quản lý khuyến mãi</h2>
                <button
                  onClick={() => {
                    setEditingPromoId(null);
                    setPromoForm({ code: '', discountPercent: 0, startDate: '', endDate: '', isActive: true });
                    setShowPromoForm(!showPromoForm);
                  }}
                  className="px-6 py-3 bg-orange-500 text-white font-semibold text-sm rounded-full hover:bg-orange-600 transition-colors"
                >
                  {showPromoForm ? 'Đóng form' : 'Thêm khuyến mãi'}
                </button>
              </div>

              {showPromoForm && (
                <div className="bg-orange-50/50 rounded-2xl p-8 border border-orange-100 mb-8">
                  <form onSubmit={handleSavePromo} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Mã khuyến mãi *</label>
                      <input type="text" required value={promoForm.code} onChange={e => setPromoForm({...promoForm, code: e.target.value.toUpperCase()})} className="w-full bg-white rounded-xl border border-orange-200 text-slate-800 focus:outline-none focus:border-orange-400 p-4 font-sans text-sm uppercase" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Giảm giá (%) *</label>
                      <input type="number" required min="1" max="100" value={promoForm.discountPercent} onChange={e => setPromoForm({...promoForm, discountPercent: Number(e.target.value)})} className="w-full bg-white rounded-xl border border-orange-200 text-slate-800 focus:outline-none focus:border-orange-400 p-4 font-sans text-sm" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Ngày bắt đầu *</label>
                      <input type="date" required value={promoForm.startDate} onChange={e => setPromoForm({...promoForm, startDate: e.target.value})} className="w-full bg-white rounded-xl border border-orange-200 text-slate-800 focus:outline-none focus:border-orange-400 p-4 font-sans text-sm [color-scheme:dark]" />
                    </div>
                    <div>
                      <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Ngày kết thúc *</label>
                      <input type="date" required value={promoForm.endDate} onChange={e => setPromoForm({...promoForm, endDate: e.target.value})} className="w-full bg-white rounded-xl border border-orange-200 text-slate-800 focus:outline-none focus:border-orange-400 p-4 font-sans text-sm [color-scheme:dark]" />
                    </div>
                    <div className="md:col-span-2 flex items-center gap-3 mt-2">
                      <input type="checkbox" id="isActivePromo" checked={promoForm.isActive} onChange={e => setPromoForm({...promoForm, isActive: e.target.checked})} className="w-4 h-4 text-orange-500 rounded focus:ring-orange-500" />
                      <label htmlFor="isActivePromo" className="text-sm font-semibold text-slate-800">Đang hoạt động</label>
                    </div>
                    <div className="md:col-span-2 flex gap-4 pt-4">
                      <button type="submit" className="px-8 py-3 bg-orange-500 text-white font-semibold text-sm rounded-full hover:bg-orange-600">
                        {editingPromoId ? 'Cập nhật' : 'Thêm mới'}
                      </button>
                      <button type="button" onClick={() => setShowPromoForm(false)} className="px-8 py-3 bg-white text-slate-800 border border-orange-200 font-semibold text-sm rounded-full hover:bg-orange-50">
                        Hủy
                      </button>
                    </div>
                  </form>
                </div>
              )}

              <div className="overflow-x-auto border border-orange-100 bg-orange-50/50 rounded-2xl">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-white rounded-3xl shadow-sm border-b border-orange-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Mã</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Giảm giá</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Thời gian</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Trạng thái</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {promotions.map(p => (
                      <tr key={p.id} className="hover:bg-white rounded-3xl shadow-sm transition-colors">
                        <td className="px-6 py-6 whitespace-nowrap text-lg font-black text-slate-800 uppercase tracking-wider">{p.code}</td>
                        <td className="px-6 py-6 whitespace-nowrap text-lg font-bold text-orange-500">{p.discountPercent}%</td>
                        <td className="px-6 py-6 whitespace-nowrap text-sm font-sans text-slate-800">
                          {formatDate(p.startDate)} - {formatDate(p.endDate)}
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap">
                          {p.isActive ? (
                            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-green-500/30 text-green-500 bg-green-500/10">Hoạt động</span>
                          ) : (
                            <span className="px-3 py-1 text-[10px] font-bold uppercase tracking-widest border border-slate-500/30 text-slate-500 bg-slate-500/10">Tạm ngưng</span>
                          )}
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-right text-xs font-black uppercase tracking-widest space-x-4">
                          <button onClick={() => handleEditPromo(p)} className="text-indigo-500 hover:text-indigo-700 transition-colors">Sửa</button>
                          <button onClick={() => handleDeletePromo(p.id)} className="text-red-500 hover:text-red-700 transition-colors">Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'users' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight text-slate-800">Danh sách khách hàng</h2>
                <div className="flex gap-4 items-center">
                  <input
                    type="text"
                    placeholder="Tìm theo tên/email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="px-4 py-3 bg-orange-50/50 rounded-full border border-orange-200 text-sm focus:outline-none focus:border-orange-400"
                  />
                  <button onClick={() => alert('Đã xuất danh sách thành file Excel')} className="px-6 py-3 border border-orange-200 text-slate-800 font-bold text-xs uppercase tracking-widest rounded-full hover:bg-orange-50 transition-colors">Xuất Excel</button>
                  <button
                    onClick={() => {
                      setEditingUserId(null);
                      setUserForm({ name: '', email: '', role: 'customer', password: '' });
                      setShowUserForm(true);
                    }}
                    className="px-6 py-3 bg-orange-500 text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-orange-600 transition-colors"
                  >
                    + Thêm
                  </button>
                </div>
              </div>

              {viewingPetUserId && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl shadow-xl w-full max-w-2xl p-8 border border-orange-100">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-slate-800">Hồ sơ thú cưng</h3>
                      <button onClick={() => setViewingPetUserId(null)} className="text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6" /></button>
                    </div>
                    {pets.filter(p => p.userId === viewingPetUserId).length > 0 ? (
                      <div className="space-y-4">
                        {pets.filter(p => p.userId === viewingPetUserId).map(pet => (
                          <div key={pet.id} className="bg-orange-50/50 p-6 rounded-2xl border border-orange-100 flex justify-between items-center">
                            <div>
                              <div className="font-bold text-lg text-slate-800 uppercase tracking-widest">{pet.name}</div>
                              <div className="text-sm text-slate-500 mt-1">{pet.species} - {pet.breed}</div>
                              <div className="text-xs text-orange-400 font-bold uppercase mt-2">Sức khỏe: {pet.healthStatus || 'Bình thường'}</div>
                            </div>
                            <div className="text-right">
                              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest">{pet.age} Tuổi</div>
                              <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mt-1">{pet.weight} kg</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                        <div className="text-slate-500 font-bold uppercase tracking-widest text-sm">Chưa có thú cưng nào</div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {viewingUserOrdersId && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl shadow-xl w-full max-w-4xl p-8 border border-orange-100 max-h-[80vh] flex flex-col">
                    <div className="flex justify-between items-center mb-6">
                      <h3 className="text-2xl font-bold text-slate-800">Lịch sử đơn hàng</h3>
                      <button onClick={() => setViewingUserOrdersId(null)} className="text-slate-400 hover:text-slate-600"><XCircle className="w-6 h-6" /></button>
                    </div>
                    <div className="overflow-y-auto flex-1">
                      {orders.filter(o => o.userId === viewingUserOrdersId).length > 0 ? (
                        <table className="min-w-full divide-y divide-slate-800">
                          <thead className="bg-slate-50 sticky top-0">
                            <tr>
                              <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider">Mã đơn</th>
                              <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider">Ngày đặt</th>
                              <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider">Tổng tiền</th>
                              <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider">Trạng thái</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-800">
                            {orders.filter(o => o.userId === viewingUserOrdersId).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()).map(order => (
                              <tr key={order.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-xs font-sans text-orange-400 uppercase tracking-widest">ID_{order.id.substring(0, 8)}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-xs text-slate-800">{new Date(order.createdAt).toLocaleDateString('vi-VN')}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-black text-slate-800">{formatCurrency(order.totalAmount)}</td>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <span className={`px-3 py-1 text-[10px] font-bold uppercase tracking-widest border ${order.status === 'pending' ? 'border-yellow-500 text-yellow-500 bg-yellow-500/10' : order.status === 'processing' ? 'border-blue-500 text-blue-500 bg-blue-500/10' : order.status === 'completed' ? 'border-green-500 text-green-500 bg-green-500/10' : 'border-red-500 text-red-500 bg-red-500/10'}`}>
                                    {orderStatusLabels[order.status]}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      ) : (
                        <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                          <div className="text-slate-500 font-bold uppercase tracking-widest text-sm">Chưa có đơn hàng nào</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {showUserForm && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 border border-orange-100">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6">{editingUserId ? 'Chỉnh sửa tài khoản' : 'Thêm tài khoản mới'}</h3>
                    <form onSubmit={handleSaveUser} className="space-y-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2 block">Tên</label>
                        <input type="text" required value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="w-full px-4 py-3 bg-orange-50/50 rounded-2xl border border-orange-200 text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2 block">Email</label>
                        <input type="email" required value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-4 py-3 bg-orange-50/50 rounded-2xl border border-orange-200 text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2 block">Mật khẩu {editingUserId && '(Để trống nếu không đổi)'}</label>
                        <input type="password" required={!editingUserId} value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-4 py-3 bg-orange-50/50 rounded-2xl border border-orange-200 text-sm" />
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setShowUserForm(false)} className="flex-1 px-6 py-3 border border-orange-200 text-slate-800 font-bold text-xs uppercase tracking-widest rounded-full hover:bg-slate-50 transition-colors">Hủy</button>
                        <button type="submit" className="flex-1 px-6 py-3 bg-orange-500 text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-orange-600 transition-colors">Lưu</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto border border-orange-100 bg-orange-50/50 rounded-2xl">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-white rounded-3xl shadow-sm border-b border-orange-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Tên</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Email</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Quyền hạn</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.filter(u => u.role === 'customer' && (u.name.toLowerCase().includes(userSearch.toLowerCase()) || u.email.toLowerCase().includes(userSearch.toLowerCase()))).map(u => (
                      <tr key={u.id} className={`hover:bg-white rounded-3xl shadow-sm transition-colors ${u.isLocked ? 'opacity-60' : ''}`}>
                        <td className="px-6 py-6 whitespace-nowrap text-sm font-black text-slate-800 uppercase tracking-widest">{u.name}</td>
                        <td className="px-6 py-6 whitespace-nowrap text-sm font-sans text-orange-400 uppercase">{u.email}</td>
                        <td className="px-6 py-6 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider font-semibold">
                          {u.isLocked ? (
                            <span className="text-red-500 border border-red-400/30 px-3 py-1 bg-red-500/10">ĐÃ KHÓA</span>
                          ) : (
                            <span className="text-green-500 border border-green-400/30 px-3 py-1 bg-green-500/10">HOẠT ĐỘNG</span>
                          )}
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider font-semibold">
                          <span className="text-slate-500 border border-slate-400/30 px-3 py-1 bg-slate-500/10">KHÁCH</span>
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-right text-xs font-black uppercase tracking-widest space-x-4">
                          <button onClick={() => setViewingUserOrdersId(u.id)} className="text-teal-500 hover:text-teal-700 transition-colors">Đơn hàng</button>
                          <button onClick={() => setViewingPetUserId(u.id)} className="text-blue-500 hover:text-blue-700 transition-colors">Thú cưng</button>
                          <button onClick={() => handleEditUser(u)} className="text-indigo-500 hover:text-indigo-700 transition-colors">Sửa</button>
                          <button onClick={() => handleToggleLockUser(u.id)} className={`${u.isLocked ? 'text-green-500 hover:text-green-700' : 'text-orange-500 hover:text-orange-700'} transition-colors`}>{u.isLocked ? 'Mở Khóa' : 'Khóa'}</button>
                          <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:text-red-700 transition-colors">Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === 'staffs' && currentUser.role === 'admin' && (
            <div className="space-y-8">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight text-slate-800">Danh sách nhân sự</h2>
                <button
                  onClick={() => {
                    setEditingUserId(null);
                    setUserForm({ name: '', email: '', role: 'consultant', password: '' });
                    setShowUserForm(true);
                  }}
                  className="px-6 py-3 bg-orange-500 text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-orange-600 transition-colors"
                >
                  + Thêm Nhân Sự
                </button>
              </div>

              {showUserForm && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                  <div className="bg-white rounded-3xl shadow-xl w-full max-w-md p-8 border border-orange-100">
                    <h3 className="text-2xl font-bold text-slate-800 mb-6">{editingUserId ? 'Chỉnh sửa nhân sự' : 'Thêm nhân sự mới'}</h3>
                    <form onSubmit={handleSaveUser} className="space-y-4">
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2 block">Tên</label>
                        <input type="text" required value={userForm.name} onChange={e => setUserForm({...userForm, name: e.target.value})} className="w-full px-4 py-3 bg-orange-50/50 rounded-2xl border border-orange-200 text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2 block">Email</label>
                        <input type="email" required value={userForm.email} onChange={e => setUserForm({...userForm, email: e.target.value})} className="w-full px-4 py-3 bg-orange-50/50 rounded-2xl border border-orange-200 text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2 block">Mật khẩu {editingUserId && '(Để trống nếu không đổi)'}</label>
                        <input type="password" required={!editingUserId} value={userForm.password} onChange={e => setUserForm({...userForm, password: e.target.value})} className="w-full px-4 py-3 bg-orange-50/50 rounded-2xl border border-orange-200 text-sm" />
                      </div>
                      <div>
                        <label className="text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2 block">Quyền hạn</label>
                        <select value={userForm.role} onChange={e => setUserForm({...userForm, role: e.target.value})} className="w-full px-4 py-3 bg-orange-50/50 rounded-2xl border border-orange-200 text-sm appearance-none cursor-pointer">
                          <option value="consultant">Nhân viên tư vấn</option>
                          <option value="sales">Nhân viên kinh doanh</option>
                          <option value="admin">Quản trị viên</option>
                        </select>
                      </div>
                      <div className="flex gap-4 pt-4">
                        <button type="button" onClick={() => setShowUserForm(false)} className="flex-1 px-6 py-3 border border-orange-200 text-slate-800 font-bold text-xs uppercase tracking-widest rounded-full hover:bg-slate-50 transition-colors">Hủy</button>
                        <button type="submit" className="flex-1 px-6 py-3 bg-orange-500 text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-orange-600 transition-colors">Lưu</button>
                      </div>
                    </form>
                  </div>
                </div>
              )}

              <div className="overflow-x-auto border border-orange-100 bg-orange-50/50 rounded-2xl">
                <table className="min-w-full divide-y divide-slate-800">
                  <thead className="bg-white rounded-3xl shadow-sm border-b border-orange-100">
                    <tr>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Tên</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Email</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Trạng thái</th>
                      <th className="px-6 py-4 text-left text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Quyền hạn</th>
                      <th className="px-6 py-4 text-right text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold">Thao tác</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800">
                    {users.filter(u => u.role !== 'customer').map(u => (
                      <tr key={u.id} className={`hover:bg-white rounded-3xl shadow-sm transition-colors ${u.isLocked ? 'opacity-60' : ''}`}>
                        <td className="px-6 py-6 whitespace-nowrap text-sm font-black text-slate-800 uppercase tracking-widest">{u.name}</td>
                        <td className="px-6 py-6 whitespace-nowrap text-sm font-sans text-orange-400 uppercase">{u.email}</td>
                        <td className="px-6 py-6 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider font-semibold">
                          {u.isLocked ? (
                            <span className="text-red-500 border border-red-400/30 px-3 py-1 bg-red-500/10">ĐÃ KHÓA</span>
                          ) : (
                            <span className="text-green-500 border border-green-400/30 px-3 py-1 bg-green-500/10">HOẠT ĐỘNG</span>
                          )}
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-[10px] font-bold uppercase tracking-wider font-semibold">
                          {u.role === 'admin' ? (
                            <span className="text-orange-500 border border-orange-400/30 px-3 py-1 bg-orange-500/10">QUẢN TRỊ</span>
                          ) : (
                            <span className="text-blue-500 border border-blue-400/30 px-3 py-1 bg-blue-500/10">NHÂN VIÊN</span>
                          )}
                        </td>
                        <td className="px-6 py-6 whitespace-nowrap text-right text-xs font-black uppercase tracking-widest space-x-4">
                          <button onClick={() => handleEditUser(u)} className="text-indigo-500 hover:text-indigo-700 transition-colors">Sửa</button>
                          <button onClick={() => handleToggleLockUser(u.id)} className={`${u.isLocked ? 'text-green-500 hover:text-green-700' : 'text-orange-500 hover:text-orange-700'} transition-colors`}>{u.isLocked ? 'Mở Khóa' : 'Khóa'}</button>
                          <button onClick={() => handleDeleteUser(u.id)} className="text-red-500 hover:text-red-700 transition-colors">Xóa</button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          {activeTab === 'revenue' && (
            <div className="space-y-8">
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight text-slate-800">Báo cáo thống kê</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="bg-orange-50/50 rounded-2xl p-8 border border-orange-100 flex items-start gap-6">
                  <div className="p-4 border border-orange-400 text-orange-500 bg-white rounded-3xl shadow-sm"><Activity className="w-8 h-8" /></div>
                  <div>
                    <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold mb-2">Doanh thu</div>
                    <div className="text-4xl font-black text-slate-800 tracking-tighter">{formatCurrency(totalRevenue)}</div>
                  </div>
                </div>
                <div className="bg-orange-50/50 rounded-2xl p-8 border border-orange-100 flex items-start gap-6">
                  <div className="p-4 border border-white text-slate-800 bg-white rounded-3xl shadow-sm"><CheckCircle className="w-8 h-8" /></div>
                  <div>
                    <div className="text-[10px] font-bold text-orange-400 uppercase tracking-wider font-semibold mb-2">Lịch hẹn đã khám</div>
                    <div className="text-4xl font-black text-slate-800 tracking-tighter">{completedApps} <span className="text-lg text-orange-400">LẦN</span></div>
                  </div>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'profile' && (
            <div className="space-y-8 max-w-2xl">
              <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Hồ sơ cá nhân</h2>
              <div className="bg-orange-50/50 rounded-3xl p-8 border border-orange-100">
                <div className="space-y-6">
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-orange-400 mb-2 block">Họ và tên</label>
                    <input type="text" value={currentUser.name} disabled className="w-full px-4 py-3 bg-white rounded-2xl border border-orange-200 text-sm font-black text-slate-800" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-orange-400 mb-2 block">Email / Đăng nhập</label>
                    <input type="email" value={currentUser.email} disabled className="w-full px-4 py-3 bg-white rounded-2xl border border-orange-200 text-sm font-black text-slate-800" />
                  </div>
                  <div>
                    <label className="text-[10px] uppercase tracking-wider font-bold text-orange-400 mb-2 block">Vai trò</label>
                    <input type="text" value={currentUser.role === 'admin' ? 'Quản trị viên' : currentUser.role === 'consultant' ? 'Nhân viên tư vấn' : currentUser.role === 'sales' ? 'Nhân viên kinh doanh' : 'Khách hàng'} disabled className="w-full px-4 py-3 bg-white rounded-2xl border border-orange-200 text-sm font-black text-slate-800" />
                  </div>
                  <div className="pt-6 border-t border-orange-100">
                    <button className="px-6 py-3 bg-slate-800 text-white font-bold text-xs uppercase tracking-widest rounded-full hover:bg-slate-700 transition-colors">
                      Đổi mật khẩu
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'chat' && (
            <div className="h-full flex flex-col space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Chat tư vấn</h2>
                <div className="flex gap-4">
                  <span className="px-4 py-2 bg-green-50 text-green-600 border border-green-200 rounded-full text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500"></div> Đang trực
                  </span>
                </div>
              </div>
              <div className="flex-1 min-h-[500px] border border-orange-100 rounded-3xl overflow-hidden flex bg-white">
                {/* Chat List */}
                <div className="w-1/3 border-r border-orange-100 flex flex-col bg-orange-50/30">
                  <div className="p-4 border-b border-orange-100">
                    <input type="text" placeholder="Tìm kiếm khách hàng..." className="w-full px-4 py-3 bg-white rounded-2xl border border-orange-200 text-sm placeholder-orange-300 focus:outline-none focus:border-orange-400" />
                  </div>
                  <div className="flex-1 overflow-y-auto">
                    <div className="p-4 border-b border-orange-100 bg-orange-50/80 cursor-pointer">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm text-slate-800 uppercase tracking-widest">Khách Hàng 1</span>
                        <span className="text-[10px] font-bold text-orange-400">10:45 AM</span>
                      </div>
                      <div className="text-xs text-slate-500 truncate">Cho mình hỏi về dịch vụ tắm sấy chó Corgi...</div>
                    </div>
                    <div className="p-4 border-b border-orange-100 hover:bg-orange-50/50 cursor-pointer opacity-70">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-bold text-sm text-slate-800 uppercase tracking-widest">Nguyễn Văn A</span>
                        <span className="text-[10px] font-bold text-orange-400">Hôm qua</span>
                      </div>
                      <div className="text-xs text-slate-500 truncate">Cảm ơn shop.</div>
                    </div>
                  </div>
                </div>
                {/* Chat Area */}
                <div className="w-2/3 flex flex-col">
                  <div className="p-4 border-b border-orange-100 flex justify-between items-center bg-white">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-500 font-bold">KH</div>
                      <div>
                        <div className="font-bold text-sm text-slate-800 uppercase tracking-widest">Khách Hàng 1</div>
                        <div className="text-[10px] text-green-500 font-bold uppercase tracking-widest">Đang online</div>
                      </div>
                    </div>
                    <button className="px-4 py-2 border border-orange-200 text-orange-500 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-orange-50 transition-colors">
                      Tạo phiếu tư vấn
                    </button>
                  </div>
                  <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                    <div className="flex justify-start">
                      <div className="bg-white border border-orange-100 text-slate-800 p-4 rounded-2xl rounded-tl-none max-w-[80%] shadow-sm">
                        <p className="text-sm">Chào shop, bé Corgi nhà mình 8kg thì tắm sấy giá bao nhiêu ạ?</p>
                        <span className="text-[10px] text-orange-400 font-bold mt-2 block">10:45 AM</span>
                      </div>
                    </div>
                    <div className="flex justify-end">
                      <div className="bg-orange-500 text-white p-4 rounded-2xl rounded-tr-none max-w-[80%] shadow-sm">
                        <p className="text-sm">Chào bạn, với bé Corgi 8kg thì gói tắm sấy vệ sinh bên mình là 150.000đ nhé. Bao gồm tắm ướt, sấy khô, vệ sinh tai và cắt móng ạ.</p>
                        <span className="text-[10px] text-orange-200 font-bold mt-2 block text-right">10:48 AM</span>
                      </div>
                    </div>
                  </div>
                  <div className="p-4 border-t border-orange-100 bg-white">
                    <div className="flex gap-2 mb-2">
                      <span className="px-3 py-1 bg-orange-50 border border-orange-100 text-[10px] text-orange-500 rounded-full cursor-pointer hover:bg-orange-100 font-bold">Báo giá tắm sấy</span>
                      <span className="px-3 py-1 bg-orange-50 border border-orange-100 text-[10px] text-orange-500 rounded-full cursor-pointer hover:bg-orange-100 font-bold">Báo giá grooming</span>
                      <span className="px-3 py-1 bg-orange-50 border border-orange-100 text-[10px] text-orange-500 rounded-full cursor-pointer hover:bg-orange-100 font-bold">Giờ mở cửa</span>
                    </div>
                    <div className="flex gap-4">
                      <input type="text" placeholder="Nhập tin nhắn..." className="flex-1 px-4 py-3 bg-orange-50/50 rounded-2xl border border-orange-200 text-sm focus:outline-none focus:border-orange-400" />
                      <button className="px-6 py-3 bg-orange-500 text-white rounded-full font-bold text-xs uppercase tracking-widest hover:bg-orange-600 transition-colors">
                        Gửi
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
