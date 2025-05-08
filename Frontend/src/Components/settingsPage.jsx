import React, { useState } from 'react';
import './settingsPage.css';
import Nav from './nav';
import Sidebar from './sidebar';

export default function SettingsPage() {
  const [formData, setFormData] = useState({
    name: 'John Doe',
    email: 'johndoe@example.com',
    password: '',
    notifications: true,
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Updated Settings:', formData);
    alert('Settings updated successfully!');
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
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
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