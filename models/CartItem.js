const mongoose = require('mongoose');

const cartItemSchema = new mongoose.Schema({
  CartID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Cart',
    required: [true, 'ID giỏ hàng là bắt buộc']
  },
  ProductID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: [true, 'ID sản phẩm là bắt buộc']
  },
  Quantity: {
    type: Number,
    required: [true, 'Số lượng là bắt buộc'],
    min: [1, 'Số lượng phải lớn hơn 0']
  },
  Unit_Price: {
    type: Number,
    required: [true, 'Đơn giá là bắt buộc'],
    min: [0, 'Đơn giá không được âm']
  },
  Total_Price: {
    type: Number,
    required: [true, 'Tổng tiền là bắt buộc'],
    min: [0, 'Tổng tiền không được âm']
  },
  Image: {
    type: String
  }
}, {
  timestamps: true
});

// Middleware tính tổng tiền trước khi lưu
cartItemSchema.pre('save', function(next) {
  this.Total_Price = this.Quantity * this.Unit_Price;
  next();
});

// Virtual populate cho sản phẩm
cartItemSchema.virtual('product', {
  ref: 'Product',
  localField: 'ProductID',
  foreignField: '_id',
  justOne: true
});

// Cấu hình để virtual fields được trả về trong JSON
cartItemSchema.set('toJSON', { virtuals: true });
cartItemSchema.set('toObject', { virtuals: true });

const CartItem = mongoose.model('CartItem', cartItemSchema);

module.exports = CartItem; 