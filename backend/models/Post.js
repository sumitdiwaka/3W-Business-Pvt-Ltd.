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
      trim: true,
      maxlength: [500, "Comment cannot exceed 500 characters"],
    },

  {
    timestamps: true,
  }
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
    // Avatar URL of the post author — stored at post creation time
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
      url: { type: String, default: "" },       // Cloudinary secure URL
      publicId: { type: String, default: "" },  // Cloudinary public_id for deletion
    },
    // Array of user ObjectIds who liked this post
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // Array of usernames who liked (for quick display without populate)
    likedBy: [
      {
        type: String,
      },
    ],
    // Embedded comments array
    comments: [commentSchema],
  },
  {
    timestamps: true,
  }
);

// Virtual field for like count
postSchema.virtual("likeCount").get(function () {
  return this.likes.length;
});

// Virtual field for comment count
postSchema.virtual("commentCount").get(function () {
  return this.comments.length;
});

// Include virtuals when converting to JSON
postSchema.set("toJSON", { virtuals: true });
postSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Post", postSchema);