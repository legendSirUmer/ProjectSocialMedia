import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import './profilePage.css';
import Nav from './nav';
import Sidebar from './sidebar';

export default function ProfilePage() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loadingFollow, setLoadingFollow] = useState(false);
  const loggedInUserId = localStorage.getItem('id');

  useEffect(() => {
    if (!userId) return;
    // Fetch profile data for the user
    const fetchProfile = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/createpost/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: 'SELECT u.username, p.profileimg, p.bio, p.location, u.date_joined FROM auth_user u JOIN main_profile p ON u.id = p.user_id WHERE u.id = %s',
            params: [userId]
          })
        });
        const data = await response.json();
        console.log("userdata table "+data);
        let posts = [];
        // Fetch posts for this user
        try {
          const postsResponse = await fetch('http://127.0.0.1:8000/createpost/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              query: 'SELECT id, image, caption, created_at FROM main_post WHERE [user] = %s ORDER BY created_at DESC',
              params: [data[0].username]
            })
          });
          posts = await postsResponse.json();
        } catch (err) {
          posts = [];
        }
        if (data && data.length > 0) {
          setUser({
            name: data[0].username,
            profilePicture: data[0].profileimg,
            coverPhoto: 'images/cover-photo.jpg', // Placeholder, update if you have cover photo
            bio: data[0].bio,
            location: data[0].location,
            joined: new Date(data[0].date_joined).toLocaleString('default', { month: 'long', year: 'numeric' }),
            posts: posts // Attach posts here
          });
        }
      } catch (error) {
        // handle error
      }
    };

    // Check if logged-in user follows this user
    const checkFollowing = async () => {
      if (!loggedInUserId || loggedInUserId === userId) return;
      try {
        const response = await fetch('http://127.0.0.1:8000/createpost/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: 'SELECT * FROM main_followerscount WHERE user_id = %s AND follower_id = %s',
            params: [loggedInUserId,userId]
          })
        });
        const data = await response.json();
        console.log("followercount table "+data);
        setIsFollowing(Array.isArray(data) && data.length > 0);
      } catch (error) {
        // handle error
      }
    };

    fetchProfile();
    checkFollowing();
  }, [userId, loggedInUserId]);

  const handleFollowToggle = async () => {
    setLoadingFollow(true);
    try {
      const url = isFollowing
        ? 'http://127.0.0.1:8000/unfollow_user/'
        : 'http://127.0.0.1:8000/follow_user/';
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user: userId,
          follower: loggedInUserId
        })
      });
      const data = await response.json();
      if (response.ok) {
        setIsFollowing(!isFollowing);
      } else {
        alert(data.error || 'Failed to update follow status.');
      }
    } catch (error) {
      alert('Failed to update follow status.');
    }
    setLoadingFollow(false);
  };

  return (
    <div>
      <Nav />
      <Sidebar />
      <div className="profile-page">
        {user && (
          <div className="profile-header">
            <img
              src={
                user.profilePicture
                  ? user.profilePicture.startsWith('http')
                    ? user.profilePicture
                    : `http://127.0.0.1:8000/media/${user.profilePicture}`
                  : 'images/user-profile.jpg'
              }
              alt={user.name}
              className="profile-img"
            />
            <h2>{user.name}</h2>
            <p className="profile-bio">{user.bio}</p>
            <p className="profile-location">{user.location}</p>
            <p>Joined: {user.joined}</p>
            {/* Follow/Unfollow button logic */}
            {loggedInUserId !== userId && (
              <button
                className="follow-btn"
                onClick={handleFollowToggle}
                disabled={loadingFollow}
              >
                {loadingFollow
                  ? 'Please wait...'
                  : isFollowing
                  ? 'Unfollow'
                  : 'Follow'}
              </button>
            )}
          </div>
        )}
        {/* User's posts section */}
        {user && user.posts && user.posts.length > 0 && (
          <div className="profile-posts">
            <h3>{user.name.split(' ')[0]}'s Posts</h3>
            <div className="profile-posts-list">
              {user.posts.map(post => (
                <div key={post.id} className="profile-post-item">
                  <img
                    src={post.image ? (post.image.startsWith('http') ? post.image : `http://127.0.0.1:8000/media/${post.image}`) : ''}
                    alt={post.caption}
                    className="profile-post-img"
                  />
                  <div className="profile-post-caption">{post.caption}</div>
                  <div className="profile-post-date">{new Date(post.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}