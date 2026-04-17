import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import './Profile.css';
// import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
// ... other imports

const Profile = () => {
  // Line 6 fix: REMOVED 'const navigate = useNavigate()' since it wasn't used
  const [posts, setPosts] = useState([]);

  // useEffect fix: Wrap your function in useCallback so React is happy
  const fetchMyPosts = useCallback(async () => {
    try {
      const response = await fetch('https://picpoint-backend.onrender.com/api/my-posts');
      const data = await response.json();
      setPosts(data);
    } catch (err) {
      console.error(err);
    }
  }, []); // Empty array here is fine

  useEffect(() => {
    fetchMyPosts();
  }, [fetchMyPosts]); // Now we can safely include it here
// const Profile = () => {
//   // const navigate = useNavigate();
//   const [myPosts, setMyPosts] = useState([]);
//   const [isEditing, setIsEditing] = useState(false);
//   const [viewingComments, setViewingComments] = useState(null);
//   const [activeMenu, setActiveMenu] = useState(null); // State for the 3-dot menu
  
//   const [user, setUser] = useState(
//     JSON.parse(localStorage.getItem('picpoint_user')) || { username: 'User', bio: 'PicPoint Explorer' }
//   );
//   const [editBio, setEditBio] = useState(user.bio);

  // const fetchMyPosts = async () => {
  //   try {
  //     const res = await fetch(`http://localhost:3002/posts/user/${user.username}?t=${Date.now()}`);
  //     const data = await res.json();
  //     setMyPosts(Array.isArray(data) ? data : []);
  //   } catch (err) { console.error("Fetch error:", err); }
  // };

  // useEffect(() => { fetchMyPosts(); }, [user.username]);

  const handleLogout = () => {
    localStorage.removeItem('picpoint_user');
    window.location.href = "/"; 
  };

  const saveProfile = async () => {
    try {
      const res = await fetch(`http://localhost:3002/user/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: editBio })
      });
      if (res.ok) {
        const updatedUser = { ...user, bio: editBio };
        localStorage.setItem('picpoint_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
      }
    } catch (err) { console.error("Update error:", err); }
  };

  // --- NEW: Handle Post Deletion ---
  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const res = await fetch(`http://localhost:3002/posts/${postId}`, { method: 'DELETE' });
        if (res.ok) {
          setMyPosts(myPosts.filter(p => p._id !== postId));
          setActiveMenu(null);
        }
      } catch (err) { console.error("Delete error:", err); }
    }
  };

  // --- NEW: Handle Post Edit (Caption only) ---
  const handleEditPost = async (post) => {
    const newCaption = prompt("Edit your caption:", post.caption);
    if (newCaption !== null && newCaption !== post.caption) {
      try {
        const res = await fetch(`http://localhost:3002/posts/${post._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ caption: newCaption })
        });
        if (res.ok) fetchMyPosts();
      } catch (err) { console.error("Edit error:", err); }
    }
    setActiveMenu(null);
  };

  return (
    <div className="profile-page" onClick={() => setActiveMenu(null)}>
      <header className="profile-header">
        <div className="profile-avatar-container">
          <div className="profile-avatar-main">{user.username.charAt(0)}</div>
        </div>

        <div className="profile-info-main">
          <div className="profile-top-row">
            <h1>{user.username}</h1>
            <div className="profile-actions">
              <button className="edit-btn" onClick={() => setIsEditing(true)}>Edit Profile</button>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          </div>

          <div className="profile-stats">
            <span><strong>{myPosts.length}</strong> posts</span>
          </div>

          <div className="profile-bio">
            {isEditing ? (
              <div className="edit-bio-box">
                <textarea 
                  value={editBio} 
                  onChange={(e) => setEditBio(e.target.value)}
                  maxLength="150"
                />
                <div className="edit-btns">
                  <button className="save-btn" onClick={saveProfile}>Save</button>
                  <button className="cancel-btn" onClick={() => setIsEditing(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <p>{user.bio || "No bio yet."}</p>
            )}
          </div>
        </div>
      </header>

      <div className="profile-gallery-grid">
        {myPosts.map(post => (
          <div key={post._id} className="gallery-item">
            <img src={post.imageUrl} alt="gallery" />
            <div className="gallery-overlay">
              
              {/* --- NEW: 3-Dot Menu Section --- */}
              <div className="post-options-container">
                <button className="three-dots-btn" onClick={(e) => {
                  e.stopPropagation();
                  setActiveMenu(activeMenu === post._id ? null : post._id);
                }}>⋮</button>
                
                {activeMenu === post._id && (
                  <div className="post-options-dropdown" onClick={(e) => e.stopPropagation()}>
                    <button onClick={() => handleEditPost(post)}>Edit Caption</button>
                    <button onClick={() => handleDeletePost(post._id)} className="delete-opt">Delete Post</button>
                  </div>
                )}
              </div>

              <div className="overlay-stats" onClick={() => setViewingComments(post)}>
                <span>❤️ {post.likes?.length || 0}</span>
                <span>💬 {post.comments?.length || 0}</span>
              </div>
              <p className="click-hint">View Comments</p>
            </div>
          </div>
        ))}
      </div>

      {/* Viewing Comments Modal remains exactly as you had it */}
      {viewingComments && (
        <div className="modal-overlay" onClick={() => setViewingComments(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-nav">
              <h3>Comments</h3>
              <button className="close-x" onClick={() => setViewingComments(null)}>×</button>
            </div>
            <div className="modal-comments-list">
              {viewingComments.comments?.length > 0 ? (
                viewingComments.comments.map((c, i) => (
                  <div key={i} className="comment-bubble">
                    <span className="commenter-name">@{c.username}</span>
                    <p>{c.text}</p>
                  </div>
                ))
              ) : (
                <div className="no-comments-msg">No comments yet.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;