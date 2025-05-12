const Cart = require('../models/Cart');
const CartItem = require('../models/CartItem');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');

// Get user cart with pagination and search
const getUserCart = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '', status = '' } = req.query;
    const query = { UserID: req.params.userId };

    // Search by product name
    if (search) {
      query['Items.Product_Name'] = { $regex: search, $options: 'i' };
    }

    // Filter by status
    if (status) {
      query.Status = status;
    }

    // Calculate skip
    const skip = (page - 1) * limit;

    // Execute query
    const [cart, total] = await Promise.all([
      Cart.findOne(query)
        .populate('Items.ProductID')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Cart.countDocuments(query)
    ]);

    if (!cart) {
      return successResponse(res, { items: [], total: 0 });
    }

    successResponse(res, {
      cart,
      pagination: {
        total,
        page: Number(page),
        limit: Number(limit),
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    errorResponse(res, 'Lỗi lấy giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Create/Update cart
const createOrUpdateCart = async (req, res) => {
  try {
    const { Product_Name, Status } = req.body;
    const userId = req.params.userId;

    let cart = await Cart.findOne({ UserID: userId });

    if (!cart) {
      // Create new cart
      cart = new Cart({
        UserID: userId,
        Items: [],
        Status: Status || 'active'
      });
    }

    // Update cart status if provided
    if (Status) {
      cart.Status = Status;
    }

    await cart.save();
    successResponse(res, cart, 'Cập nhật giỏ hàng thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi cập nhật giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Update cart
const updateCart = async (req, res) => {
  try {
    const { Status } = req.body;
    const userId = req.params.userId;

    const cart = await Cart.findOneAndUpdate(
      { UserID: userId },
      { Status },
      { new: true }
    );

    if (!cart) {
      return errorResponse(res, 'Không tìm thấy giỏ hàng', HTTP_STATUS.NOT_FOUND);
    }

    successResponse(res, cart, 'Cập nhật giỏ hàng thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi cập nhật giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Delete cart
const deleteCart = async (req, res) => {
  try {
    const cart = await Cart.findOneAndDelete({ UserID: req.params.userId });
    if (!cart) {
      return errorResponse(res, 'Không tìm thấy giỏ hàng', HTTP_STATUS.NOT_FOUND);
    }
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
  createOrUpdateCart,
  updateCart,
  deleteCart,
  updateCartTotal
}; 