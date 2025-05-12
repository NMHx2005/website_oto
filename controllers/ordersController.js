const OrderTestDrive = require('../models/OrderTestDrive');
const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const Product = require('../models/Product');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');

// Lấy danh sách lịch lái thử
const getOrders = async (req, res) => {
  try {
    const orders = await OrderTestDrive.find()
      .populate('UserID', 'UserName Email Phone')
      .populate({
        path: 'CartID',
        populate: {
          path: 'items',
          populate: {
            path: 'ProductID',
            select: 'Product_Name Price Main_Image'
          }
        }
      })
      .sort({ createdAt: -1 });
    successResponse(res, orders);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy danh sách lịch lái thử', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Lấy thông tin lịch lái thử theo ID
const getOrderById = async (req, res) => {
  try {
    const order = await OrderTestDrive.findById(req.params.orderId)
      .populate('UserID', 'UserName Email Phone')
      .populate({
        path: 'CartID',
        populate: {
          path: 'items',
          populate: {
            path: 'ProductID',
            select: 'Product_Name Price Main_Image'
          }
        }
      });

    if (!order) {
      return errorResponse(res, 'Không tìm thấy lịch lái thử', HTTP_STATUS.NOT_FOUND);
    }

    successResponse(res, order);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy thông tin lịch lái thử', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Tạo lịch lái thử mới
const createOrder = async (req, res) => {
  try {
    const { UserID, CartID, Test_Drive_Date, Address, Notes } = req.body;

    // Kiểm tra giỏ hàng
    const cart = await Cart.findById(CartID);
    if (!cart) {
      return errorResponse(res, 'Không tìm thấy giỏ hàng', HTTP_STATUS.NOT_FOUND);
    }

    // Kiểm tra giỏ hàng có sản phẩm không
    const cartItems = await CartItem.find({ CartID });
    if (cartItems.length === 0) {
      return errorResponse(res, 'Giỏ hàng trống', HTTP_STATUS.BAD_REQUEST);
    }

    const order = new OrderTestDrive({
      UserID,
      CartID,
      Order_Date: new Date(),
      Test_Drive_Date,
      Address,
      Notes,
      Total_Amount: cart.Total_Amount,
      ImageUrl: req.file ? req.file.path : null // Lưu URL ảnh từ Cloudinary
    });

    await order.save();

    // Cập nhật trạng thái giỏ hàng
    cart.Status = 'completed';
    await cart.save();

    successResponse(res, order, 'Tạo lịch lái thử thành công', HTTP_STATUS.CREATED);
  } catch (error) {
    errorResponse(res, 'Lỗi tạo lịch lái thử', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Cập nhật trạng thái lịch lái thử
const updateOrderStatus = async (req, res) => {
  try {
    const { Status } = req.body;
    const order = await OrderTestDrive.findById(req.params.orderId);

    if (!order) {
      return errorResponse(res, 'Không tìm thấy lịch lái thử', HTTP_STATUS.NOT_FOUND);
    }

    order.Status = Status;
    await order.save();

    successResponse(res, order, 'Cập nhật trạng thái thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi cập nhật trạng thái', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Xóa lịch lái thử
const deleteOrder = async (req, res) => {
  try {
    const order = await OrderTestDrive.findByIdAndDelete(req.params.orderId);
    if (!order) {
      return errorResponse(res, 'Không tìm thấy lịch lái thử', HTTP_STATUS.NOT_FOUND);
    }
    successResponse(res, null, 'Xóa lịch lái thử thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi xóa lịch lái thử', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Lấy lịch lái thử của người dùng
const getUserOrders = async (req, res) => {
  try {
    const orders = await OrderTestDrive.find({ UserID: req.params.userId })
      .populate({
        path: 'CartID',
        populate: {
          path: 'items',
          populate: {
            path: 'ProductID',
            select: 'Product_Name Price Main_Image'
          }
        }
      })
      .sort({ createdAt: -1 });
    successResponse(res, orders);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy lịch lái thử của người dùng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Thống kê lịch lái thử
const getOrderStatistics = async (req, res) => {
  try {
    const totalOrders = await OrderTestDrive.countDocuments();
    const pendingOrders = await OrderTestDrive.countDocuments({ Status: 'pending' });
    const confirmedOrders = await OrderTestDrive.countDocuments({ Status: 'confirmed' });
    const completedOrders = await OrderTestDrive.countDocuments({ Status: 'completed' });
    const cancelledOrders = await OrderTestDrive.countDocuments({ Status: 'cancelled' });

    const totalAmount = await OrderTestDrive.aggregate([
      { $group: { _id: null, total: { $sum: '$Total_Amount' } } }
    ]);

    successResponse(res, {
      totalOrders,
      pendingOrders,
      confirmedOrders,
      completedOrders,
      cancelledOrders,
      totalAmount: totalAmount[0]?.total || 0
    });
  } catch (error) {
    errorResponse(res, 'Lỗi thống kê lịch lái thử', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

module.exports = {
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  deleteOrder,
  getUserOrders,
  getOrderStatistics
}; 