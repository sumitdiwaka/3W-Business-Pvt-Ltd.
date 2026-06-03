const { validationResult } = require("express-validator");
const Post = require("../models/Post");
const { cloudinary } = require("../config/cloudinary");

// @desc    Create a new post (text, image, or both)
// @route   POST /api/posts
// @access  Private
const createPost = async (req, res, next) => {
  try {
    const { text } = req.body;
    const imageFile = req.file; // Set by multer if image uploaded

    // Validate: at least one of text or image must be present
    if (!text?.trim() && !imageFile) {
      return res.status(400).json({
        success: false,
        message: "Post must have either text or an image (or both)",
      });
    }

    // Build post data
    const postData = {
      user: req.user._id,
      username: req.user.username,
      userAvatar: req.user.avatar || "", // Save current avatar at post creation time
      text: text?.trim() || "",
      image: {},
    };

    // If image was uploaded, Cloudinary URL is in req.file
    if (imageFile) {
      postData.image = {
        url: imageFile.path,         // Cloudinary secure URL
        publicId: imageFile.filename, // Cloudinary public_id
      };
    }

    const post = await Post.create(postData);

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all posts (public feed) with pagination
// @route   GET /api/posts?page=1&limit=10
// @access  Public
const getAllPosts = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    // Get total count for pagination metadata
    const totalPosts = await Post.countDocuments();

    // Fetch posts — newest first
    const posts = await Post.find()
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true }); // lean() for performance + virtuals for likeCount/commentCount

    res.status(200).json({
      success: true,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasNextPage: page < Math.ceil(totalPosts / limit),
        hasPrevPage: page > 1,
      },
      posts,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get a single post by ID
// @route   GET /api/posts/:id
// @access  Public
const getPostById = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id).lean({ virtuals: true });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({ success: true, post });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a post (only by post owner)
// @route   DELETE /api/posts/:id
// @access  Private
const deletePost = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Only allow post owner to delete
    if (post.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this post",
      });
    }

    // Delete image from Cloudinary if it exists
    if (post.image?.publicId) {
      await cloudinary.uploader.destroy(post.image.publicId);
    }

    await post.deleteOne();

    res.status(200).json({ success: true, message: "Post deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// @desc    Like or unlike a post (toggle)
// @route   PUT /api/posts/:id/like
// @access  Private
const toggleLike = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    const userId = req.user._id;
    const username = req.user.username;

    // Check if user already liked this post
    const alreadyLiked = post.likes.some(
      (id) => id.toString() === userId.toString()
    );

    if (alreadyLiked) {
      // Unlike: remove user from likes and likedBy arrays
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
      post.likedBy = post.likedBy.filter((name) => name !== username);
    } else {
      // Like: add user to likes and likedBy arrays
      post.likes.push(userId);
      post.likedBy.push(username);
    }

    await post.save();

    res.status(200).json({
      success: true,
      message: alreadyLiked ? "Post unliked" : "Post liked",
      liked: !alreadyLiked,
      likeCount: post.likes.length,
      likedBy: post.likedBy,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a comment to a post
// @route   POST /api/posts/:id/comments
// @access  Private
const addComment = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: errors.array()[0].msg,
      });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Build and push comment
    const comment = {
      user: req.user._id,
      username: req.user.username,
      userAvatar: req.user.avatar || "", // Save commenter's current avatar
      text: req.body.text.trim(),
    };

    post.comments.push(comment);
    await post.save();

    // Return the newly added comment (last element)
    const newComment = post.comments[post.comments.length - 1];

    res.status(201).json({
      success: true,
      message: "Comment added",
      comment: newComment,
      commentCount: post.comments.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a comment (only by comment owner or post owner)
// @route   DELETE /api/posts/:id/comments/:commentId
// @access  Private
const deleteComment = async (req, res, next) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: "Post not found" });
    }

    // Find the comment
    const comment = post.comments.id(req.params.commentId);

    if (!comment) {
      return res.status(404).json({ success: false, message: "Comment not found" });
    }

    // Only comment owner or post owner can delete
    const isCommentOwner = comment.user.toString() === req.user._id.toString();
    const isPostOwner = post.user.toString() === req.user._id.toString();

    if (!isCommentOwner && !isPostOwner) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this comment",
      });
    }

    comment.deleteOne();
    await post.save();

    res.status(200).json({
      success: true,
      message: "Comment deleted",
      commentCount: post.comments.length,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get posts by a specific user
// @route   GET /api/posts/user/:username
// @access  Public
const getPostsByUser = async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const totalPosts = await Post.countDocuments({
      username: req.params.username,
    });

    const posts = await Post.find({ username: req.params.username })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean({ virtuals: true });

    res.status(200).json({
      success: true,
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalPosts / limit),
        totalPosts,
        hasNextPage: page < Math.ceil(totalPosts / limit),
        hasPrevPage: page > 1,
      },
      posts,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  getPostsByUser,
};