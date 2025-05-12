const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
  UserID: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'ID người dùng là bắt buộc']
  },
  Status: {
    type: String,
    enum: ['active', 'completed', 'cancelled'],
    default: 'active'
  },
  Total_Amount: {
    type: Number,
    default: 0,
    min: [0, 'Tổng tiền không được âm']
  }
}, {
  timestamps: true
});

// Virtual populate cho các mục trong giỏ hàng
cartSchema.virtual('items', {
  ref: 'CartItem',
  localField: '_id',
  foreignField: 'CartID'
});

// Cấu hình để virtual fields được trả về trong JSON
cartSchema.set('toJSON', { virtuals: true });
cartSchema.set('toObject', { virtuals: true });

const Cart = mongoose.model('Cart', cartSchema);

module.exports = Cart; 