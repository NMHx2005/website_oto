# Test Drive Booking System API

Hệ thống API đặt lịch lái thử xe với các chức năng quản lý sản phẩm, người dùng, giỏ hàng và đơn hàng.

## Công nghệ sử dụng

### Backend
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: Database
- **Mongoose**: ODM cho MongoDB
- **JWT**: Xác thực người dùng
- **Cloudinary**: Quản lý và lưu trữ hình ảnh
- **Multer**: Xử lý upload file
- **Bcryptjs**: Mã hóa mật khẩu
- **Cors**: Xử lý CORS
- **Dotenv**: Quản lý biến môi trường

## Cài đặt và Chạy dự án

1. Clone repository:
```bash
git clone <repository-url>
```

2. Cài đặt dependencies:
```bash
npm install
```

3. Tạo file .env và cấu hình các biến môi trường:
```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/test-drive-booking
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

4. Chạy dự án:
```bash
# Development
npm run dev

# Production
npm start
```

## API Endpoints

### 1. Danh Mục Sản Phẩm (Product Categories)
- `GET /api/danh-muc`: Lấy danh sách danh mục
- `GET /api/danh-muc/:categoryId`: Lấy thông tin danh mục theo ID
- `POST /api/danh-muc`: Tạo danh mục mới (Yêu cầu xác thực)
- `PUT /api/danh-muc/:categoryId`: Cập nhật danh mục (Yêu cầu xác thực)
- `DELETE /api/danh-muc/:categoryId`: Xóa danh mục (Yêu cầu xác thực)
- `GET /api/danh-muc/:categoryId/san-pham`: Lấy danh sách sản phẩm theo danh mục

### 2. Sản Phẩm (Products)
- `GET /api/san-pham`: Lấy danh sách sản phẩm
- `GET /api/san-pham/:productId`: Lấy thông tin sản phẩm theo ID
- `POST /api/san-pham`: Tạo sản phẩm mới (Yêu cầu xác thực)
  - Hỗ trợ upload nhiều ảnh (1 ảnh chính, tối đa 5 ảnh phụ)
  - Ảnh được lưu trữ trên Cloudinary
- `PUT /api/san-pham/:productId`: Cập nhật sản phẩm (Yêu cầu xác thực)
- `DELETE /api/san-pham/:productId`: Xóa sản phẩm (Yêu cầu xác thực)
- `GET /api/san-pham/category/:categoryId`: Lấy sản phẩm theo danh mục

### 3. Người Dùng (Users)
- `POST /api/nguoi-dung/register`: Đăng ký tài khoản
- `POST /api/nguoi-dung/login`: Đăng nhập
- `POST /api/nguoi-dung/dang-xuat`: Đăng xuất
- `GET /api/nguoi-dung`: Lấy danh sách người dùng (Yêu cầu xác thực)
- `GET /api/nguoi-dung/:userId`: Lấy thông tin người dùng (Yêu cầu xác thực)
- `PUT /api/nguoi-dung/:userId`: Cập nhật thông tin người dùng (Yêu cầu xác thực)
- `DELETE /api/nguoi-dung/:userId`: Xóa người dùng (Yêu cầu xác thực)

### 4. Giỏ Hàng (Cart)
- `GET /api/nguoi-dung/:userId/gio-hang`: Lấy thông tin giỏ hàng
- `POST /api/nguoi-dung/:userId/gio-hang`: Tạo/cập nhật giỏ hàng
  - Body: `{"Product_Name": "Xe A", "Status": "active"}`
- `PUT /api/nguoi-dung/:userId/gio-hang`: Cập nhật trạng thái giỏ hàng
  - Body: `{"Status": "completed"}`
- `DELETE /api/nguoi-dung/:userId/gio-hang`: Xóa giỏ hàng

### 5. Chi Tiết Giỏ Hàng (Cart Items)
- `GET /api/gio-hang/:cartId/muc`: Lấy danh sách sản phẩm trong giỏ hàng
- `POST /api/gio-hang/:cartId/muc`: Thêm sản phẩm vào giỏ hàng
  - Body: `{"ProductID": "<productId>", "Quantity": 1, "Unit_price": 1000}`
- `PUT /api/gio-hang/:cartId/muc/:cartItemId`: Cập nhật số lượng sản phẩm
  - Body: `{"Quantity": 2}`
- `DELETE /api/gio-hang/:cartId/muc/:cartItemId`: Xóa sản phẩm khỏi giỏ hàng

### 6. Đơn Hàng Lái Thử (Test Drive Orders)
- `GET /api/lich-lai-thu`: Lấy danh sách đơn hàng (Yêu cầu xác thực)
- `GET /api/lich-lai-thu/:orderId`: Lấy thông tin đơn hàng (Yêu cầu xác thực)
- `POST /api/lich-lai-thu`: Tạo đơn hàng mới (Yêu cầu xác thực)
  - Hỗ trợ upload ảnh (lưu trữ trên Cloudinary)
- `PUT /api/lich-lai-thu/:orderId`: Cập nhật trạng thái đơn hàng (Yêu cầu xác thực)
- `DELETE /api/lich-lai-thu/:orderId`: Xóa đơn hàng (Yêu cầu xác thực)
- `GET /api/nguoi-dung/:userId/lich-lai-thu`: Lấy đơn hàng của người dùng

### 7. Thống Kê (Statistics)
- `GET /api/thong-ke/lich-lai-thu`: Thống kê đơn hàng (Yêu cầu xác thực)
- `GET /api/thong-ke/nguoi-dung`: Thống kê người dùng (Yêu cầu xác thực)
- `GET /api/thong-ke/san-pham`: Thống kê sản phẩm (Yêu cầu xác thực)

### 8. Business Logic APIs
- `POST /api/nguoi-dung/:userId/gio-hang/dat-lich`: Đặt lịch lái thử từ giỏ hàng
- `PUT /api/lich-lai-thu/:orderId/trang-thai`: Cập nhật trạng thái đơn hàng
  - Body: `{"Status": "completed"}`

## Tính năng chính

1. **Quản lý sản phẩm**
   - CRUD sản phẩm
   - Upload và quản lý hình ảnh sản phẩm
   - Phân loại sản phẩm theo danh mục

2. **Quản lý người dùng**
   - Đăng ký, đăng nhập, đăng xuất
   - Phân quyền người dùng
   - Quản lý thông tin cá nhân

3. **Quản lý giỏ hàng**
   - Thêm/xóa sản phẩm
   - Cập nhật số lượng
   - Tính tổng tiền
   - Đặt lịch lái thử trực tiếp từ giỏ hàng

4. **Đặt lịch lái thử**
   - Tạo đơn hàng từ giỏ hàng
   - Upload ảnh đính kèm
   - Theo dõi trạng thái đơn hàng
   - Cập nhật trạng thái đơn hàng

5. **Thống kê và báo cáo**
   - Thống kê đơn hàng
   - Thống kê người dùng
   - Thống kê sản phẩm

## Bảo mật

- Xác thực JWT
- Mã hóa mật khẩu với bcrypt
- Validation dữ liệu đầu vào
- Xử lý CORS
- Bảo vệ các route nhạy cảm

## Lưu ý khi sử dụng

1. Đảm bảo đã cấu hình đúng các biến môi trường trong file .env
2. Các API yêu cầu xác thực cần gửi kèm token trong header:
   ```
   Authorization: Bearer <token>
   ```
3. Khi upload ảnh, sử dụng form-data với các field tương ứng
4. Giới hạn kích thước file ảnh: 5MB
5. Định dạng ảnh được chấp nhận: jpg, jpeg, png, gif 