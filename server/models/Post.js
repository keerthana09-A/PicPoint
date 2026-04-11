const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    imageUrl: { type: String, required: true },
    mood: { type: String, default: "Neutral" },
    user: { type: String, default: "Keerthana" },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Post', PostSchema);

const postSchema = new mongoose.Schema({
  username: String,
  caption: String,
  imageUrl: String,
  category: { type: String, default: 'General' }, // Ensure this exists
  likes: { type: Array, default: [] },
  comments: { type: Array, default: [] },
  createdAt: { type: Date, default: Date.now }
});