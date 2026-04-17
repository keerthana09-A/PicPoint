import React, { useState, useEffect, useCallback } from 'react';
import './Profile.css';

const Profile = () => {
  // CRITICAL: This MUST match your Render Web Service URL exactly
  const BACKEND_URL = "https://picpoint-backend.onrender.com"; 

  const [myPosts, setMyPosts] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [viewingComments, setViewingComments] = useState(null);
  const [activeMenu, setActiveMenu] = useState(null); 
  
  const [user, setUser] = useState(
    JSON.parse(localStorage.getItem('picpoint_user')) || { username: 'User', bio: 'PicPoint Explorer' }
  );
  const [editBio, setEditBio] = useState(user.bio);

  // --- FEATURE: PHOTO DISPLAY ---
  const fetchMyPosts = useCallback(async () => {
    if (!user.username || user.username === 'User') return;
    try {
      // Added a cache-buster (?t=) to force a fresh fetch every time
      const res = await fetch(`${BACKEND_URL}/posts/user/${user.username}?t=${Date.now()}`);
      if (!res.ok) throw new Error(`Server responded with ${res.status}`);
      const data = await res.json();
      setMyPosts(Array.isArray(data) ? data : []);
    } catch (err) { 
      console.error("❌ Gallery Fetch error:", err); 
    }
  }, [user.username, BACKEND_URL]);

  useEffect(() => { 
    fetchMyPosts(); 
  }, [fetchMyPosts]);

  const handleLogout = () => {
    localStorage.removeItem('picpoint_user');
    window.location.href = "/"; 
  };

  // --- FEATURE: BIO EDITING & SAVING ---
  const saveProfile = async () => {
    if (!user._id) {
        alert("User ID missing. Please log in again.");
        return;
    }
    try {
      const res = await fetch(`${BACKEND_URL}/user/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bio: editBio })
      });

      if (res.ok) {
        const updatedUser = { ...user, bio: editBio };
        localStorage.setItem('picpoint_user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
        alert("Bio updated successfully!");
      } else {
        const errorData = await res.json();
        console.error("Save failed:", errorData);
      }
    } catch (err) { 
      console.error("Update error:", err); 
      alert("Failed to connect to server. Check console for CORS errors.");
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
        {myPosts.length > 0 ? (
          myPosts.map(post => (
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
          ))
        ) : (
          <div className="no-posts">No photos uploaded yet.</div>
        )}
      </div>
    </div>
  );
};

export default Profile;