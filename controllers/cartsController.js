const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');

// Lấy giỏ hàng của người dùng
const getUserCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({ UserID: req.params.userId, Status: 'active' })
      .populate({
        path: 'items',
        populate: {
          path: 'ProductID',
          select: 'Product_Name Price Main_Image'
        }
      });

    if (!cart) {
      return successResponse(res, { items: [], Total_Amount: 0 });
    }

    successResponse(res, cart);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Tạo giỏ hàng mới
const createCart = async (req, res) => {
  try {
    // Kiểm tra xem người dùng đã có giỏ hàng active chưa
    const existingCart = await Cart.findOne({
      UserID: req.params.userId,
      Status: 'active'
    });

    if (existingCart) {
      return errorResponse(res, 'Người dùng đã có giỏ hàng', HTTP_STATUS.BAD_REQUEST);
    }

    const cart = new Cart({
      UserID: req.params.userId,
      Status: 'active',
      Total_Amount: 0
    });

    await cart.save();
    successResponse(res, cart, 'Tạo giỏ hàng thành công', HTTP_STATUS.CREATED);
  } catch (error) {
    errorResponse(res, 'Lỗi tạo giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Cập nhật giỏ hàng
const updateCart = async (req, res) => {
  try {
    const { Status } = req.body;
    const cart = await Cart.findOne({
      UserID: req.params.userId,
      Status: 'active'
    });

    if (!cart) {
      return errorResponse(res, 'Không tìm thấy giỏ hàng', HTTP_STATUS.NOT_FOUND);
    }

    if (Status) {
      cart.Status = Status;
    }

    await cart.save();
    successResponse(res, cart, 'Cập nhật giỏ hàng thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi cập nhật giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Xóa giỏ hàng
const deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findOne({
      UserID: req.params.userId,
      Status: 'active'
    });

    if (!cart) {
      return errorResponse(res, 'Không tìm thấy giỏ hàng', HTTP_STATUS.NOT_FOUND);
    }

    // Xóa tất cả các mục trong giỏ hàng
    await CartItem.deleteMany({ CartID: cart._id });

    // Xóa giỏ hàng
    await cart.remove();
    successResponse(res, null, 'Xóa giỏ hàng thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi xóa giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Cập nhật tổng tiền giỏ hàng
const updateCartTotal = async (cartId) => {
  try {
    const cartItems = await CartItem.find({ CartID: cartId });
    const totalAmount = cartItems.reduce((total, item) => total + item.Total_Price, 0);

    await Cart.findByIdAndUpdate(cartId, { Total_Amount: totalAmount });
  } catch (error) {
    console.error('Lỗi cập nhật tổng tiền giỏ hàng:', error);
  }
};

module.exports = {
  getUserCart,
  createCart,
  updateCart,
  deleteCart,
  updateCartTotal
}; 