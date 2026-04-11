require('dotenv').config();
console.log("DEBUG: Your URI is:", process.env.MONGO_URI);

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();

app.use(cors());
// Increase the limit for JSON and URL-encoded data
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
// YOUR CONNECTION STRING
//const MONGO_URI = "mongodb+srv://addulakeerthana575_db_user:ai6Gw8l6bWoSb3r0@cluster0.vwaf3qo.mongodb.net/picpoint?retryWrites=true&w=majority&appName=Cluster0";

const MONGO_URI = process.env.MONGO_URI

mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ PicPoint connected to MongoDB Atlas Cloud"))
  .catch(err => console.log("❌ DB Error:", err));

// SCHEMAS (User for Profile/Auth, Post for Global Feed)
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
});



const User = mongoose.model('User', UserSchema);
const Post = mongoose.model("Post", PostSchema);

// AUTH ROUTES
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

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const user = await User.findOne({ email, password });
    if (user) res.json({ user });
    else res.status(401).json({ message: "Invalid credentials" });
});

// INSTAGRAM-STYLE GALLERY ROUTES
// server/index.js

app.post('/upload', async (req, res) => {
  try {
    // 1. We take 'uploader' from the frontend (which is Keerthana)
    const { imageUrl, uploader, caption, category } = req.body; 

    const newPost = new Post({ 
      imageUrl, 
      uploader: uploader, // ✅ THIS MUST BE 'uploader', NOT 'username'
      caption, 
      category 
    });

    await newPost.save();
    res.send({ message: "Post uploaded!" });
  } catch (err) {
    console.error("Upload Error:", err);
    res.status(500).send({ error: "Upload failed" });
  }
});

app.get('/posts', async (req, res) => {
    try {
        const { category } = req.query;
        let query = {};
        if (category && category !== 'All') {
            query.category = category;
        }
        const posts = await Post.find(query).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        res.status(500).json({ error: "Feed fetch failed" });
    }
});


// --- ADD THESE NEW ROUTES TO YOUR index.js ---

// Delete a Post (Only if the uploader matches)
app.delete('/posts/:id', async (req, res) => {
    try {
        await Post.findByIdAndDelete(req.params.id);
        res.json({ message: "Post deleted" });
    } catch (err) { res.status(500).json({ error: "Delete failed" }); }
});

// Update Profile Info
app.put('/user/:id', async (req, res) => {
    try {
        const updatedUser = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(updatedUser);
    } catch (err) { res.status(500).json({ error: "Update failed" }); }
});

// Get User Specific Posts
app.get('/posts/user/:username', async (req, res) => {
    try {
        const posts = await Post.find({ uploader: req.params.username }).sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) { res.status(500).json({ error: "Fetch failed" }); }
});
app.put('/posts/:id', async (req, res) => {
    try {
        const updatedPost = await Post.findByIdAndUpdate(
            req.params.id, 
            { caption: req.body.caption }, 
            { new: true }
        );
        res.json(updatedPost);
    } catch (err) { res.status(500).json({ error: "Edit failed" }); }
});
// --- LIKE ROUTE ---
app.post('/posts/:id/like', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        const { username } = req.body;
        if (post.likes.includes(username)) {
            post.likes = post.likes.filter(name => name !== username); // Unlike
        } else {
            post.likes.push(username); // Like
        }
        await post.save();
        res.json(post);
    } catch (err) { 
        console.error("Like Error:", err);
        res.status(500).json({ error: "Like failed" }); 
    }
});

// --- COMMENT ROUTE ---
app.post('/posts/:id/comment', async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: "Post not found" });

        post.comments.push({ 
            username: req.body.username, 
            text: req.body.text 
        });
        await post.save();
        res.json(post);
    } catch (err) { 
        console.error("Comment Error:", err);
        res.status(500).json({ error: "Comment failed" }); 
    }
});

app.delete('/posts/:postId/comment/:commentId', async (req, res) => {
    try {
        const post = await Post.findById(req.params.postId);
        post.comments = post.comments.filter(c => c._id.toString() !== req.params.commentId);
        await post.save();
        res.json(post);
    } catch (err) { res.status(500).send(err); }
});

app.listen(3002, () => console.log('🚀 PicPoint Server running on Port 3002'));