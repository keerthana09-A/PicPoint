const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Ensure mongoose is imported
const app = express();

// --- CORS FIX for Vercel and Render ---
app.use(cors({
  origin: function (origin, callback) {
    // Allows your Vercel URL and local testing
    if (!origin || origin.includes('vercel.app') || origin.includes('onrender.com')) {
      callback(null, true);
    } else {
      callback(new Error('CORS Error: Origin not allowed'));
    }
  },
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// --- BIO UPDATE ROUTE ---
// Fixes the 404 for /user/69d948...
app.put('/user/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { bio } = req.body;
    // Replace 'User' with your actual Model name
    const updatedUser = await mongoose.model('User').findByIdAndUpdate(id, { bio }, { new: true });
    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

// --- GALLERY FETCH ROUTE ---
// Fixes the 404 for /posts/user/Keerthana
app.get('/posts/user/:username', async (req, res) => {
  try {
    const { username } = req.params;
    // Ensure 'uploader' matches your MongoDB field exactly
    const posts = await mongoose.model('Post').find({ uploader: username });
    res.json(posts || []);
  } catch (err) {
    res.status(500).json({ error: "Fetch failed" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));