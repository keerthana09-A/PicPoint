const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const app = express();

// --- DYNAMIC CORS FIX ---
app.use(cors({
  origin: function (origin, callback) {
    // This allows your Vercel link, Render link, and Localhost to work
    if (!origin || origin.includes('vercel.app') || origin.includes('onrender.com') || origin.includes('localhost')) {
      callback(null, true);
    } else {
      callback(new Error('CORS block: Origin not allowed'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// --- BIO UPDATE ROUTE ---
// Fixes the 404 error for /user/:id
app.put('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { bio } = req.body;
    // This updates the bio in your MongoDB database
    const updatedUser = await mongoose.model('User').findByIdAndUpdate(id, { bio }, { new: true });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Bio update failed" });
  }
});

// --- GALLERY FETCH ROUTE ---
// Fixes the 404 error for /posts/user/:username
app.get('/posts/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    const posts = await mongoose.model('Post').find({ uploader: username }).sort({ createdAt: -1 });
    res.json(posts || []);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch gallery" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));