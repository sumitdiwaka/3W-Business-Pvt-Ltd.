const express = require('express')
const { updateProfile, updateAvatar } = require('../controllers/userController')
const { protect } = require('../middleware/auth')
const { upload } = require('../config/cloudinary')

const router = express.Router()

// Update bio / username
router.put('/profile', protect, updateProfile)

// Upload avatar — multer handles the file, stored to Cloudinary
router.put('/avatar', protect, upload.single('avatar'), updateAvatar)

module.exports = router