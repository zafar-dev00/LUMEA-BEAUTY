const express = require('express');
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { protect, adminOnly } = require('../middleware/authMiddleware');

const router = express.Router();

// 1. Verify Cloudinary config exists
if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
  console.error('CRITICAL: Cloudinary environment variables are missing on the server.');
}

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Storage Setup
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'lumea_uploads',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp', 'avif'],
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB
}).single('image');

// 3. POST /api/upload with explicit error logging
router.post('/', protect, adminOnly, (req, res) => {
  upload(req, res, function (err) {
    if (err instanceof multer.MulterError) {
      console.error('Multer upload error:', err);
      return res.status(400).json({ success: false, message: `Upload error: ${err.message}` });
    } else if (err) {
      console.error('Cloudinary/Server upload error:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Image upload failed on cloud server',
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file received.' });
    }

    const imageUrl = req.file.path || req.file.secure_url;
    res.status(200).json({
      success: true,
      url: imageUrl,
      secure_url: imageUrl,
    });
  });
});

module.exports = router;