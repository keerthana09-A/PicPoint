const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose'); // Backend ONLY
const app = express();

app.use(cors({
  origin: ["https://pic-point-od46.vercel.app", "https://picpoint.onrender.com"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

app.use(express.json());

// This fixes the 404 error seen in Screenshot 154616
app.get('/posts/user/:username', async (req, res) => {
    try {
        const posts = await mongoose.model('Post').find({ uploader: req.params.username });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: "Failed to fetch" });
    }
});

// This fixes the PUT error seen in Screenshot 160031
app.put('/user/:id', async (req, res) => {
    try {
        const updated = await mongoose.model('User').findByIdAndUpdate(req.params.id, { bio: req.body.bio }, { new: true });
        res.json(updated);
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

app.listen(10000, () => console.log("Server running"));