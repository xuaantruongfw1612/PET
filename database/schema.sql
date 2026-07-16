-- ================================================
-- PETCARE SYSTEM - Database Init Script
-- Chi can chay script nay de TAO DATABASE.
-- Cac BANG se duoc Hibernate tu tao/cap nhat khi chay Spring Boot
-- (nho spring.jpa.hibernate.ddl-auto=update trong application.properties)
-- ================================================

CREATE DATABASE IF NOT EXISTS petcare_db
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE petcare_db;

-- (Optional) Du lieu mau de test nhanh sau khi Hibernate da tao bang.
-- Chay phan INSERT nay SAU KHI da start app Spring Boot lan dau (de bang duoc tao).

-- Thêm tài khoản Admin và cấp quyền
-- INSERT INTO users (username, password, email, status) VALUES
-- ('admin1', '123456', 'admin1@petcare.com', 'ACTIVE');
-- INSERT INTO employees (user_id, permissions) VALUES (LAST_INSERT_ID(), 'MANAGE_ORDER,MANAGE_PRODUCT');

-- Thêm tài khoản Khách hàng
-- INSERT INTO users (username, password, email, status) VALUES
-- ('customer1', '123456', 'customer1@gmail.com', 'ACTIVE');
-- INSERT INTO customers (user_id, address, phone_number) VALUES (LAST_INSERT_ID(), '123 Lê Lợi, Quận 1, TP.HCM', '0909123456');

-- Danh sách Sản phẩm (Đã bổ sung thêm đa dạng)
-- INSERT INTO products (name, category, price, stock_quantity) VALUES
-- -- Thức ăn (Food)
-- ('Thức ăn cho chó Royal Canin 3kg', 'Food', 250000, 50),
-- ('Pate Whiskas vị cá ngừ cho mèo', 'Food', 15000, 200),
-- ('Xương gặm sạch răng Pedigree Dentastix', 'Food', 35000, 150),
-- ('Hạt Me-O cho mèo trưởng thành 1.2kg', 'Food', 95000, 80),
-- ('Súp thưởng Ciao Churu cho mèo', 'Food', 45000, 120),
-- 
-- -- Đồ chơi (Toy)
-- ('Đồ chơi bóng ninja cho mèo', 'Toy', 45000, 100),
-- ('Cần câu mèo có chuông gắn lông vũ', 'Toy', 25000, 150),
-- ('Dây thừng thắt nút đồ chơi cho chó cắn', 'Toy', 40000, 90),
-- ('Con gà la hét đồ chơi giảm stress', 'Toy', 30000, 200),
-- 
-- -- Vệ sinh (Hygiene)
-- ('Sữa tắm Bio-Groom cho lông mềm mượt', 'Hygiene', 120000, 30),
-- ('Cát vệ sinh đậu nành Tofu 6L', 'Hygiene', 110000, 60),
-- ('Xịt khử mùi và diệt khuẩn chuồng trại', 'Hygiene', 85000, 45),
-- ('Bọt tắm khô thảo dược cho chó mèo', 'Hygiene', 140000, 25),
-- ('Khay vệ sinh có thành cao cho mèo', 'Hygiene', 180000, 20),
-- 
-- -- Phụ kiện (Accessory)
-- ('Vòng cổ có chuông đáng yêu', 'Accessory', 30000, 100),
-- ('Balo phi hành gia vận chuyển thú cưng', 'Accessory', 250000, 15),
-- ('Dây dắt kèm đai ngực phản quang', 'Accessory', 85000, 40),
-- ('Bát ăn đôi inox chống lật', 'Accessory', 65000, 60),
-- ('Nệm ngủ lót bông hình quả bí ngô', 'Accessory', 190000, 10);

-- Danh sách Dịch vụ
-- INSERT INTO services (name, description, price) VALUES
-- ('Tắm & sấy lông', 'Tắm gội massage và sấy lông bồng bềnh chuyên nghiệp', 150000),
-- ('Cắt tỉa lông', 'Cắt tỉa tạo kiểu theo yêu cầu riêng của khách hàng', 100000),
-- ('Khám sức khỏe tổng quát', 'Khám bệnh định kỳ, kiểm tra thể trạng thú cưng', 200000),
-- ('Tiêm phòng vắc-xin', 'Tiêm vắc-xin 5 bệnh / 7 bệnh phòng ngừa các bệnh phổ biến', 250000),
-- ('Lấy cao răng', 'Vệ sinh răng miệng, lấy cao răng gây mê nhẹ', 300000),
-- ('Trông giữ thú cưng (Pet Hotel)', 'Dịch vụ lưu chuồng, chăm sóc dinh dưỡng và vui chơi mỗi ngày', 150000);