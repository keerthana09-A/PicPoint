require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors'); 
const app = express();

const axios = require('axios');
// Load Environment Variables
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3002;

// --- UPDATED MIDDLEWARE SECTION ---
// This version uses origin: true to automatically trust your specific Vercel URL
// This is the most reliable way to fix the "blocked by CORS policy" errors
app.use(cors({
    origin: true, 
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true
}));

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
        _id: { type: mongoose.Schema.Types.ObjectId, default: () => new mongoose.Types.ObjectId() },
        username: String,
        text: String,
        createdAt: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

const User = mongoose.model('User', UserSchema);
const Post = mongoose.model("Post", PostSchema);

// --- AUTH ROUTES ---
app.post('/signup', async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const newUser = new User({ username, email, password });
        await newUser.save();
        res.status(201).json({ user: newUser });
    } catch (err) {
        res.status(500).json({ message: "Signup failed. Email might exist." });
    }
});

app.get('/api/ai/test-images', async (req, res) => {
  try {
    const pool = [
      { name: "Nature", trait: "Peaceful", ids: ["photo-1501854140801-50d01698950b", "photo-1441974231531-c6227db76b6e", "photo-1470071459604-3b5ec3a7fe05"] },
      { name: "Cyber", trait: "Bold", ids: ["photo-1550684848-fac1c5b4e853", "photo-1518770660439-4636190af475", "photo-1510511459019-5dee0c12fe85"] },
      { name: "Abstract", trait: "Creative", ids: ["photo-1541701494587-cb58502866ab", "photo-1550684847-75bdda21cc95", "photo-1506744038136-46273834b3fb"] },
      { name: "Minimal", trait: "Focused", ids: ["photo-1494438639946-1ebd1d20bf85", "photo-1451187580459-43490279c0fa", "photo-1487014679447-9f8336841d58"] },
      { name: "Vintage", trait: "Nostalgic", ids: ["photo-1518531933037-91b2f5f229cc", "photo-1516035069371-29a1b244cc32", "photo-1485846234645-a62644f84728"] }
    ];

    const finalImages = pool.map((cat, i) => {
      const randomId = cat.ids[Math.floor(Math.random() * cat.ids.length)];
      return {
        _id: `ai_${Date.now()}_${i}_${Math.random()}`,
        url: `https://images.unsplash.com/${randomId}?auto=format&fit=crop&w=600&q=80&t=${Date.now()}_${i}`,
        trait: cat.trait,
        category: cat.name
      };
    });
    res.json(finalImages);
  } catch (err) {
    res.status(500).json({ error: "Failed to generate images" });
  }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) res.json({ user });
    else res.status(401).json({ message: "Invalid credentials" });
});

// --- GALLERY & POST ROUTES ---
app.get('/posts', async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        if (category && category !== 'All') query.category = category;
        const posts = await Post.find(query).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: "Feed fetch failed" });
    }
});

app.post('/upload', async (req, res) => {
  try {
    const { imageUrl, uploader, caption, category } = req.body; 
    const newPost = new Post({ imageUrl, uploader, caption, category });
    await newPost.save();
    res.send({ message: "Post uploaded!" });
  } catch (err) {
    res.status(500).send({ error: "Upload failed" });
  }
});

app.delete('/posts/:id', async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted" });
    } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

// --- LIKE & COMMENT LOGIC ---
app.post('/posts/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        const { username } = req.body;
        if (post.likes.includes(username)) {
            post.likes = post.likes.filter(name => name !== username);
        } else {
            post.likes.push(username);
        }
        await post.save();
        res.json(post);
    } catch (err) { res.status(500).json({ error: "Like failed" }); }
});

app.post('/posts/:id/comment', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        post.comments.push({ username: req.body.username, text: req.body.text });
        await post.save();
        res.json(post);
    } catch (err) { res.status(500).json({ error: "Comment failed" }); }
});

// --- PROFILE & GALLERY REPAIR ---
app.put('/user/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const updatedUser = await User.findByIdAndUpdate(
            id, 
            { $set: req.body }, 
            { new: true }
        );
        console.log("✅ Profile Updated in DB:", updatedUser.username);
        res.json(updatedUser);
    } catch (err) {
        console.error("❌ Edit Error:", err);
        res.status(500).json({ error: "Could not update profile" });
    }
});

app.get('/posts/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        console.log(`🔍 Searching for posts by: ${username}`);
        const userPosts = await Post.find({ uploader: username }).sort({ createdAt: -1 });
        res.json(userPosts);
    } catch (err) {
        console.error("❌ Gallery Fetch Error:", err);
        res.status(500).json({ error: "Could not load gallery" });
    }
});

// --- MOOD GENERATOR ROUTE ---
app.get('/api/ai/mood-generator', async (req, res) => {
  const { mood } = req.query;
  const seed = Math.floor(Math.random() * 1000000);
  const prompt = `A highly detailed, peaceful meditation landscape representing a ${mood} mood, unique atmosphere, cinematic lighting, 4k`;
  const imageUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(prompt)}?seed=${seed}&width=1024&height=1024&nologo=true`;

  try {
    const response = await axios.get(imageUrl, { responseType: 'arraybuffer' });
    const base64Image = Buffer.from(response.data, 'binary').toString('base64');
    const dataUrl = `data:image/jpeg;base64,${base64Image}`;

    res.json({ 
      mood, 
      imageUrl: dataUrl, 
      quote: "Take a deep breath. Let this peace settle your mind." 
    });
  } catch (err) {
    res.status(500).json({ error: "Proxy failed" });
  }
});

app.listen(PORT, () => console.log(`🚀 PicPoint Server running on Port ${PORT}`));