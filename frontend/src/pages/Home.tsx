import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Stethoscope, Activity, FileText } from 'lucide-react';
import { useAppContext } from '../store';
import { formatCurrency } from '../lib/utils';

export function Home() {
  const { currentUser } = useAppContext();
  const { services } = useAppContext();

  return (
    <div className="space-y-24">
      {/* Hero Section */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center min-h-[50vh] relative py-12">
        <div>
          <span className="text-orange-500 font-sans text-sm tracking-widest uppercase mb-4 block">
            Hệ thống quản lý phòng khám thú y
          </span>
          <h1 className="text-[50px] md:text-[80px] leading-[1] font-black uppercase tracking-tighter mt-4">
            Chăm sóc <br />
            <span className="text-slate-800 outline-text">Sức khỏe</span> <br />
            Thú cưng
          </h1>
          <p className="max-w-md text-lg text-orange-400 leading-relaxed mt-8">
            Phòng khám thú y hiện đại với đội ngũ bác sĩ chuyên môn cao. Chúng tôi cung cấp dịch vụ y tế toàn diện, xét nghiệm và điều trị chuyên sâu.
          </p>
          <div className="flex gap-4 mt-8">
            {(!currentUser || currentUser.role === 'customer') ? (
              <Link to="/dashboard?tab=book" className="px-8 py-4 bg-white text-black font-semibold text-sm rounded-full hover:bg-slate-200 transition-colors">
                Đặt lịch khám
              </Link>
            ) : (
              <Link to="/admin" className="px-8 py-4 bg-white text-black font-semibold text-sm rounded-full hover:bg-slate-200 transition-colors">
                Quản lý lịch hẹn
              </Link>
            )}
            <Link to="/shop" className="px-8 py-4 border border-orange-200 text-slate-800 font-semibold text-sm rounded-full hover:bg-slate-800 transition-colors">
              Nhà thuốc
            </Link>
          </div>
        </div>
        <div className="hidden md:block relative">
          <div className="absolute inset-0 bg-orange-400 rounded-full translate-x-4 translate-y-4 opacity-20"></div>
          <img 
            src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?q=80&w=1000&auto=format&fit=crop" 
            alt="Thú cưng" 
            className="w-[80%] ml-auto h-[400px] object-cover rounded-[3rem] relative z-10 shadow-xl border-4 border-white"
          />
          <img 
            src="https://images.unsplash.com/photo-1583337130417-3346a1be7dee?q=80&w=1000&auto=format&fit=crop" 
            alt="Thú cưng" 
            className="w-[60%] h-[300px] object-cover rounded-[3rem] absolute bottom-[-10%] left-[-10%] z-20 shadow-xl border-4 border-white"
          />
        </div>
      </section>

      {/* Features */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-0 border-t border-l border-orange-100">
        <div className="p-10 border-r border-b border-orange-100 flex flex-col space-y-4">
          <div className="w-12 h-12 bg-white rounded-3xl shadow-sm text-orange-500 flex items-center justify-center rounded-sm">
            <Stethoscope className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest">Khám bệnh & Điều trị</h3>
          <p className="text-orange-400 text-sm leading-relaxed">Chẩn đoán chính xác, lên phác đồ điều trị chuyên biệt cho từng loại bệnh lý của thú cưng.</p>
        </div>
        <div className="p-10 border-r border-b border-orange-100 flex flex-col space-y-4">
          <div className="w-12 h-12 bg-white rounded-3xl shadow-sm text-orange-500 flex items-center justify-center rounded-sm">
            <Activity className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest">Xét nghiệm lâm sàng</h3>
          <p className="text-orange-400 text-sm leading-relaxed">Hệ thống máy xét nghiệm hiện đại cho kết quả nhanh chóng, hỗ trợ tối đa cho việc điều trị.</p>
        </div>
        <div className="p-10 border-r border-b border-orange-100 flex flex-col space-y-4">
          <div className="w-12 h-12 bg-white rounded-3xl shadow-sm text-orange-500 flex items-center justify-center rounded-sm">
            <FileText className="h-6 w-6" />
          </div>
          <h3 className="text-sm font-bold uppercase tracking-widest">Hồ sơ điện tử</h3>
          <p className="text-orange-400 text-sm leading-relaxed">Lưu trữ bệnh án, lịch sử tiêm phòng, lịch hẹn tái khám và đơn thuốc trực tuyến an toàn.</p>
        </div>
      </section>

      {/* Services Preview */}
      <section className="space-y-10">
        <h2 className="text-4xl font-bold text-slate-800 tracking-tight">Dịch vụ<br/><span className="text-orange-400">Y tế</span></h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.slice(0, 4).map(service => (
            <div key={service.id} className="bg-white rounded-3xl shadow-sm border border-orange-100 p-6 hover:border-orange-300 transition-colors flex flex-col">
              <h3 className="font-bold text-lg text-slate-800 uppercase tracking-wider mb-2">{service.name}</h3>
              <p className="text-orange-400 text-sm mb-6 line-clamp-2 flex-grow">{service.description}</p>
              <div className="flex items-center justify-between border-t border-orange-100 pt-4 mt-auto">
                <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-orange-400 font-bold">
                  <Calendar className="h-3 w-3" />
                  <span>{service.durationMinutes}p</span>
                </div>
                <div className="text-orange-500 font-black text-lg">
                  {formatCurrency(service.price)}
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
