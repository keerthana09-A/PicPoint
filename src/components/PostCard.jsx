// 1. Get the current user from your state or localStorage
const currentUser = JSON.parse(localStorage.getItem('user'));

// 2. Use the 'isGuest' flag we added to the backend earlier
const isGuest = currentUser?.isGuest;

return (
  <div className="actions">
    {/* These only show for real users */}
    {!isGuest && (
      <>
        <button onClick={handleLike}>Like</button>
        <button onClick={handleComment}>Comment</button>
      </>
    )}
    
    {/* Always show for everyone */}
    <button onClick={viewImage}>View</button>
    
    {isGuest && <p className="guest-note">Login to interact!</p>}
  </div>
);