const express = require('express');
const cors = require('cors');
// const mongoose = require('mongoose');
const app = express();

// This tells the backend to trust your Vercel frontend
app.use(cors({
  origin: ["https://pic-point-od46.vercel.app", "https://pic-point-od46-8c3gz1d2x-keerthana09-as-projects.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// This fixes the "Cannot GET /" error
app.get('/', (req, res) => {
  res.send("PicPoint API is live and working!");
});

// GET user posts (Fixes the 404 in Screenshot 154616)
app.get('/posts/user/:username', async (req, res) => {
  try {
    const posts = await mongoose.model('Post').find({ uploader: req.params.username });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// UPDATE bio (Fixes the PUT error in Screenshot 160031)
app.put('/user/:id', async (req, res) => {
  try {
    const updated = await mongoose.model('User').findByIdAndUpdate(
      req.params.id, 
      { bio: req.body.bio }, 
      { new: true }
    );
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: "Update failed" });
  }
});

const PORT = process.env.PORT || 10000;
app.listen(PORT, () => console.log(`Server live on port ${PORT}`));