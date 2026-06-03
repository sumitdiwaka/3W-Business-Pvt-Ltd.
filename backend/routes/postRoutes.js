const express = require("express");
const { body } = require("express-validator");
const {
  createPost,
  getAllPosts,
  getPostById,
  deletePost,
  toggleLike,
  addComment,
  deleteComment,
  getPostsByUser,
} = require("../controllers/postController");
const { protect } = require("../middleware/auth");
const { upload } = require("../config/cloudinary");

const router = express.Router();

// Comment validation
const commentValidation = [
  body("text")
    .trim()
    .notEmpty().withMessage("Comment text is required")
    .isLength({ max: 500 }).withMessage("Comment cannot exceed 500 characters"),
];

// ─── Public Routes ──────────────────────────────────────────────
router.get("/", getAllPosts);                          // GET  /api/posts
router.get("/user/:username", getPostsByUser);         // GET  /api/posts/user/:username
router.get("/:id", getPostById);                      // GET  /api/posts/:id

// ─── Private Routes (require JWT) ───────────────────────────────
// upload.single("image") handles optional image field named "image"
router.post("/", protect, upload.single("image"), createPost);            // POST /api/posts
router.delete("/:id", protect, deletePost);                               // DELETE /api/posts/:id
router.put("/:id/like", protect, toggleLike);                             // PUT  /api/posts/:id/like
router.post("/:id/comments", protect, commentValidation, addComment);     // POST /api/posts/:id/comments
router.delete("/:id/comments/:commentId", protect, deleteComment);        // DELETE /api/posts/:id/comments/:commentId

module.exports = router;