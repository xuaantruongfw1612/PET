s · MD
# API Docs — PetCare System
 
Base URL local: `http://localhost:8080/api`
Base URL Codespaces: URL forwarded của port 8080 + `/api`
 
Không dùng token/JWT gì cả. Login xong lưu lại `userId` + `role` ở client, mấy API cần biết "ai đang gọi" thì tự truyền `customerId`/`employeeId` vào path hoặc body. CORS mở hết (`*`) nên gọi từ đâu cũng được.
 
Lỗi thì trả status khác 2xx kèm `{ "message": "..." }`, frontend cứ bắt lỗi và hiện message đó ra cho người dùng.
 
Swagger sống: `http://localhost:8080/swagger-ui.html` (mở khi backend đang chạy, test trực tiếp trên đó cũng được, không nhất thiết phải đọc file này).
 
---
 
## Auth — `/api/auth`
 
Đăng ký chỉ dành cho customer, employee do admin tạo tay qua API `/employees`.
 
```
POST /auth/register
body: { username, password, email, phoneNumber, address }
-> trả về Customer vừa tạo
```
 
```
POST /auth/login
body: { username, password }
-> { userId, username, role }
```
`role` là 1 trong 4 giá trị: `ADMIN`, `CONSULTANT`, `SALES`, `CUSTOMER`. Sai username/password thì 401.
 
```
POST /auth/logout          -> không cần làm gì phía server, client tự xóa session lưu ở localStorage
PUT  /auth/{userId}/profile
body: { email?, password? }
```
 
---
 
## Employees — `/api/employees`
 
Chỉ employee mới đụng vào mấy API này.
 
```
GET    /employees
POST   /employees              body: { username, password, email, permissions, role }
PUT    /employees/{id}         body: { email, permissions, status, role }
DELETE /employees/{id}
PATCH  /employees/{id}/role         body: { permissions }   -- sửa quyền hạn (chuỗi tự do)
PATCH  /employees/{id}/role-type    body: { role }          -- sửa vai trò ADMIN/CONSULTANT/SALES
```
 
Role gửi lên không hợp lệ (không nằm trong 3 giá trị trên) thì tự rơi về `CONSULTANT`, không báo lỗi.
 
---
 
## Products — `/api/products`
 
```
GET    /products
GET    /products/{id}
GET    /products/check-name?name=...           -> { exists: true|false }
POST   /products     body: { name, category, price, stockQuantity }
PUT    /products/{id}
DELETE /products/{id}                            -- 400 nếu sản phẩm đã nằm trong đơn hàng nào đó rồi
GET    /products/{id}/check-constraints          -> true|false
```
 
---
 
## Cart — `/api/cart`
 
```
GET  /cart/{customerId}                         -- chưa có thì tự tạo cart rỗng, không lỗi
GET  /cart/check-stock?productId=&qty=          -> { available: true|false }
PUT  /cart/{customerId}/items                   -- gửi lại NGUYÊN danh sách item mỗi lần, không phải chỉ item mới
     body: [{ productId, quantity }, ...]
POST /cart/{customerId}/discount
     body: { code }
```
 
Discount code tra thẳng bảng `promotions`, kiểm tra còn active + còn trong khoảng ngày hiệu lực. Không còn hardcode mã cứng như hồi trước nữa.
 
---
 
## Promotions — `/api/promotions`
 
```
GET    /promotions
POST   /promotions    body: { code, discountPercent, startDate, endDate, isActive }
PUT    /promotions/{id}
DELETE /promotions/{id}
```
 
`startDate`/`endDate` dạng `"YYYY-MM-DD"`.
 
---
 
## Orders — `/api/orders`
 
```
GET  /orders
GET  /orders/customer/{customerId}
POST /orders
     body: { customerId, shippingInfo?, paymentMethod? }
     shippingInfo: { fullName, phone, address, notes }
```
Tạo order lấy thẳng từ cart hiện tại của customer đó, trừ kho luôn. Cart trống hoặc hết hàng thì 400.
 
```
PATCH /orders/{id}/status               body: { status }   -- set tùy ý, dùng khi cần
PATCH /orders/{id}/approve?employeeId=  -- gọi lần 1 (đang PENDING) chuyển PROCESSING, gọi lần 2 chuyển COMPLETED
PATCH /orders/{id}/reject               body: { reason }    -- chuyển CANCELLED, reason lưu ở field cancelReason riêng
GET   /orders/report                    -> { totalOrders, totalRevenue, orders: [...] }
```
 
`status` chỉ chạy trong 4 giá trị: `PENDING`, `PROCESSING`, `COMPLETED`, `CANCELLED`. `/approve` phải gọi 2 lần mới ra COMPLETED — lần đầu duyệt đơn (chuyển qua xử lý), lần sau xác nhận hoàn tất.
 
---
 
## Payments — `/api/payments`
 
```
POST /payments               body: { orderId, method }   -> { payment, success: true }
POST /payments/{id}/validate -> true|false
```
 
Không gọi cổng thanh toán thật, `processPayment` luôn trả về thành công, đủ để demo luồng.
 
---
 
## Pets — `/api/pets`
 
```
GET    /pets/customer/{customerId}
GET    /pets/{id}
POST   /pets     body: { customerId, name, species, age, healthStatus }
PUT    /pets/{id}
DELETE /pets/{id}
```
 
---
 
## Services — `/api/services`
 
```
GET    /services
POST   /services    body: { name, description, price }
PUT    /services/{id}
DELETE /services/{id}
```
 
---
 
## Appointments — `/api/appointments`
 
```
GET  /appointments
GET  /appointments/customer/{customerId}
GET  /appointments/check-availability?date=&time=   -> { available: true|false }
POST /appointments
     body: { customerId, petId, date, time, serviceIds: [1,2] }
```
`date` dạng `"YYYY-MM-DD"`, `time` dạng `"HH:MM:SS"`. Trùng giờ với lịch hẹn khác thì 400.
 
```
PATCH /appointments/{id}/time         body: { date, time }
PATCH /appointments/{id}/reschedule   body: { date, time }   -- giống trên, kèm chuyển status RESCHEDULED
PATCH /appointments/{id}/approve      -- chuyển CONFIRMED
PATCH /appointments/{id}/confirm      -- chuyển COMPLETED
PATCH /appointments/{id}/status       body: { status }        -- set tùy ý, dùng để hủy (CANCELLED)
```
 
status đi qua: `PENDING` → `CONFIRMED` → `COMPLETED`, hoặc `PENDING` → `CANCELLED`. `RESCHEDULED` là trạng thái phụ khi đổi giờ hẹn.