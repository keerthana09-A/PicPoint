require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios'); // <--- CRITICAL: Make sure this is here!
const cors = require('cors');
const app = express();

// Load Environment Variables
const MONGO_URI = process.env.MONGO_URI;
const PORT = process.env.PORT || 3002;

// Middleware
app.use(cors());
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
    // A larger pool of high-quality IDs to pick from
    const pool = [
      { name: "Nature", trait: "Peaceful", ids: ["photo-1501854140801-50d01698950b", "photo-1441974231531-c6227db76b6e", "photo-1470071459604-3b5ec3a7fe05"] },
      { name: "Cyber", trait: "Bold", ids: ["photo-1550684848-fac1c5b4e853", "photo-1518770660439-4636190af475", "photo-1510511459019-5dee0c12fe85"] },
      { name: "Abstract", trait: "Creative", ids: ["photo-1541701494587-cb58502866ab", "photo-1550684847-75bdda21cc95", "photo-1506744038136-46273834b3fb"] },
      { name: "Minimal", trait: "Focused", ids: ["photo-1494438639946-1ebd1d20bf85", "photo-1451187580459-43490279c0fa", "photo-1487014679447-9f8336841d58"] },
      { name: "Vintage", trait: "Nostalgic", ids: ["photo-1518531933037-91b2f5f229cc", "photo-1516035069371-29a1b244cc32", "photo-1485846234645-a62644f84728"] }
    ];

    const finalImages = pool.map((cat, i) => {
      // Pick one random ID from the 3 options in each category
      const randomId = cat.ids[Math.floor(Math.random() * cat.ids.length)];
      
      return {
        _id: `ai_${Date.now()}_${i}_${Math.random()}`,
        // The timestamp (?t=${Date.now()}) kills the browser cache
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

// 1. EDIT PROFILE: This handles the PUT request from Profile.jsx
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

// 2. MY GALLERY: This finds images where 'uploader' matches your username
app.get('/posts/user/:username', async (req, res) => {
    try {
        const { username } = req.params;
        console.log(`🔍 Searching for posts by: ${username}`);
        
        // This looks at the 'uploader' field in your PostSchema
        const userPosts = await Post.find({ uploader: username }).sort({ createdAt: -1 });
        
        res.json(userPosts);
    } catch (err) {
        console.error("❌ Gallery Fetch Error:", err);
        res.status(500).json({ error: "Could not load gallery" });
    }
});

app.get('/api/ai/mood-generator', async (req, res) => {
  try {
    const { mood } = req.query;
    
    // 1. Generate a massive random seed
    const seed = Math.floor(Math.random() * 9999999) + Date.now();
    
    // 2. Add the seed to the AI URL
    const aiUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(mood)}?seed=${seed}&width=1024&height=1024&nologo=true`;

    console.log(`Sending unique request to AI for: ${mood} (Seed: ${seed})`);

    const response = await axios.get(aiUrl, { 
      responseType: 'arraybuffer',
      headers: { 'Cache-Control': 'no-cache' } // Tells the AI service not to send a saved image
    });
    
    res.set('Content-Type', 'image/jpeg');
    res.send(response.data); 
    
  } catch (err) {
    console.error("❌ AI Error:", err.message);
    res.status(500).send("Error generating image");
  }
});

// ... app.listen ...

app.get('/api/ai/test-images', async (req, res) => {
  console.log("🚀 Generating Fresh Test Images...");
  try {
    // We use high-quality Unsplash source with random 'sig' to ensure no repeats
    const categories = [
      { name: "Nature", trait: "Peaceful & Grounded", imgId: "photo-1501854140801-50d01698950b" },
      { name: "Cyberpunk", trait: "Visionary & Bold", imgId: "photo-1550684848-fac1c5b4e853" },
      { name: "Abstract", trait: "Creative & Chaotic", imgId: "photo-1541701494587-cb58502866ab" },
      { name: "Minimalist", trait: "Focused & Calm", imgId: "photo-1494438639946-1ebd1d20bf85" },
      { name: "Vintage", trait: "Nostalgic & Warm", imgId: "photo-1518531933037-91b2f5f229cc" }
    ];

    const finalImages = categories.map((cat, i) => ({
      _id: `ai_${Date.now()}_${i}`,
      // Adding a random signal ensures the browser doesn't cache the image
      url: `https://images.unsplash.com/${cat.imgId}?auto=format&fit=crop&w=600&q=80&sig=${Math.random()}`,
      trait: cat.trait,
      category: cat.name
    }));

    res.json(finalImages);
  } catch (err) {
    res.status(500).json({ error: "Image generation failed" });
  }
});

app.listen(PORT, () => console.log(`🚀 PicPoint Server running on Port ${PORT}`));