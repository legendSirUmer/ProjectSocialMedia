import React from 'react';
import './profilePage.css';
import Nav from './nav';
import Sidebar from './sidebar';

export default function ProfilePage() {
  const user = {
    name: 'John Doe',
    profilePicture: 'images/user-profile.jpg',
    coverPhoto: 'images/cover-photo.jpg',
    bio: 'Software Engineer | Tech Enthusiast | Avid Reader',
    location: 'San Francisco, CA',
    joined: 'January 2020',
    posts: [
      { id: 1, content: 'Had a great day at the park!', image: 'images/post1.jpg' },
      { id: 2, content: 'Loving the new recipe I tried today!', image: 'images/post2.jpg' },
      { id: 3, content: 'Check out this amazing sunset!', image: 'images/post3.jpg' },
    ],
  };

  return (
    <div>
      <header className='navheader'>
        <Nav />
      </header>
      <Sidebar />
      <div className="profile-page" style={{ marginLeft: "250px", marginTop: "100px" }}>
        <div className="cover-photo">
          <img src={user.coverPhoto} alt="Cover" />
        </div>
        <div className="profile-info">
          <img src={user.profilePicture} alt="Profile" className="profile-picture" />
          <h1>{user.name}</h1>
          <p className="bio">{user.bio}</p>
          <p className="location">📍 {user.location}</p>
          <p className="joined">Joined: {user.joined}</p>
        </div>
        <div className="profile-posts">
          <h2>Posts</h2>
          <div className="posts-grid">
            {user.posts.map((post) => (
              <div key={post.id} className="post-item">
                <img src={post.image} alt="Post" className="post-image" />
                <p>{post.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}