# PetCare System
 
Đồ án môn Phân tích & Thiết kế Phần mềm — hệ thống bán đồ + đặt lịch chăm sóc thú cưng.
 
Backend viết bằng Java Spring Boot, frontend Vite + React + TypeScript. Hai phần code độc lập nhau hoàn toàn, chỉ nói chuyện qua REST API — ai đụng vào phần nào thì không cần quan tâm phần kia code ra sao, cứ theo đúng API_DOCS.md là chạy được.
 
## Cấu trúc
 
```
petcare-system/
├── backend/                 # Spring Boot, Maven
├── frontend/                # Vite + React + TS
├── database/schema.sql      # tạo database, bảng do Hibernate tự sinh
├── API_DOCS.md              # danh sách API, xem file này là đủ để code frontend
├── PetCare_API.postman_collection.json
└── .devcontainer/           # cấu hình GitHub Codespaces (tự dựng MySQL, Java, Node)
```
 
## Cần cài gì trước
 
- **Java 17** — bắt buộc đúng bản 17, không hơn không kém. Project dùng Lombok để tự sinh getter/setter, mà Lombok bản đang dùng chưa support được các bản JDK quá mới (JDK 21+, đặc biệt JDK 26 build mới nhất là chắc chắn lỗi). Chạy `java -version` kiểm tra trước, thấy khác 17 thì đổi bằng `update-alternatives --config java` (Linux) trước khi làm gì tiếp.
- **Maven** (`mvn -version`)
- **MySQL 8**
- **Node.js 18+** và npm, cho phần frontend
## Chạy database
 
```sql
CREATE DATABASE petcare_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
```
 
Không cần tạo bảng tay, Hibernate tự tạo lúc backend chạy lần đầu (nhờ `spring.jpa.hibernate.ddl-auto=update`).
 
## Chạy backend
 
Mật khẩu MySQL **không đặt trực tiếp trong file properties** (tránh lộ khi push git) — file đã đọc từ biến môi trường, chỉ cần set biến này trước khi chạy:
 
```bash
export SPRING_DATASOURCE_PASSWORD=mat_khau_mysql_cua_ban
cd backend
mvn spring-boot:run
```
 
Hoặc nếu chạy qua IDE (IntelliJ/VSCode), set biến `SPRING_DATASOURCE_PASSWORD` trong phần Environment Variables của Run Configuration, không sửa file `application.properties`.
 
Chạy xong, mở `http://localhost:8080/swagger-ui.html` — thấy danh sách API là backend ok.
 
## Chạy frontend
 
```bash
cd frontend
npm install
npm run dev
```
 
Mặc định Vite chạy ở `http://localhost:5173`. File `src/lib/api.ts` đã trỏ sẵn `http://localhost:8080/api`, chạy local thì không cần sửa gì.
 
Trong `src/store/index.tsx` có cờ:
 
```ts
const USE_API = false;
```
 
Đổi thành `true` mới thật sự gọi backend, để `false` thì toàn bộ app chạy bằng mock data + localStorage.
 
## Chạy trong GitHub Codespaces
 
Repo có sẵn `.devcontainer/`, mở Codespace là có luôn Java 17 + Maven + Node 20 + MySQL 8, không cần cài gì thêm. Mở 2 terminal, 1 cái chạy `mvn spring-boot:run` trong `backend/`, 1 cái chạy `npm run dev` trong `frontend/`. Nhớ vào tab PORTS đổi port 8080 và 5173 thành Public, rồi copy URL forwarded của port 8080 dán vào `BASE_URL` trong `api.ts` (vì trong Codespaces, browser không thấy được `localhost:8080` của container, phải dùng URL forwarded).
 
## Tài khoản test
 
Không có form đăng ký cho Employee (đúng nghiệp vụ — admin tạo tài khoản nhân viên, không ai tự đăng ký làm nhân viên được). Muốn có tài khoản employee để test, gọi thẳng API bằng Postman:
 
```
POST /api/employees
{ "username": "admin1", "password": "123456", "email": "admin@petcare.com", "role": "ADMIN" }
```
 
Customer thì đăng ký bình thường qua UI.
 
## API
 
Đầy đủ endpoint, body mẫu, response mẫu nằm hết trong [`API_DOCS.md`](./API_DOCS.md). Import [`PetCare_API.postman_collection.json`](./PetCare_API.postman_collection.json) vào Postman để test nhanh, hoặc mở `/swagger-ui.html` khi backend đang chạy.
 
Đổi API nào (thêm field, đổi path...) thì nhớ sửa lại `API_DOCS.md` luôn, không thì bên kia code sẽ bị lệch mà không biết.
 
## Vài chỗ làm đơn giản, biết trước cho khỏi bất ngờ
 
- Đăng nhập không dùng JWT, chỉ so username/password rồi lưu userId + role ở phía client. Đủ để chạy demo, không phải thứ đem lên production.
- Thanh toán (`PaymentGateway`) luôn trả về thành công, không gọi cổng thanh toán thật nào cả.
- Report đơn hàng trả JSON tổng hợp số liệu, không xuất file PDF/Excel.