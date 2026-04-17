import React, { useState, useEffect, useCallback } from 'react';
import './Profile.css';

const Profile = () => {
  // CRITICAL: Ensure this matches your Render service URL exactly
  const BACKEND_URL = "https://picpoint-backend.onrender.com"; 

  const [myPosts, setMyPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [viewingComments, setViewingComments] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null); 
  
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('picpoint_user')) || { username: 'User', bio: 'PicPoint Explorer' }
  );
  const [editBio, setEditBio] = useState(user.bio);

  // --- FEATURE: PHOTO DISPLAY (RESTORED) ---
  const fetchMyPosts = useCallback(async () => {
    try {
      // Points to Render backend to fetch images from the cloud database
      const res = await fetch(`${BACKEND_URL}/posts/user/${user.username}?t=${Date.now()}`);
      const data = await res.json();
      setMyPosts(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error("Fetch error:", err); 
    }
  }, [user.username, BACKEND_URL]);

  useEffect(() => { 
    fetchMyPosts(); 
  }, [fetchMyPosts]);

  const handleLogout = () => {
    localStorage.removeItem('picpoint_user');
    window.location.href = "/"; 
  };

  // --- FEATURE: BIO EDITING & SAVING (RESTORED) ---
  const saveProfile = async () => {
    try {
      const res = await fetch(`${BACKEND_URL}/user/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: editBio })
      });
      if (res.ok) {
        // Updates both the local state and localStorage so it stays saved
        const updatedUser = { ...user, bio: editBio };
        localStorage.setItem('picpoint_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
      }
    } catch (err) { 
      console.error("Update error:", err); 
    }
  };

  const handleDeletePost = async (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      try {
        const res = await fetch(`${BACKEND_URL}/posts/${postId}`, { method: 'DELETE' });
        if (res.ok) {
          setMyPosts(myPosts.filter(p => p._id !== postId));
          setActiveMenu(null);
        }
      } catch (err) { console.error("Delete error:", err); }
    }
  };

  const handleEditPost = async (post) => {
    const newCaption = prompt("Edit your caption:", post.caption);
    if (newCaption !== null && newCaption !== post.caption) {
      try {
        const res = await fetch(`${BACKEND_URL}/posts/${post._id}`, {
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

      {/* PHOTO DISPLAY GRID */}
      <div className="profile-gallery-grid">
        {myPosts.map(post => (
          <div key={post._id} className="gallery-item">
            <img src={post.imageUrl} alt="User upload" />
            <div className="gallery-overlay">
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
            </div>
          </div>
        ))}
      </div>

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