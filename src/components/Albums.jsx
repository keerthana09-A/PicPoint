import React, { useState, useEffect } from 'react';
import './Albums.css';

const Albums = () => {
  // --- State Management ---
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [showUpload, setShowUpload] = useState(false);
  
  const [commentInput, setCommentInput] = useState(null);
  const [commentText, setCommentText] = useState("");
  const [activeMenu, setActiveMenu] = useState(null);

  // Upload States
  const [newImage, setNewImage] = useState(""); 
  const [newCaption, setNewCaption] = useState("");
  const [newCategory, setNewCategory] = useState("General");

  const user = JSON.parse(localStorage.getItem('picpoint_user')) || { username: 'Guest' };
  console.log(user)
  // --- Core Functions ---

  const getFeed = async (isInitial = false) => {
    if (isInitial) setLoading(true);
    try {
      const res = await fetch(`http://localhost:3002/posts?t=${Date.now()}`);
      const data = await res.json();
      if (Array.isArray(data)) {
        setPosts(data);
        setFilteredPosts(data);
      }
    } catch (err) { console.error("Feed Error:", err); }
    if (isInitial) setLoading(false);
  };

  useEffect(() => { getFeed(true); }, []);

  // Search Logic
  // Updated Search Logic in Albums.jsx
  useEffect(() => {
    const results = posts.filter(p => 
      p.caption?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.uploader?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category?.toLowerCase().includes(searchTerm.toLowerCase()) // Added this line
    );
    setFilteredPosts(results);
  }, [searchTerm, posts]);

  // Handle File Upload (Gallery)
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setNewImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleUpload = async (e) => {
    e.preventDefault();
    if(!newImage) return alert("Please provide an image link or file");
    
    await fetch('http://localhost:3002/upload', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        imageUrl: newImage, 
        uploader: user.username, 
        caption: newCaption,
        category: newCategory // <--- It goes right here!
      })
    });

    // Reset all fields
    setNewImage(""); 
    setNewCaption(""); 
    setNewCategory("General"); // Reset to default
    setShowUpload(false);
    getFeed(); 
};

  const handleDownload = async (url, id) => {
    try {
      const response = await fetch(url);
      const blob = await response.blob();
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.download = `PicPoint-${id}.jpg`;
      link.click();
    } catch (err) { console.error("Download failed", err); }
  };

  const handleLike = async (e, id) => {
  e.preventDefault();
  e.stopPropagation(); 
  try {
    const res = await fetch(`http://localhost:3002/posts/${id}/like`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      // MAKE SURE THIS LINE EXISTS AND USER.USERNAME IS NOT NULL
      body: JSON.stringify({ username: user.username }) 
    });
    if (res.ok) {
        getFeed(); // This refreshes the count on screen
    }
  } catch (err) { console.error(err); }
};

  const handleAddComment = async (id) => {
    if (!commentText.trim()) return;
    try {
      const res = await fetch(`http://localhost:3002/posts/${id}/comment`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: user.username, text: commentText })
      });
      if (res.ok) {
        setCommentText(""); 
        setCommentInput(null);
        getFeed(); 
      }
    } catch (err) { console.error("Comment error", err); }
  };

  return (
    <div className="albums-page-container" onClick={() => setActiveMenu(null)}>
      {/* 1. SEARCH SECTION */}
      <div className="feed-header-nav">
        <input 
          type="text" 
          placeholder="Search PicPoint..." 
          className="main-search"
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <button className="add-post-btn" onClick={() => setShowUpload(!showUpload)}>
          {showUpload ? "✕ Close" : "+ Create Post"}
        </button>
      </div>

      {/* 2. UPLOAD SECTION */}
      {showUpload && (
        <form className="unified-upload-form" onSubmit={handleUpload}>
          <h3>Create New Post</h3>
          <div className="upload-options">
            <input type="text" placeholder="Paste Image URL..." value={newImage} onChange={e => setNewImage(e.target.value)} />
            <div className="divider">OR</div>
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>
          {newImage && <img src={newImage} alt="Preview" className="upload-preview" />}
          <input type="text" placeholder="Caption" value={newCaption} onChange={e => setNewCaption(e.target.value)} />
          <div className="category-input-group">
          <label>Category:</label>
          <select 
            value={newCategory} 
            onChange={(e) => setNewCategory(e.target.value)}
            className="category-dropdown"
          >
            <option value="Abstract">Abstract</option>
            <option value="Animals">Animals</option>
            <option value="Architecture">Architecture</option>
            <option value="Art">Art</option>
            <option value="Automotive">Automotive</option>
            <option value="Beauty">Beauty</option>
            <option value="Books">Books</option>
            <option value="Business">Business</option>
            <option value="Cityscape">Cityscape</option>
            <option value="Cooking">Cooking</option>
            <option value="Design">Design</option>
            <option value="Digital Art">Digital Art</option>
            <option value="Education">Education</option>
            <option value="Fashion">Fashion</option>
            <option value="Fitness">Fitness</option>
            <option value="Food">Food</option>
            <option value="Gaming">Gaming</option>
            <option value="Health">Health</option>
            <option value="Interior">Interior</option>
            <option value="Landscape">Landscape</option>
            <option value="Lifestyle">Lifestyle</option>
            <option value="Luxury">Luxury</option>
            <option value="Music">Music</option>
            <option value="Nature">Nature</option>
            <option value="Nightlife">Nightlife</option>
            <option value="People">People</option>
            <option value="Photography">Photography</option>
            <option value="Sports">Sports</option>
            <option value="Technology">Technology</option>
            <option value="Travel">Travel</option>
            <option value="Urban">Urban</option>
            <option value="Vintage">Vintage</option>
            <option value="Wildlife">Wildlife</option>
            <option value="Z-Experimental">Z-Experimental</option>
          </select>
</div>
          <button type="submit" className="final-upload-btn">Post to Gallery</button>
        </form>
      )}

      {/* 3. FEED SECTION */}
      {loading ? (
        <div className="loader-box"><div className="custom-spinner"></div><p>Gathering feed...</p></div>
      ) : (
        <div className="social-grid-2col">
          {filteredPosts.map(post => (
            <div key={post._id} className="insta-style-card">
              <div className="card-top">
                <span className="user-name">@{post.uploader}</span>
                <div className="menu-container">
                  <button className="menu-trigger" onClick={(e) => {
                    e.stopPropagation();
                    setActiveMenu(activeMenu === post._id ? null : post._id);
                  }}>⋮</button>
                  
                  {activeMenu === post._id && (
                    <div className="floating-menu">
                      <button onClick={() => handleDownload(post.imageUrl, post._id)}>📥 Download</button>
                      {post.uploader === user.username && (
                        <button className="del-opt" onClick={async () => {
                          await fetch(`http://localhost:3002/posts/${post._id}`, {method: 'DELETE'});
                          getFeed();
                        }}>🗑️ Delete</button>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <img src={post.imageUrl} className="card-img" onDoubleClick={(e) => handleLike(e, post._id)} alt="post" />
              
              <div className="card-bottom">
                {/* 4. INTERACTION BUTTONS */}
                <div className="action-btns-row">
                  <button onClick={(e) => handleLike(e, post._id)} className="heart-btn">
                    {post.likes?.includes(user.username) ? '❤️' : '🤍'} {post.likes?.length || 0}
                  </button>
                  <button onClick={(e) => {
                    e.stopPropagation();
                    setCommentInput(commentInput === post._id ? null : post._id);
                  }} className="msg-btn">
                    💬 {post.comments?.length || 0}
                  </button>
                </div>
                
                <p className="caption-display"><strong>{post.uploader}</strong> {post.caption}</p>

                {/* 5. COMMENTS LIST */}
                <div className="comment-thread">
                  {post.comments?.map(c => (
                    <div key={c._id} className="single-comment-row">
                      <span><strong>{c.username}</strong> {c.text}</span>
                    </div>
                  ))}
                </div>

                {/* 6. ADD COMMENT INPUT */}
                {commentInput === post._id && (
                  <div className="comment-input-field" onClick={(e) => e.stopPropagation()}>
                    <input 
                       value={commentText} 
                       onChange={e => setCommentText(e.target.value)} 
                       placeholder="Add a comment..." 
                       autoFocus 
                    />
                    <button onClick={() => handleAddComment(post._id)}>Post</button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Albums;