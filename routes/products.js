const express = require('express');
const router = express.Router();
const { getProducts, getProductById, createProduct, updateProduct, deleteProduct, getProductsByCategory, getAllProducts } = require('../controllers/productsController');
const { upload } = require('../config/cloudinary');

router.get('/', getAllProducts);
router.get('/category/:categoryId', getProductsByCategory);
router.get('/:productId', getProductById);
router.post('/', upload.fields([
  { name: 'Main_Image', maxCount: 1 },
  { name: 'List_Image', maxCount: 5 }
]), createProduct);
router.put('/:productId', upload.fields([
  { name: 'Main_Image', maxCount: 1 },
  { name: 'List_Image', maxCount: 5 }
]), updateProduct);
router.delete('/:productId', deleteProduct);

module.exports = router; 