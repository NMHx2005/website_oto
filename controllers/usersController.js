const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');

// Đăng ký người dùng mới
const register = async (req, res) => {
  try {
    const { UserName, Password, Email, Phone, FullName, Address } = req.body;

    // Kiểm tra user đã tồn tại
    const existingUser = await User.findOne({ $or: [{ UserName }, { Email }] });
    if (existingUser) {
      return errorResponse(res, 'Tên đăng nhập hoặc email đã tồn tại', HTTP_STATUS.BAD_REQUEST);
    }

    // Tạo user mới
    const user = new User({
      UserName,
      Password,
      Email,
      Phone,
      FullName,
      Address
    });

    await user.save();
    
    // Tạo token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    successResponse(res, { user, token }, 'Đăng ký thành công', HTTP_STATUS.CREATED);
  } catch (error) {
    errorResponse(res, 'Lỗi đăng ký', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Đăng nhập
const login = async (req, res) => {
  try {
    const { UserName, Password } = req.body;

    // Tìm user
    const user = await User.findOne({ UserName });
    if (!user) {
      return errorResponse(res, 'Tên đăng nhập không tồn tại', HTTP_STATUS.UNAUTHORIZED);
    }

    // Kiểm tra mật khẩu
    const isMatch = await user.comparePassword(Password);
    if (!isMatch) {
      return errorResponse(res, 'Mật khẩu không đúng', HTTP_STATUS.UNAUTHORIZED);
    }

    // Tạo token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    successResponse(res, { user, token }, 'Đăng nhập thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi đăng nhập', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Đăng xuất
const logout = async (req, res) => {
  try {
    // Trong thực tế, bạn có thể thêm token vào blacklist
    successResponse(res, null, 'Đăng xuất thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi đăng xuất', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Lấy danh sách người dùng
const getUsers = async (req, res) => {
  try {
    const users = await User.find().select('-Password');
    successResponse(res, users);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy danh sách người dùng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Lấy thông tin người dùng theo ID
const getUserById = async (req, res) => {
  try {
    const user = await User.findById(req.params.userId).select('-Password');
    if (!user) {
      return errorResponse(res, 'Không tìm thấy người dùng', HTTP_STATUS.NOT_FOUND);
    }
    successResponse(res, user);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy thông tin người dùng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Cập nhật thông tin người dùng
const updateUser = async (req, res) => {
  try {
    const { Password, ...updateData } = req.body;
    const user = await User.findById(req.params.userId);

    if (!user) {
      return errorResponse(res, 'Không tìm thấy người dùng', HTTP_STATUS.NOT_FOUND);
    }

    // Nếu có cập nhật mật khẩu
    if (Password) {
      user.Password = Password;
    }

    // Cập nhật các trường khác
    Object.assign(user, updateData);
    await user.save();

    successResponse(res, user, 'Cập nhật thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi cập nhật người dùng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Xóa người dùng
const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.userId);
    if (!user) {
      return errorResponse(res, 'Không tìm thấy người dùng', HTTP_STATUS.NOT_FOUND);
    }
    successResponse(res, null, 'Xóa người dùng thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi xóa người dùng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getUsers,
  getUserById,
  updateUser,
  deleteUser
}; 