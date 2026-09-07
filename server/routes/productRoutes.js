const express = require('express');
const { getProducts, getProductById } = require('../controllers/productController');

const router = express.Router();

// Public, read-only. Creating/editing/deleting products is an admin-only
// action — see routes/adminRoutes.js, protected by `adminOnly`.
router.route('/').get(getProducts);

router.route('/:id').get(getProductById);

module.exports = router;
