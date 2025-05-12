const express = require('express');
const router = express.Router();
const { getUserCart, createCart, updateCart, deleteCart } = require('../controllers/cartsController');

router.get('/:userId', getUserCart);
router.post('/:userId', createCart);
router.put('/:userId', updateCart);
router.delete('/:userId', deleteCart);

module.exports = router; 