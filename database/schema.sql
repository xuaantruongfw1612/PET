-- =========================================================
-- PETCARE - SCRIPT TAO LAI DATABASE TU DAU (dung cho moi truong dev/test)
-- Xoa sach database cu (neu co) de tranh xung dot cau truc voi Entity moi
-- =========================================================

DROP DATABASE IF EXISTS petcare_db;
CREATE DATABASE petcare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE petcare_db;

-- =========================================================
-- 1. USER (bang cha, JOINED inheritance)
-- =========================================================
CREATE TABLE users (
    user_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    username    VARCHAR(100) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL,
    email       VARCHAR(150),
    status      VARCHAR(20) DEFAULT 'ACTIVE'
);

CREATE TABLE employees (
    employee_id BIGINT PRIMARY KEY,
    permissions VARCHAR(255),
    role        VARCHAR(20) DEFAULT 'CONSULTANT',
    CONSTRAINT fk_employee_user FOREIGN KEY (employee_id) REFERENCES users(user_id)
);

CREATE TABLE customers (
    customer_id  BIGINT PRIMARY KEY,
    address      VARCHAR(255),
    phone_number VARCHAR(20),
    CONSTRAINT fk_customer_user FOREIGN KEY (customer_id) REFERENCES users(user_id)
);

-- =========================================================
-- 2. CATEGORY / PRODUCT / PRODUCT_CATEGORY
-- =========================================================
CREATE TABLE categories (
    category_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE products (
    product_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    name           VARCHAR(200) NOT NULL,
    price          DOUBLE,
    stock_quantity INT,
    description    TEXT,
    image_url      VARCHAR(255)
);

CREATE TABLE product_category (
    product_id  BIGINT NOT NULL,
    category_id BIGINT NOT NULL,
    PRIMARY KEY (product_id, category_id),
    CONSTRAINT fk_pc_product  FOREIGN KEY (product_id)  REFERENCES products(product_id)  ON DELETE CASCADE,
    CONSTRAINT fk_pc_category FOREIGN KEY (category_id) REFERENCES categories(category_id) ON DELETE CASCADE
);

-- =========================================================
-- 3. PROMOTION
-- =========================================================
CREATE TABLE promotions (
    promotion_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    code             VARCHAR(50) NOT NULL UNIQUE,
    discount_percent DOUBLE,
    start_date       DATE,
    end_date         DATE,
    is_active        BOOLEAN DEFAULT TRUE
);

-- =========================================================
-- 4. CART / CART_ITEM
-- =========================================================
CREATE TABLE carts (
    cart_id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id      BIGINT NOT NULL UNIQUE,
    promotion_id     BIGINT,
    discount_code    VARCHAR(50),
    discount_percent DECIMAL(5,2),
    status           VARCHAR(20) NOT NULL DEFAULT 'ACTIVE',
    created_at       DATETIME NOT NULL,
    updated_at       DATETIME NOT NULL,
    CONSTRAINT fk_cart_customer   FOREIGN KEY (customer_id)  REFERENCES customers(customer_id),
    CONSTRAINT fk_cart_promotion  FOREIGN KEY (promotion_id) REFERENCES promotions(promotion_id)
);

CREATE TABLE cart_items (
    cart_item_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    cart_id      BIGINT NOT NULL,
    product_id   BIGINT NOT NULL,
    quantity     INT NOT NULL,
    unit_price   DECIMAL(10,2) NOT NULL,
    UNIQUE (cart_id, product_id),
    CONSTRAINT fk_ci_cart    FOREIGN KEY (cart_id)    REFERENCES carts(cart_id)    ON DELETE CASCADE,
    CONSTRAINT fk_ci_product FOREIGN KEY (product_id) REFERENCES products(product_id)
);

-- =========================================================
-- 5. ORDER / ORDER_DETAIL / PAYMENT
-- =========================================================
CREATE TABLE orders (
    order_id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id        BIGINT,
    employee_id        BIGINT,
    order_date         DATETIME,
    total_amount       DOUBLE,
    status             VARCHAR(50) DEFAULT 'PENDING',
    cancel_reason       VARCHAR(255),
    shipping_full_name VARCHAR(100),
    shipping_phone     VARCHAR(20),
    shipping_address   VARCHAR(255),
    shipping_notes     TEXT,
    payment_method     VARCHAR(50),
    CONSTRAINT fk_order_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id),
    CONSTRAINT fk_order_employee FOREIGN KEY (employee_id) REFERENCES employees(employee_id)
);

CREATE TABLE order_details (
    order_detail_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id        BIGINT,
    product_id      BIGINT,
    quantity        INT,
    unit_price      DOUBLE,
    CONSTRAINT fk_od_order FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
);

CREATE TABLE payments (
    payment_id     BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id       BIGINT,
    method         VARCHAR(50),
    payment_status VARCHAR(50) DEFAULT 'PENDING',
    CONSTRAINT fk_payment_order FOREIGN KEY (order_id) REFERENCES orders(order_id)
);

-- =========================================================
-- 6. PET / SERVICE / APPOINTMENT / APPOINTMENT_SERVICE
-- =========================================================
CREATE TABLE pets (
    pet_id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id   BIGINT,
    name          VARCHAR(100),
    species       VARCHAR(50),
    age           INT,
    health_status TEXT,
    CONSTRAINT fk_pet_customer FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
);

CREATE TABLE services (
    service_id  BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200),
    description TEXT,
    price       DOUBLE
);

CREATE TABLE appointments (
    appointment_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pet_id         BIGINT NOT NULL,
    date           DATE NOT NULL,
    time           TIME NOT NULL,
    status         VARCHAR(50) NOT NULL DEFAULT 'PENDING',
    CONSTRAINT fk_appointment_pet FOREIGN KEY (pet_id) REFERENCES pets(pet_id)
);

CREATE TABLE appointment_services (
    appointment_service_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_id         BIGINT NOT NULL,
    service_id             BIGINT NOT NULL,
    quantity               INT NOT NULL DEFAULT 1,
    unit_price             DECIMAL(10,2) NOT NULL,
    UNIQUE (appointment_id, service_id),
    CONSTRAINT fk_as_appointment FOREIGN KEY (appointment_id) REFERENCES appointments(appointment_id) ON DELETE CASCADE,
    CONSTRAINT fk_as_service     FOREIGN KEY (service_id)     REFERENCES services(service_id)
);

-- =========================================================
-- DATA MAU DE TEST (password luu plaintext theo dung code AuthController demo)
-- =========================================================

-- Users + phan quyen
INSERT INTO users (username, password, email, status) VALUES
('admin@petcare.com', 'password', 'admin@petcare.com', 'ACTIVE'),
('tuvan@petcare.com', 'password', 'tuvan@petcare.com', 'ACTIVE'),
('khachhang@gmail.com', 'password', 'khachhang@gmail.com', 'ACTIVE');

INSERT INTO employees (employee_id, permissions, role) VALUES
(1, 'MANAGE_ALL', 'ADMIN'),
(2, 'MANAGE_APPOINTMENT', 'CONSULTANT');

INSERT INTO customers (customer_id, address, phone_number) VALUES
(3, '123 Nguyen Trai, Ha Noi', '0912345678');

-- Category
INSERT INTO categories (name) VALUES ('Thức ăn'), ('Phụ kiện'), ('Thuốc');

-- Product
INSERT INTO products (name, price, stock_quantity, description, image_url) VALUES
('Hạt Royal Canin cho chó lớn', 450000, 20, 'Thức ăn hạt dinh dưỡng 3kg', 'https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=500&q=80'),
('Pate Whiskas vị cá ngừ', 15000, 100, 'Pate cho mèo túi 80g', 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=500&q=80'),
('Vòng cổ chống rận', 85000, 50, 'Vòng cổ thảo mộc chống ve rận', 'https://images.unsplash.com/photo-1602584386319-fa8eb4361c2c?w=500&q=80');

INSERT INTO product_category (product_id, category_id) VALUES
(1, 1), -- Royal Canin -> Thức ăn
(2, 1), -- Pate Whiskas -> Thức ăn
(3, 2); -- Vòng cổ -> Phụ kiện

-- Promotion
INSERT INTO promotions (code, discount_percent, start_date, end_date, is_active) VALUES
('SALE10', 10.0, '2026-01-01', '2026-12-31', TRUE),
('WELCOME', 15.0, '2026-01-01', '2026-12-31', TRUE);

-- Service
INSERT INTO services (name, description, price) VALUES
('Tắm sấy & Vệ sinh', 'Tắm ướt, sấy khô, vệ sinh tai, cắt móng', 150000),
('Cắt tỉa lông (Grooming)', 'Cắt tạo kiểu lông chuyên nghiệp', 250000),
('Khám sức khỏe tổng quát', 'Khám lâm sàng, kiểm tra cân nặng, nhiệt độ', 200000);

-- Pet (thuoc customer_id = 3)
INSERT INTO pets (customer_id, name, species, age, health_status) VALUES
(3, 'Milo', 'Chó', 2, 'Khỏe mạnh');

-- Cart rong cho customer_id = 3 (backend cung tu tao neu chua co khi goi API)
INSERT INTO carts (customer_id, status, created_at, updated_at) VALUES
(3, 'ACTIVE', NOW(), NOW());
