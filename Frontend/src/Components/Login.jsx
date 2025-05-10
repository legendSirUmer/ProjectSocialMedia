import React from 'react';
import './login.css'

import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import axios from 'axios';


const Login = () => {


  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });


  const navigate = useNavigate(); // Initialize the navigate function

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    axios.post('http://127.0.0.1:8000/login/', formData)
      .then(function (response) {
        localStorage.setItem('username', JSON.stringify(response.data.username));
        localStorage.setItem('email', JSON.stringify(response.data.email));
        localStorage.setItem('id', JSON.stringify(response.data.id));
        localStorage.setItem('profile_pic', JSON.stringify("http://127.0.0.1:8000/media/"+ response.data.profile_pic));
        localStorage.setItem('bio', JSON.stringify(response.data.bio));
        localStorage.setItem('location', JSON.stringify(response.data.location));

        console.log(response);
        navigate('/main'); // Redirect to the login page after successful submission
      })
      .catch(function (error) {
        console.error('Error during registration:', error);
      });
  };






  return (
 
        <div className='mainbody'>
  <div className="row res">
    <div className="fb-form res">
      <div className="card">
        <h1>Ubook</h1>
        <p>Connect with friends and the world </p>
        <p> around you on Facebook.</p>
      </div>
      <form onSubmit={handleSubmit} >
        <input name="email"
            
            value={formData.firstname}
            onChange={handleChange}  type="email" placeholder="Email or phone number" required="" />
        <input name="password"
            value={formData.firstname}
            onChange={handleChange} type="password" placeholder="Password" required="" />
        <div className="fb-submit">
          <button type="submit" className="login">
            Login
          </button>
          <a href="#" className="forgot">
            Forgot password?
          </a>
        </div>
        <hr />
        <div className="button">
          <a onClick={() => navigate('/signup')} href="#">Create new account</a>
        </div>
      </form>
    </div>
  </div>
  <footer>
    <div className="footer-langs">
      <ol>
        <li>English (UK)</li>
        <li>
          <a href="#">मराठी</a>
        </li>
        <li>
          <a href="#">हिन्दी</a>
        </li>
        <li>
          <a href="#">اردو</a>
        </li>
        <li>
          <a href="#">ગુજરાતી</a>
        </li>
        <li>
          <a href="#">ಕನ್ನಡ</a>
        </li>
        <li>
          <a href="#">ਪੰਜਾਬੀ</a>
        </li>
        <li>
          <a href="#">தமிழ்</a>
        </li>
        <li>
          <a href="#">বাংলা</a>
        </li>
        <li>
          <a href="#">తెలుగు</a>
        </li>
        <li>
          <a href="#">മലയാളം</a>
        </li>
        <li>
          <button>+</button>
        </li>
      </ol>
      <ol>
        <li>
          <a href="#">Sign Up</a>
        </li>
        <li>
          <a href="#">Log In </a>
        </li>
        <li>
          <a href="#">Messenger</a>
        </li>
        <li>
          <a href="#">Facebook Lite</a>
        </li>
        <li>
          <a href="#">Video</a>
        </li>
        <li>
          <a href="#">Places</a>
        </li>
        <li>
          <a href="#">Games</a>
        </li>
        <li>
          <a href="#">Marketplace</a>
        </li>
        <li>
          <a href="#">Meta Pay</a>
        </li>
        <li>
          <a href="#">Meta Store</a>
        </li>
        <li>
          <a href="#">Meta Quest</a>
        </li>
        <li>
          <a href="#">Imagine with Meta AI</a>
        </li>
        <li>
          <a href="#">Instagram</a>
        </li>
        <li>
          <a href="#">Threads</a>
        </li>
        <li>
          <a href="#">Fundraisers</a>
        </li>
        <li>
          <a href="#">Services</a>
        </li>
        <li>
          <a href="#">Voting Information Centre</a>
        </li>
        <li>
          <a href="#">Privacy Policy</a>
        </li>
        <li>
          <a href="#">Privacy Centre</a>
        </li>
        <li>
          <a href="#">Groups</a>
        </li>
        <li>
          <a href="#">About</a>
        </li>
        <li>
          <a href="#">Create ad</a>
        </li>
        <li>
          <a href="#">Create Page</a>
        </li>
        <li>
          <a href="#">Developers</a>
        </li>
        <li>
          <a href="#">Careers</a>
        </li>
        <li>
          <a href="#">Cookies</a>
        </li>
        <li>
          <a href="#">AdChoices</a>
        </li>
        <li>
          <a href="#">Terms</a>
        </li>
        <li>
          <a href="#">Help</a>
        </li>
        <li>
          <a href="#">Contact uploading and non-users</a>
        </li>
      </ol>
      <small>Umer © 2025</small>
    </div>
  </footer>
</div>


  );
};

export default Login;