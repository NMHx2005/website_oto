const CartItem = require('../models/CartItem');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { successResponse, errorResponse, HTTP_STATUS } = require('../utils/responseHandler');
const { cloudinary } = require('../config/cloudinary');

// Lấy danh sách mục trong giỏ hàng
const getCartItems = async (req, res) => {
  try {
    const cartItems = await CartItem.find({ CartID: req.params.cartId })
      .populate('ProductID', 'Product_Name Price Main_Image');
    successResponse(res, cartItems);
  } catch (error) {
    errorResponse(res, 'Lỗi lấy danh sách mục trong giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Thêm mục vào giỏ hàng
const addCartItem = async (req, res) => {
  try {
    const { ProductID, Quantity } = req.body;
    const cartId = req.params.cartId;

    // Kiểm tra giỏ hàng
    const cart = await Cart.findById(cartId);
    if (!cart) {
      return errorResponse(res, 'Không tìm thấy giỏ hàng', HTTP_STATUS.NOT_FOUND);
    }

    // Kiểm tra sản phẩm
    const product = await Product.findById(ProductID);
    if (!product) {
      return errorResponse(res, 'Không tìm thấy sản phẩm', HTTP_STATUS.NOT_FOUND);
    }

    // Kiểm tra số lượng tồn kho
    if (product.Stock < Quantity) {
      return errorResponse(res, 'Số lượng sản phẩm trong kho không đủ', HTTP_STATUS.BAD_REQUEST);
    }

    // Kiểm tra mục đã tồn tại trong giỏ hàng
    let cartItem = await CartItem.findOne({
      CartID: cartId,
      ProductID
    });

    if (cartItem) {
      // Cập nhật số lượng nếu mục đã tồn tại
      cartItem.Quantity += Quantity;
      cartItem.Total_Price = cartItem.Quantity * cartItem.Unit_Price;
    } else {
      // Tạo mục mới nếu chưa tồn tại
      cartItem = new CartItem({
        CartID: cartId,
        ProductID,
        Quantity,
        Unit_Price: product.Price,
        Total_Price: product.Price * Quantity,
        Image: product.Main_Image
      });
    }

    await cartItem.save();

    // Cập nhật tổng tiền giỏ hàng
    await Cart.findByIdAndUpdate(cartId, {
      $inc: { Total_Amount: product.Price * Quantity }
    });

    successResponse(res, cartItem, 'Thêm sản phẩm vào giỏ hàng thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi thêm sản phẩm vào giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Cập nhật mục trong giỏ hàng
const updateCartItem = async (req, res) => {
  try {
    const { Quantity } = req.body;
    const { cartId, cartItemId } = req.params;

    const cartItem = await CartItem.findById(cartItemId);
    if (!cartItem) {
      return errorResponse(res, 'Không tìm thấy mục trong giỏ hàng', HTTP_STATUS.NOT_FOUND);
    }

    // Kiểm tra sản phẩm
    const product = await Product.findById(cartItem.ProductID);
    if (!product) {
      return errorResponse(res, 'Không tìm thấy sản phẩm', HTTP_STATUS.NOT_FOUND);
    }

    // Kiểm tra số lượng tồn kho
    if (product.Stock < Quantity) {
      return errorResponse(res, 'Số lượng sản phẩm trong kho không đủ', HTTP_STATUS.BAD_REQUEST);
    }

    // Cập nhật số lượng và tổng tiền
    const oldTotal = cartItem.Total_Price;
    cartItem.Quantity = Quantity;
    cartItem.Total_Price = Quantity * cartItem.Unit_Price;
    await cartItem.save();

    // Cập nhật tổng tiền giỏ hàng
    await Cart.findByIdAndUpdate(cartId, {
      $inc: { Total_Amount: cartItem.Total_Price - oldTotal }
    });

    successResponse(res, cartItem, 'Cập nhật giỏ hàng thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi cập nhật giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

// Xóa mục khỏi giỏ hàng
const deleteCartItem = async (req, res) => {
  try {
    const { cartId, cartItemId } = req.params;

    const cartItem = await CartItem.findById(cartItemId);
    if (!cartItem) {
      return errorResponse(res, 'Không tìm thấy mục trong giỏ hàng', HTTP_STATUS.NOT_FOUND);
    }

    // Xóa mục
    await cartItem.remove();

    // Cập nhật tổng tiền giỏ hàng
    await Cart.findByIdAndUpdate(cartId, {
      $inc: { Total_Amount: -cartItem.Total_Price }
    });

    successResponse(res, null, 'Xóa sản phẩm khỏi giỏ hàng thành công');
  } catch (error) {
    errorResponse(res, 'Lỗi xóa sản phẩm khỏi giỏ hàng', HTTP_STATUS.INTERNAL_SERVER_ERROR, error);
  }
};

module.exports = {
  getCartItems,
  addCartItem,
  updateCartItem,
  deleteCartItem
}; 