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

ALTER TABLE carts 
    ADD COLUMN status VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    ADD COLUMN created_at TIMESTAMP,
    ADD COLUMN updated_at TIMESTAMP;

ALTER TABLE carts MODIFY discount_percent DECIMAL(5,2);

ALTER TABLE cart_items 
    ADD COLUMN unit_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    ADD UNIQUE (cart_id, product_id);

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

-- Danh sách Sản phẩm
INSERT INTO products (name, category, price, stock_quantity, description, image_url) VALUES
-- Thức ăn (Food)
-- ('Thức ăn cho chó Royal Canin 3kg', 'Food', 250000, 50, 'Thức ăn hạt khô cung cấp đầy đủ dinh dưỡng cho các giống chó lớn.', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&q=80'),
-- ('Pate Whiskas vị cá ngừ cho mèo', 'Food', 15000, 200, 'Pate dạng gói mềm, thơm ngon kích thích vị giác của mèo cưng.', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=80'),
-- ('Xương gặm sạch răng Pedigree Dentastix', 'Food', 35000, 150, 'Xương gặm hỗ trợ làm sạch mảng bám, bảo vệ nướu và thơm miệng cho chó.', 'https://images.unsplash.com/photo-1608454367599-c1139e64e9a0?w=500&q=80'),
-- ('Hạt Me-O cho mèo trưởng thành 1.2kg', 'Food', 95000, 80, 'Hạt dinh dưỡng giàu Taurine giúp mắt mèo sáng khỏe và tăng miễn dịch.', 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=500&q=80'),
-- ('Súp thưởng Ciao Churu cho mèo', 'Food', 45000, 120, 'Súp thưởng dạng tuýp kem siêu ngon, bổ sung nước hiệu quả cho mèo.', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=80'),

-- Đồ chơi (Toy)
-- ('Đồ chơi bóng ninja cho mèo', 'Toy', 45000, 100, 'Bóng nhựa thiết kế độc đáo kèm lục lạc bên trong giúp mèo thỏa sức vờn bắt.', 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=500&q=80'),
-- ('Cần câu mèo có chuông gắn lông vũ', 'Toy', 25000, 150, 'Cần câu thép dẻo kèm lông vũ nhiều màu sắc, tương tác vui vẻ cùng mèo.', 'https://images.unsplash.com/photo-1545249390-6bdfa286032f?w=500&q=80'),
-- ('Dây thừng thắt nút đồ chơi cho chó cắn', 'Toy', 40000, 90, 'Dây thừng cotton tự nhiên siêu bền, hỗ trợ làm sạch răng khi cắn nghịch.', 'https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=500&q=80'),
-- ('Con gà la hét đồ chơi giảm stress', 'Toy', 30000, 200, 'Đồ chơi phát ra tiếng kêu vui nhộn khi bóp, thích hợp cho cả chó và mèo.', 'https://images.unsplash.com/photo-1596492784531-6e6eb5ea9993?w=500&q=80'),

-- Vệ sinh (Hygiene)
-- ('Sữa tắm Bio-Groom cho lông mềm mượt', 'Hygiene', 120000, 30, 'Sữa tắm cao cấp hương thơm dịu nhẹ, dưỡng lông mềm mượt và chống rụng.', 'https://images.unsplash.com/photo-1516738901171-8eb4fc13bd20?w=500&q=80'),
-- ('Cát vệ sinh đậu nành Tofu 6L', 'Hygiene', 110000, 60, 'Cát hữu cơ từ bã đậu nành thiên nhiên, thấm hút cực tốt và có thể xả bồn cầu.', 'https://images.unsplash.com/photo-1548247416-ec66f4900b2e?w=500&q=80'),
-- ('Xịt khử mùi và diệt khuẩn chuồng trại', 'Hygiene', 85000, 45, 'Dung dịch xịt giúp khử sạch mùi hôi hám và diệt khuẩn môi trường sống.', 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=500&q=80'),
-- ('Bọt tắm khô thảo dược cho chó mèo', 'Hygiene', 140000, 25, 'Giải pháp làm sạch nhanh không cần dùng nước cho thú cưng sợ tắm.', 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=500&q=80'),
-- ('Khay vệ sinh có thành cao cho mèo', 'Hygiene', 180000, 20, 'Khay nhựa cao cấp có thành chống văng cát ra sàn nhà.', 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=500&q=80'),

-- Phụ kiện (Accessory)
-- ('Vòng cổ có chuông đáng yêu', 'Accessory', 30000, 100, 'Vòng cổ vải mềm có thể điều chỉnh kích thước kèm chiếc chuông xinh xắn.', 'https://images.unsplash.com/photo-1602584386319-fa8eb4361c2c?w=500&q=80'),
-- ('Balo phi hành gia vận chuyển thú cưng', 'Accessory', 250000, 15, 'Balo kính trong suốt thời trang giúp dễ dàng mang thú cưng đi chơi, dạo phố.', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=500&q=80'),
-- ('Dây dắt kèm đai ngực phản quang', 'Accessory', 85000, 40, 'Thiết kế đai ngực trợ lực kèm sợi chỉ phản quang an toàn khi đi dạo buổi tối.', 'https://images.unsplash.com/photo-1544568100-847a948585b9?w=500&q=80'),
-- ('Bát ăn đôi inox chống lật', 'Accessory', 65000, 60, 'Bát inox tháo rời dễ vệ sinh kết hợp đế nhựa chống trượt đổ thức ăn.', 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?w=500&q=80'),
-- ('Nệm ngủ lót bông hình quả bí ngô', 'Accessory', 190000, 10, 'Nệm tròn siêu êm ái, giữ ấm cho bé yêu vào những ngày thời tiết lạnh.', 'https://images.unsplash.com/photo-1591946614720-90a587da4a36?w=500&q=80');

-- Dịch vụ
-- INSERT INTO services (name, description, price, duration_minutes, is_active) VALUES
-- ('Tắm & sấy lông', 'Tắm gội massage và sấy lông bồng bềnh chuyên nghiệp', 150000, 60, TRUE),
-- ('Cắt tỉa lông', 'Cắt tỉa tạo kiểu theo yêu cầu riêng của khách hàng', 100000, 90, TRUE),
-- ('Khám sức khỏe tổng quát', 'Khám bệnh định kỳ, kiểm tra thể trạng thú cưng', 200000, 30, TRUE),
-- ('Tiêm phòng vắc-xin', 'Tiêm vắc-xin 5 bệnh / 7 bệnh phòng ngừa các bệnh phổ biến', 250000, 15, TRUE),
-- ('Lấy cao răng', 'Vệ sinh răng miệng, lấy cao răng gây mê nhẹ an toàn', 300000, 45, TRUE),
-- ('Trông giữ thú cưng (Pet Hotel)', 'Dịch vụ lưu chuồng, chăm sóc dinh dưỡng và vui chơi mỗi ngày', 150000, 120, TRUE);
