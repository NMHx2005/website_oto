const express = require('express');
const router = express.Router();
const { getOrders, getOrderById, createOrder, updateOrderStatus, deleteOrder, getUserOrders, getOrderStatistics } = require('../controllers/ordersController');
const { upload } = require('../config/cloudinary');

router.get('/', getOrders);
router.get('/:orderId', getOrderById);
router.post('/', upload.single('image'), createOrder);
router.put('/:orderId', updateOrderStatus);
router.delete('/:orderId', deleteOrder);
router.get('/user/:userId', getUserOrders);
router.get('/statistics', getOrderStatistics);

module.exports = router; 