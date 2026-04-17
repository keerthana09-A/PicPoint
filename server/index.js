const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const axios = require('axios');
const app = express();

// Load Environment Variables
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 10000; // Render prefers 10000

// --- 1. FIX FOR "CANNOT GET /" ---
app.get('/', (req, res) => {
  res.send("PicPoint API is live and healthy!");
});

// --- 2. CORS CONFIGURATION ---
app.use(cors({
  origin: ["https://pic-point-od46.vercel.app", "https://pic-point-od46-8c3gz1d2x-keerthana09-as-projects.vercel.app"],
  methods: ["GET", "POST", "PUT", "DELETE"],
  credentials: true
}));

// Middlewares
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Database Connection
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ PicPoint connected to MongoDB Atlas Cloud"))
  .catch(err => console.log("❌ DB Error:", err));

// --- SCHEMAS ---
const UserSchema = new mongoose.Schema({
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    bio: { type: String, default: "CSE Student | PicPoint Explorer" }
});

const PostSchema = new mongoose.Schema({
    imageUrl: String,
    uploader: String,
    caption: String,
    category: { type: String, default: "General" },
    likes: { type: [String], default: [] }, 
    comments: [{
        username: String,
        text: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model("Post", PostSchema);

// --- ROUTES ---

// AUTH
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ user: newUser });
    } catch (err) {
        res.status(500).json({ message: "Signup failed." });
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) res.json({ user });
    else res.status(401).json({ message: "Invalid credentials" });
});

// GALLERY
app.get('/posts', async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        if (category && category !== 'All') query.category = category;
        const posts = await Post.find(query).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: "Fetch failed" });
    }
});

app.post('/upload', async (req, res) => {
  try {
    const newPost = new Post(req.body);
    await newPost.save();
    res.send({ message: "Post uploaded!" });
  } catch (err) {
    res.status(500).send({ error: "Upload failed" });
  }
});

app.get('/posts/user/:username', async (req, res) => {
    try {
        const userPosts = await Post.find({ uploader: req.params.username }).sort({ createdAt: -1 });
        res.json(userPosts);
    } catch (err) {
        res.status(500).json({ error: "Gallery fetch failed" });
    }
});

app.put('/user/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, { $set: req.body }, { new: true });
        res.json(updatedUser);
    } catch (err) {
        res.status(500).json({ error: "Update failed" });
    }
});

// MOOD GENERATOR
app.get('/api/ai/mood-generator', async (req, res) => {
  const { mood } = req.query;
  const prompt = `A highly detailed landscape representing a ${mood} mood, cinematic lighting, 4k`;
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?nologo=true`;
  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    res.json({ mood, imageUrl: `data:image/jpeg;base64,${base64Image}` });
  } catch (err) {
    res.status(500).json({ error: "Proxy failed" });
  }
});

app.listen(PORT, () => console.log(`🚀 Server running on Port ${PORT}`));