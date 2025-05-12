// Import các thư viện cần thiết
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

// Load biến môi trường
dotenv.config();

// Khởi tạo Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Đã kết nối thành công đến MongoDB'))
  .catch((err) => console.error('Lỗi kết nối MongoDB:', err));

// Import routes
const categoryRoutes = require('./routes/categories');
const productRoutes = require('./routes/products');
const userRoutes = require('./routes/users');
const roleRoutes = require('./routes/roles');
const roleUserRoutes = require('./routes/roleUsers');
const cartRoutes = require('./routes/carts');
const cartItemRoutes = require('./routes/cartItems');
const orderRoutes = require('./routes/orders');
const statisticsRoutes = require('./routes/statistics');
const businessRoutes = require('./routes/business');

// Sử dụng routes
app.use('/api/danh-muc', categoryRoutes);
app.use('/api/san-pham', productRoutes);
app.use('/api/nguoi-dung', userRoutes);
app.use('/api/vai-tro', roleRoutes);
app.use('/api/nguoi-dung', roleUserRoutes);
app.use('/api/nguoi-dung', cartRoutes);
app.use('/api/gio-hang', cartItemRoutes);
app.use('/api/lich-lai-thu', orderRoutes);
app.use('/api/thong-ke', statisticsRoutes);
app.use('/api', businessRoutes);

// Xử lý lỗi 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Không tìm thấy API endpoint'
  });
});

// Xử lý lỗi chung
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Đã xảy ra lỗi server',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server đang chạy trên port ${PORT}`);
}); 