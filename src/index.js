const express = require('express');
const cors = require('cors');
const app = express();

// --- THE ULTIMATE CORS FIX ---
app.use(cors({
  origin: function (origin, callback) {
    // Allows any Vercel link, local testing, and your Render domain
    if (!origin || origin.includes('vercel.app') || origin.includes('onrender.com') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// --- UPDATED USER BIO ROUTE ---
// Fixed the ID handling to match your frontend call: /user/69d948...
app.put('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { bio } = req.body;
    const updatedUser = await User.findByIdAndUpdate(id, { bio }, { new: true });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Failed to update bio" });
  }
});

// --- UPDATED GALLERY ROUTE ---
// Fixed the 404 issue for: /posts/user/Keerthana
app.get('/posts/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const posts = await Post.find({ uploader: username }).sort({ createdAt: -1 });
    res.json(posts || []);
  } catch (err) {
    res.status(500).json({ error: "Gallery fetch failed" });
  }
});