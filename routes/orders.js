const express = require('express');
const router = express.Router();
const { getAllOrders, getOrderById, createOrder, updateOrder, deleteOrder, getUserOrders } = require('../controllers/testDriveOrdersController');
const { upload } = require('../config/cloudinary');

router.get('/', getAllOrders);
router.get('/:orderId', getOrderById);
router.post('/', upload.single('image'), createOrder);
router.put('/:orderId', updateOrder);
router.delete('/:orderId', deleteOrder);
router.get('/user/:userId', getUserOrders);

module.exports = router; 