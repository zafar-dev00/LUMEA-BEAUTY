const express = require('express');
const { getCategories, getCategoryById } = require('../controllers/categoryController');

const router = express.Router();

// Public, read-only. Creating/editing/deleting/toggling categories is an
// admin-only action — see routes/adminRoutes.js, protected by `adminOnly`.
router.route('/').get(getCategories);

router.route('/:id').get(getCategoryById);

module.exports = router;
