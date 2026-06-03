const mongoose = require("mongoose");

// Comment sub-schema (embedded in post)
const commentSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    userAvatar: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      required: [true, "Comment text is required"],
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },
  },
  { timestamps: true }
);

// Main Post schema
const postSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    // Avatar URL — populated live from User collection on fetch
    userAvatar: {
      type: String,
      default: "",
    },
    text: {
      type: String,
      trim: true,
      maxlength: [1000, "Post text cannot exceed 1000 characters"],
      default: "",
    },
    image: {
      url:      { type: String, default: "" },
      publicId: { type: String, default: "" },
    },
    // Array of user ObjectIds who liked this post
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    // Array of usernames who liked (for quick display)
    likedBy: [{ type: String }],
    // Embedded comments
    comments: [commentSchema],
  },
  { timestamps: true }
);

// Virtual: like count
postSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Virtual: comment count
postSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

postSchema.set("toJSON",   { virtuals: true });
postSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Post", postSchema);