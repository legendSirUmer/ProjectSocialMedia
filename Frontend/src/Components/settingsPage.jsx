import React, { useState } from 'react';
import './settingsPage.css';
import Nav from './nav';
import Sidebar from './sidebar';
import axios from 'axios';

export default function SettingsPage() {
  const cleanLocalStorage = (key) => {
    const val = localStorage.getItem(key);
    // Remove surrounding double quotes if present
    if (val && val.startsWith('"') && val.endsWith('"')) {
      return val.slice(1, -1);
    }
    return val || '';
  };

  const [formData, setFormData] = useState({
    name: cleanLocalStorage('username'),
    email: cleanLocalStorage('email'),
    password: '',
    notifications: true,
    bio: cleanLocalStorage('bio'),
    profilePic: cleanLocalStorage('profile_pic'),
    location: cleanLocalStorage('location'),
  });
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleFileChange = (e) => {
    setFormData({
      ...formData,
      profilePic: e.target.files[0],
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const user_id = localStorage.getItem('id');
      const formPayload = new FormData();
      formPayload.append('user_id', user_id);
      formPayload.append('bio', formData.bio);
      formPayload.append('location', formData.location);
      // Only append profilePic if it's a File (user selected a new one)
      if (formData.profilePic && typeof formData.profilePic !== 'string') {
        formPayload.append('profileimg', formData.profilePic);
      }
      const response = await axios.post('http://127.0.0.1:8000/update_profile/', formPayload, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      alert('Settings updated successfully!');
      // Optionally update localStorage with new values
      localStorage.setItem('bio', formData.bio);
      localStorage.setItem('location', formData.location);
      if (formData.profilePic && typeof formData.profilePic !== 'string') {
        // If backend returns the new image URL, update localStorage
        if (response.data.profileimg) {
          localStorage.setItem('profile_pic', response.data.profileimg);
        }
      }
    } catch (error) {
      alert('Failed to update settings.');
      console.error(error);
    }
  };

  return (
    <div>
      <header className='navheader'>
        <Nav />
      </header>
      <Sidebar />
      <div className="settings-page" style={{ marginLeft: "250px", marginTop: "100px" }}>
        <h1>User Settings</h1>
        <form onSubmit={handleSubmit} className="settings-form">
          <div className="form-group">
            <label htmlFor="name">Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
            />
          </div>
      
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="bio">Bio</label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="profilePic">Profile Picture</label>
            <input
              type="file"
              id="profilePic"
              name="profilePic"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="location">Location</label>
            <input
              type="text"
              id="location"
              name="location"
              value={formData.location}
              onChange={handleChange}
            />
          </div>
          <div className="form-group">
            <label htmlFor="notifications">Notifications</label>
            <input
              type="checkbox"
              id="notifications"
              name="notifications"
              checked={formData.notifications}
              onChange={handleChange}
            />
          </div>
          <button type="submit" className="save-button">Save Changes</button>
        </form>
      </div>
    </div>
  );
}