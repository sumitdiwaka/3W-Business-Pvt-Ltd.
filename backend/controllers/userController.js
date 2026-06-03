const User = require('../models/User')
const Post = require('../models/Post')
const { cloudinary } = require('../config/cloudinary')

// @desc    Update profile (username, bio)
// @route   PUT /api/users/profile
// @access  Private
const updateProfile = async (req, res, next) => {
  try {
    const { username, bio } = req.body
    const userId = req.user._id

    // If changing username, check it's not taken
    if (username && username !== req.user.username) {
      const exists = await User.findOne({ username })
      if (exists) {
        return res.status(400).json({ success: false, message: 'Username already taken' })
      }
    }

    const updated = await User.findByIdAndUpdate(
      userId,
      { ...(username && { username }), ...(bio !== undefined && { bio }) },
      { new: true, runValidators: true }
    ).select('-password')

    res.status(200).json({ success: true, user: updated })
  } catch (error) {
    next(error)
  }
}

// @desc    Upload / update profile avatar
// @route   PUT /api/users/avatar
// @access  Private
const updateAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload an image' })
    }

    const user = await User.findById(req.user._id)

    // Delete old avatar from Cloudinary if exists
    if (user.avatarPublicId) {
      await cloudinary.uploader.destroy(user.avatarPublicId)
    }

    const updated = await User.findByIdAndUpdate(
      req.user._id,
      {
        avatar: req.file.path,              // Cloudinary URL
        avatarPublicId: req.file.filename,  // Cloudinary public_id
      },
      { new: true }
    ).select('-password')

    // Update avatar on all posts by this user so feed shows new photo instantly
    await Post.updateMany(
      { user: req.user._id },
      { userAvatar: req.file.path }
    )

    res.status(200).json({ success: true, user: updated })
  } catch (error) {
    next(error)
  }
}

module.exports = { updateProfile, updateAvatar }