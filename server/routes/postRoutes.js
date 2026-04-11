const express = require('express');
const router = express.Router();
const Post = require('../models/Post'); // Importing the Schema we'll create next

// @route   POST /api/posts/save
// @desc    Save a new generated image or uploaded image to MongoDB
router.post('/save', async (req, res) => {
    try {
        const { imageUrl, mood, user } = req.body;

        const newPost = new Post({
            imageUrl,
            mood: mood || "General",
            user: user || "Keerthana"
        });

        const savedPost = await newPost.save();
        res.status(201).json(savedPost);
    } catch (err) {
        console.error("Error saving post:", err);
        res.status(500).json({ message: "Server error while saving to MongoDB" });
    }
});

// @route   GET /api/posts/all
// @desc    Get all images for the profile grid
router.get('/all', async (req, res) => {
    try {
        // Find posts and sort by newest first
        const posts = await Post.find().sort({ createdAt: -1 });
        res.status(200).json(posts);
    } catch (err) {
        res.status(500).json({ message: "Could not fetch posts" });
    }
});

module.exports = router;