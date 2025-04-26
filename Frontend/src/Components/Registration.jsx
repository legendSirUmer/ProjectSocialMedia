import React, { useState } from 'react';
import './registration.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Registration() {
  const [formData, setFormData] = useState({
    firstname: '',
    lastname: '',
    email: '',
    password: '',
    birthDate: '',
    gender: '',
  });

  const navigate = useNavigate(); // Initialize the navigate function

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    axios.post('http://127.0.0.1:8000/register/', formData)
      .then(function (response) {
        console.log(response);
        navigate('/login'); // Redirect to the login page after successful submission
      })
      .catch(function (error) {
        console.error('Error during registration:', error);
      });
  };

  return (
    <div className="registration-container">
      <h1>Sign Up</h1>
      <p>It’s quick and easy.</p>
      <form onSubmit={handleSubmit} className="registration-form">
        <div className="form-group">
          <input
            type="text"
            name="firstname"
            placeholder="First name"
            value={formData.firstname}
            onChange={handleChange}
            required
          />
          <input
            type="text"
            name="lastname"
            placeholder="Last name"
            value={formData.lastname}
            onChange={handleChange}
            required
          />
        </div>
        <input
          type="email"
          name="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={formData.password}
          onChange={handleChange}
          required
        />
        <input
          type="date"
          name="birthDate"
          value={formData.birthDate}
          onChange={handleChange}
          required
        />
        <div className="form-group">
          <label>
            <input
              type="radio"
              name="gender"
              value="Male"
              onChange={handleChange}
              required
            />
            Male
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Female"
              onChange={handleChange}
              required
            />
            Female
          </label>
          <label>
            <input
              type="radio"
              name="gender"
              value="Other"
              onChange={handleChange}
              required
            />
            Other
          </label>
        </div>
        <button type="submit" className="signup-button">Sign Up</button>
      </form>
    </div>
  );
}