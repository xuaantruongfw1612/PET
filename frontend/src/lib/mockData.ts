import { Service, Product, User, Pet } from '../types';

export const INITIAL_SERVICES: Service[] = [
  { id: 's1', name: 'Tắm sấy & Vệ sinh', description: 'Tắm ướt, sấy khô, vệ sinh tai, cắt móng', price: 150000, durationMinutes: 60, isActive: true },
  { id: 's2', name: 'Cắt tỉa lông (Grooming)', description: 'Cắt tạo kiểu lông chuyên nghiệp', price: 250000, durationMinutes: 90, isActive: true },
  { id: 's3', name: 'Khám sức khỏe tổng quát', description: 'Khám lâm sàng, kiểm tra cân nặng, nhiệt độ', price: 200000, durationMinutes: 30, isActive: true },
  { id: 's4', name: 'Tiêm phòng Vaccine', description: 'Tiêm các loại vaccine cơ bản cho chó/mèo', price: 350000, durationMinutes: 15, isActive: true },
];

export const INITIAL_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Hạt Royal Canin cho chó lớn', description: 'Thức ăn hạt dinh dưỡng 3kg', price: 450000, category: 'Thức ăn', stock: 20, imageUrl: 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&q=80' },
  { id: 'p2', name: 'Pate Whiskas vị cá ngừ', description: 'Pate cho mèo túi 80g', price: 15000, category: 'Thức ăn', stock: 100, imageUrl: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=80' },
  { id: 'p3', name: 'Vòng cổ chống rận', description: 'Vòng cổ thảo mộc chống ve rận', price: 85000, category: 'Phụ kiện', stock: 50, imageUrl: 'https://images.unsplash.com/photo-1602584386319-fa8eb4361c2c?w=500&q=80' },
  { id: 'p4', name: 'Sữa tắm SOS lông trắng', description: 'Sữa tắm chuyên dụng cho thú cưng lông trắng', price: 120000, category: 'Phụ kiện', stock: 30, imageUrl: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=80' },
];

export const INITIAL_USERS: User[] = [
  { id: 'admin1', name: 'Admin', email: 'admin@petcare.com', role: 'admin', password: 'password' },
  { id: 'user1', name: 'Khách Hàng 1', email: 'khachhang@gmail.com', role: 'customer', password: 'password' },
  { id: 'consultant1', name: 'NV Tư Vấn', email: 'tuvan@petcare.com', role: 'consultant', password: 'password' },
  { id: 'sales1', name: 'NV Kinh Doanh', email: 'kinhdoanh@petcare.com', role: 'sales', password: 'password' }
];

export const INITIAL_PETS: Pet[] = [
  { id: 'pet1', userId: 'user1', name: 'Milo', species: 'Chó', breed: 'Corgi', age: 2, weight: 8, healthStatus: 'Khỏe mạnh' }
];
