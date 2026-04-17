const express = require('express');
const cors = require('cors');
const app = express();

// Use this EXACT CORS setup to fix the red errors in your console
app.use(cors({
  origin: [
    "https://pic-point-od46.vercel.app", // Your specific Vercel URL from the logs
    "https://picpoint.onrender.com"      // Your Render frontend URL
  ],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// FIXED ROUTE: This handles the fetch call from your Profile.jsx
app.get('/posts/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        // Ensure 'uploader' matches how you store the name in MongoDB
        const userPosts = await Post.find({ uploader: username }).sort({ createdAt: -1 });
        res.status(200).json(userPosts || []);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch gallery" });
    }
});

// FIXED BIO ROUTE: Matches the PUT request in Profile.jsx
app.put('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const { bio } = req.body;
        const updatedUser = await User.findByIdAndUpdate(id, { bio }, { new: true });
        res.status(200).json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});