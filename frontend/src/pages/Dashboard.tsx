import React, { useState } from 'react';
import { useAppContext } from '../store';
import { formatCurrency, formatDate } from '../lib/utils';
import { Calendar, Plus, Clock, Package, CheckCircle2, XCircle } from 'lucide-react';

import { Navigate, useLocation } from 'react-router-dom';
import { useEffect } from 'react';

export function Dashboard() {
  const { currentUser, updateProfile, pets, addPet, updatePet, deletePet, services, bookAppointment, appointments, orders } = useAppContext();
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const initialTab = (searchParams.get('tab') as any) || 'profile';
  const [activeTab, setActiveTab] = useState<'profile' | 'pets' | 'book' | 'history'>(initialTab);

  useEffect(() => {
    const tab = searchParams.get('tab');
    if (tab) {
      setActiveTab(tab as any);
    }
  }, [location.search]);
  
  // Profile Form
  const [profileForm, setProfileForm] = useState({ name: currentUser?.name || '', phone: currentUser?.phone || '', address: currentUser?.address || '', password: '', confirmPassword: '' });

  // Pet Form State
  const [showPetForm, setShowPetForm] = useState(false);
  const [editingPetId, setEditingPetId] = useState<string | null>(null);
  const [petForm, setPetForm] = useState({ name: '', species: 'Chó', breed: '', age: 1, weight: 1, healthStatus: 'Bình thường', lastVaccinationDate: '', nextVaccinationDate: '' });

  // Appointment Form State
  const [appForm, setAppForm] = useState({ petId: '', serviceIds: [] as string[], date: '', time: '09:00' });

  if (!currentUser) return <Navigate to="/login" />;

  const myPets = pets.filter(p => p.userId === currentUser.id);
  const myAppointments = appointments.filter(a => a.userId === currentUser.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const myOrders = orders.filter(o => o.userId === currentUser.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  const handleUpdateProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (profileForm.password && profileForm.password !== profileForm.confirmPassword) {
      alert('Mật khẩu không khớp!');
      return;
    }
    updateProfile(currentUser.id, { name: profileForm.name, phone: profileForm.phone, address: profileForm.address, password: profileForm.password || undefined });
    alert('Cập nhật hồ sơ thành công!');
    setProfileForm({ ...profileForm, password: '', confirmPassword: '' });
  };

  const handleSavePet = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPetId) {
      updatePet(editingPetId, petForm);
    } else {
      addPet(petForm);
    }
    setShowPetForm(false);
    setEditingPetId(null);
    setPetForm({ name: '', species: 'Chó', breed: '', age: 1, weight: 1, healthStatus: 'Bình thường', lastVaccinationDate: '', nextVaccinationDate: '' });
  };

  const handleEditPet = (pet: any) => {
    setPetForm({
      name: pet.name,
      species: pet.species,
      breed: pet.breed || '',
      age: pet.age || 0,
      weight: pet.weight || 0,
      healthStatus: pet.healthStatus || 'Bình thường',
      lastVaccinationDate: pet.lastVaccinationDate || '',
      nextVaccinationDate: pet.nextVaccinationDate || ''
    });
    setEditingPetId(pet.id);
    setShowPetForm(true);
  };

  const handleDeletePet = (id: string) => {
    if (window.confirm('Bạn có chắc muốn xóa hồ sơ thú cưng này?')) {
      deletePet(id);
    }
  };

  const toggleService = (id: string) => {
    setAppForm(prev => {
      const current = prev.serviceIds;
      if (current.includes(id)) {
        return { ...prev, serviceIds: current.filter(sId => sId !== id) };
      }
      return { ...prev, serviceIds: [...current, id] };
    });
  };

  const handleBookAppointment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!appForm.petId || appForm.serviceIds.length === 0 || !appForm.date || !appForm.time) {
      alert('Vui lòng điền đầy đủ thông tin và chọn ít nhất một dịch vụ');
      return;
    }
    bookAppointment({
      userId: currentUser.id,
      petId: appForm.petId,
      serviceIds: appForm.serviceIds,
      date: appForm.date,
      time: appForm.time,
    });
    alert('Đặt lịch thành công! Vui lòng chờ xác nhận.');
    setActiveTab('history');
    setAppForm({ petId: '', serviceIds: [], date: '', time: '09:00' });
  };

  const statusColors = {
    pending: 'bg-yellow-500 text-slate-900',
    confirmed: 'bg-orange-500 text-slate-800',
    processing: 'bg-orange-500 text-slate-800',
    completed: 'bg-white text-black',
    cancelled: 'bg-red-500 text-slate-800',
  };

  const statusLabels = {
    pending: 'Chờ xác nhận',
    confirmed: 'Đã xác nhận',
    processing: 'Đang xử lý',
    completed: 'Hoàn thành',
    cancelled: 'Đã hủy',
  };

  return (
    <div className="space-y-12">
      <div>
        <h1 className="text-4xl font-bold text-slate-800 tracking-tight text-slate-800 outline-text">Trang cá nhân</h1>
        <p className="mt-2 text-orange-400 font-sans text-sm uppercase tracking-widest">Xin chào: {currentUser.name}</p>
      </div>

      <div className="flex border-b border-orange-100 overflow-x-auto">
        <button
          onClick={() => setActiveTab('profile')}
          className={`py-4 px-8 text-xs font-black uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${activeTab === 'profile' ? 'border-orange-400 text-slate-800' : 'border-transparent text-orange-400 hover:text-slate-800'}`}
        >
          Hồ sơ
        </button>
        <button
          onClick={() => setActiveTab('pets')}
          className={`py-4 px-8 text-xs font-black uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${activeTab === 'pets' ? 'border-orange-400 text-slate-800' : 'border-transparent text-orange-400 hover:text-slate-800'}`}
        >
          Thú cưng
        </button>
        <button
          onClick={() => setActiveTab('book')}
          className={`py-4 px-8 text-xs font-black uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${activeTab === 'book' ? 'border-orange-400 text-slate-800' : 'border-transparent text-orange-400 hover:text-slate-800'}`}
        >
          Đặt lịch khám
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`py-4 px-8 text-xs font-black uppercase tracking-widest border-b-2 transition-colors whitespace-nowrap ${activeTab === 'history' ? 'border-orange-400 text-slate-800' : 'border-transparent text-orange-400 hover:text-slate-800'}`}
        >
          Lịch sử
        </button>
      </div>

      <div className="mt-8">
        {activeTab === 'profile' && (
          <div className="max-w-2xl bg-white rounded-3xl shadow-sm p-8 border border-orange-100">
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight text-slate-800 mb-6">Cập nhật hồ sơ</h2>
            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Họ và tên *</label>
                <input type="text" required value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})} className="w-full bg-orange-50/50 rounded-2xl border-orange-100 text-slate-800 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 p-4 font-sans text-sm" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Số điện thoại</label>
                <input type="tel" value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})} className="w-full bg-orange-50/50 rounded-2xl border-orange-100 text-slate-800 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 p-4 font-sans text-sm" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Địa chỉ</label>
                <input type="text" value={profileForm.address} onChange={e => setProfileForm({...profileForm, address: e.target.value})} className="w-full bg-orange-50/50 rounded-2xl border-orange-100 text-slate-800 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 p-4 font-sans text-sm" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Email (Không thể thay đổi)</label>
                <input type="email" disabled value={currentUser.email} className="w-full bg-slate-100 rounded-2xl border-transparent text-slate-500 p-4 font-sans text-sm cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Mật khẩu mới (Bỏ trống nếu không đổi)</label>
                <input type="password" value={profileForm.password} onChange={e => setProfileForm({...profileForm, password: e.target.value})} className="w-full bg-orange-50/50 rounded-2xl border-orange-100 text-slate-800 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 p-4 font-sans text-sm" />
              </div>
              {profileForm.password && (
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Xác nhận mật khẩu mới *</label>
                  <input type="password" required value={profileForm.confirmPassword} onChange={e => setProfileForm({...profileForm, confirmPassword: e.target.value})} className="w-full bg-orange-50/50 rounded-2xl border-orange-100 text-slate-800 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 p-4 font-sans text-sm" />
                </div>
              )}
              <button type="submit" className="px-8 py-4 bg-orange-500 text-white font-semibold text-sm rounded-full hover:bg-orange-600 transition-colors">
                Lưu thay đổi
              </button>
            </form>
          </div>
        )}

        {activeTab === 'pets' && (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight text-slate-800">Hồ sơ thú cưng</h2>
              <button
                onClick={() => setShowPetForm(!showPetForm)}
                className="inline-flex items-center gap-3 px-6 py-3 border border-orange-200 text-slate-800 font-semibold text-sm rounded-full hover:bg-slate-800 transition-colors"
              >
                <Plus className="h-4 w-4" />
                Thêm hồ sơ
              </button>
            </div>

            {showPetForm && (
              <div className="bg-white rounded-3xl shadow-sm p-8 border border-orange-100">
                <form onSubmit={handleSavePet} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Tên thú cưng *</label>
                    <input type="text" required value={petForm.name} onChange={e => setPetForm({...petForm, name: e.target.value})} className="w-full bg-orange-50/50 rounded-2xl border-orange-100 text-slate-800 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 p-4 font-sans text-sm uppercase" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Giống loài *</label>
                    <select value={petForm.species} onChange={e => setPetForm({...petForm, species: e.target.value})} className="w-full bg-orange-50/50 rounded-2xl border-orange-100 text-slate-800 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 p-4 font-sans text-sm uppercase">
                      <option value="Chó">Chó</option>
                      <option value="Mèo">Mèo</option>
                      <option value="Khác">Khác</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Tuổi (Năm)</label>
                    <input type="number" min="0" value={petForm.age} onChange={e => setPetForm({...petForm, age: Number(e.target.value)})} className="w-full bg-orange-50/50 rounded-2xl border-orange-100 text-slate-800 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 p-4 font-sans text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Cân nặng (KG)</label>
                    <input type="number" min="0" step="0.1" value={petForm.weight} onChange={e => setPetForm({...petForm, weight: Number(e.target.value)})} className="w-full bg-orange-50/50 rounded-2xl border-orange-100 text-slate-800 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 p-4 font-sans text-sm" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-2">Ngày tiêm phòng gần nhất</label>
                    <input type="date" value={petForm.lastVaccinationDate} onChange={e => setPetForm({...petForm, lastVaccinationDate: e.target.value})} className="w-full bg-orange-50/50 rounded-2xl border-orange-100 text-slate-800 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 p-4 font-sans text-sm [color-scheme:dark]" />
                  </div>


                  <div className="md:col-span-2 flex gap-4 pt-4">
                    <button type="submit" className="px-8 py-4 bg-orange-500 text-white font-semibold text-sm rounded-full hover:bg-orange-600">{editingPetId ? 'Cập nhật' : 'Lưu hồ sơ'}</button>
                    <button type="button" onClick={() => setShowPetForm(false)} className="px-8 py-4 border border-orange-200 text-slate-800 font-semibold text-sm rounded-full hover:bg-slate-800">Hủy</button>
                  </div>
                </form>
              </div>
            )}

            {myPets.length === 0 && !showPetForm ? (
              <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-orange-100">
                <p className="text-orange-400 font-sans text-sm uppercase tracking-widest">Chưa có hồ sơ thú cưng nào.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {myPets.map(pet => (
                  <div key={pet.id} className="bg-white rounded-3xl shadow-sm p-8 border border-orange-100 flex flex-col gap-4 group hover:border-orange-300 transition-colors">
                    <div className="flex items-start gap-6">
                      <div className="h-16 w-16 bg-orange-50/50 rounded-2xl border border-orange-100 flex items-center justify-center flex-shrink-0 text-slate-800 font-black text-2xl uppercase group-hover:border-orange-400 transition-colors">
                        {pet.name.charAt(0)}
                      </div>
                      <div>
                        <h3 className="font-black text-xl text-slate-800 uppercase tracking-wider">{pet.name}</h3>
                        <p className="text-xs text-orange-400 font-sans uppercase mt-2">{pet.species} // {pet.age} TUỔI // {pet.weight}KG</p>
                        <div className="mt-4 inline-flex items-center px-3 py-1 text-[10px] font-bold uppercase tracking-widest bg-orange-50/50 rounded-2xl text-orange-500 border border-orange-400/30">
                          STATUS: {pet.healthStatus}
                        </div>
                      </div>
                    </div>
                    {(pet.lastVaccinationDate || pet.nextVaccinationDate) && (
                      <div className="mt-2 p-4 bg-orange-50/50 rounded-2xl border border-orange-100">
                        {pet.lastVaccinationDate && <div className="text-xs text-slate-600 mb-1">Tiêm gần nhất: <span className="font-bold">{formatDate(pet.lastVaccinationDate)}</span></div>}
                        {pet.nextVaccinationDate && <div className="text-xs text-orange-500">Lịch tiêm tiếp theo: <span className="font-bold">{formatDate(pet.nextVaccinationDate)}</span></div>}
                      </div>
                    )}
                    <div className="flex justify-end gap-3 mt-2">
                      <button onClick={() => handleEditPet(pet)} className="text-[10px] font-bold uppercase tracking-wider text-indigo-500 hover:text-indigo-700 transition-colors">Sửa</button>
                      <button onClick={() => handleDeletePet(pet.id)} className="text-[10px] font-bold uppercase tracking-wider text-red-500 hover:text-red-700 transition-colors">Xóa</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'book' && (
          <div className="max-w-3xl bg-white rounded-3xl shadow-sm p-10 border border-orange-100">
            <h2 className="text-3xl font-bold text-slate-800 tracking-tight text-slate-800 mb-8">Đặt lịch y tế</h2>
            {myPets.length === 0 ? (
              <div className="bg-orange-50/50 rounded-2xl border border-yellow-500/50 p-6 text-yellow-500 font-sans text-sm uppercase tracking-widest">
                Bạn cần thêm hồ sơ thú cưng trước khi đặt lịch.{' '}
                <button onClick={() => {setActiveTab('pets'); setShowPetForm(true);}} className="font-bold underline text-slate-800 ml-2 hover:text-orange-500">Thêm ngay</button>
              </div>
            ) : (
              <form onSubmit={handleBookAppointment} className="space-y-8">
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-3">Chọn thú cưng *</label>
                  <select required value={appForm.petId} onChange={e => setAppForm({...appForm, petId: e.target.value})} className="w-full bg-orange-50/50 rounded-2xl border-orange-100 text-slate-800 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 p-4 font-sans text-sm uppercase">
                    <option value="">-- CHỌN THÚ CƯNG --</option>
                    {myPets.map(pet => (
                      <option key={pet.id} value={pet.id}>{pet.name} ({pet.species})</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-3">Dịch vụ y tế (chọn nhiều) *</label>
                  <div className="grid grid-cols-1 gap-4">
                    {services.filter(s => s.isActive).map(service => (
                      <label key={service.id} className={`relative flex cursor-pointer border p-6 transition-colors ${appForm.serviceIds.includes(service.id) ? 'border-orange-400 bg-orange-50/50 rounded-2xl' : 'border-orange-100 bg-white rounded-3xl shadow-sm hover:border-orange-300'}`}>
                        <input type="checkbox" name="service" value={service.id} className="sr-only" checked={appForm.serviceIds.includes(service.id)} onChange={() => toggleService(service.id)} />
                        <span className="flex flex-1">
                          <span className="flex flex-col">
                            <span className="block text-lg font-black uppercase text-slate-800 tracking-wider">{service.name}</span>
                            <span className="mt-2 flex items-center text-sm font-sans text-orange-400">{service.description}</span>
                          </span>
                        </span>
                        <span className="ml-6 font-black text-orange-500 text-xl">{formatCurrency(service.price)}</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-3">Ngày hẹn *</label>
                    <input type="date" required value={appForm.date} onChange={e => setAppForm({...appForm, date: e.target.value})} min={new Date().toISOString().split('T')[0]} className="w-full bg-orange-50/50 rounded-2xl border-orange-100 text-slate-800 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 p-4 font-sans text-sm uppercase [color-scheme:dark]" />
                  </div>
                  <div>
                    <label className="block text-[10px] uppercase tracking-wider font-semibold text-orange-400 font-bold mb-3">Giờ hẹn *</label>
                    <select required value={appForm.time} onChange={e => setAppForm({...appForm, time: e.target.value})} className="w-full bg-orange-50/50 rounded-2xl border-orange-100 text-slate-800 focus:border-orange-400 focus:ring-1 focus:ring-orange-400 p-4 font-sans text-sm uppercase">
                      {['08:00', '09:00', '10:00', '11:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(t => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <button type="submit" className="w-full flex justify-center py-5 px-6 bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-slate-200 transition-colors mt-8">
                  Xác nhận đặt lịch
                </button>
              </form>
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <div className="space-y-12">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight text-slate-800 mb-6 flex items-center gap-3">
                <Calendar className="h-6 w-6 text-orange-500" />
                Lịch sử khám
              </h2>
              {myAppointments.length === 0 ? (
                <p className="text-orange-400 font-sans text-sm uppercase tracking-widest bg-white rounded-3xl shadow-sm p-8 border border-orange-100">Chưa có lịch sử.</p>
              ) : (
                <div className="bg-white rounded-3xl shadow-sm border border-orange-100">
                  <ul className="divide-y divide-slate-800">
                    {myAppointments.map(app => {
                      const pet = pets.find(p => p.id === app.petId);
                      const selectedServices = services.filter(s => app.serviceIds.includes(s.id));
                      return (
                        <li key={app.id} className="p-6 hover:bg-orange-50/50 rounded-2xl transition-colors">
                          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                            <div className="flex flex-col">
                              <p className="text-lg font-black uppercase tracking-wider text-slate-800">{selectedServices.map(s => s.name).join(', ')}</p>
                              <p className="mt-2 flex items-center text-sm font-sans text-orange-400">
                                <span className="text-orange-400 mr-4">[{pet?.name}]</span>
                                <Clock className="flex-shrink-0 mr-2 h-4 w-4" />
                                {formatDate(app.date)} // {app.time}
                              </p>
                            </div>
                            <div className="flex-shrink-0">
                              <p className={`px-4 py-2 inline-flex text-[10px] font-bold uppercase tracking-widest ${statusColors[app.status]}`}>
                                {statusLabels[app.status]}
                              </p>
                            </div>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              )}
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-800 tracking-tight text-slate-800 mb-6 flex items-center gap-3">
                <Package className="h-6 w-6 text-orange-500" />
                Lịch sử mua hàng
              </h2>
              {myOrders.length === 0 ? (
                <p className="text-orange-400 font-sans text-sm uppercase tracking-widest bg-white rounded-3xl shadow-sm p-8 border border-orange-100">Chưa có lịch sử.</p>
              ) : (
                <div className="space-y-6">
                  {myOrders.map(order => (
                    <div key={order.id} className="bg-white rounded-3xl shadow-sm border border-orange-100 p-6">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 pb-6 border-b border-orange-100 gap-4">
                        <div>
                          <span className="text-sm font-sans text-orange-400 uppercase tracking-widest">NGÀY: {formatDate(order.createdAt)}</span>
                          <span className={`md:ml-6 mt-2 md:mt-0 px-4 py-2 inline-block text-[10px] font-bold uppercase tracking-widest ${statusColors[order.status]}`}>
                            {statusLabels[order.status]}
                          </span>
                        </div>
                        <div className="font-black text-2xl text-slate-800">
                          {formatCurrency(order.totalAmount)}
                        </div>
                      </div>
                      <div className="space-y-3 text-sm font-sans text-slate-300">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex justify-between items-center bg-orange-50/50 rounded-2xl p-4 border border-orange-100">
                            <span className="uppercase tracking-widest">ID_{item.productId.substring(0,6)} <span className="text-orange-500 ml-2">x{item.quantity}</span></span>
                            <span className="font-bold text-slate-800">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
