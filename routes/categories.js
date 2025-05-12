const express = require('express');
const router = express.Router();
const { getCategories, getCategoryById, createCategory, updateCategory, deleteCategory, getAllCategories, getProductsByCategory } = require('../controllers/categoriesController');

router.get('/', getAllCategories);
router.get('/:categoryId', getCategoryById);
router.get('/:categoryId/products', getProductsByCategory);
router.post('/', createCategory);
router.put('/:categoryId', updateCategory);
router.delete('/:categoryId', deleteCategory);

module.exports = router; 