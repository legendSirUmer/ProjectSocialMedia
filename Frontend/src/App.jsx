import Login from './Components/Login'
import MainPage from './Components/mainPage'
import { useCallback, useEffect, useReducer, useState } from "react";
import { Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";
import { Component } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import './App.css'
import Registration from './Components/Registration';
import MarketPage from './Components/marketPage';
import ProfilePage from './Components/profilePage';
import SettingsPage from './Components/settingsPage';
import AIAgent from './Components/AIAgent';
import Shorts from './Components/Shorts';
import Chatroom from './Components/ChatRoom';



function App() {
  const [count, setCount] = useState(0);
  const isLoggedIn = !!localStorage.getItem('id');

  return (
    <>
    <header>

    {/* <MainPage></MainPage> */}
    </header>

    <Router>
        <div id="container">
          <div hidden>
            <Link hidden to="/signup">Sign Up</Link>
            <Link hidden to="/">Login</Link>
            {isLoggedIn && <Link hidden to="/main">Main Page</Link>}
            {isLoggedIn && <Link hidden to="/market">Market</Link>}
            {isLoggedIn && <Link hidden to="/profile">Profile</Link>}
            {isLoggedIn && <Link hidden to="/settings">Settings</Link>}
            {isLoggedIn && <Link hidden to="/ai-agent">AI Agent</Link>}
            {isLoggedIn && <Link hidden to="/watch">Shorts</Link>}
            {isLoggedIn && <Link hidden to="/chatroom">Chatroom</Link>}
          </div>
          <Routes>
            {!isLoggedIn && <Route exact path="/signup" element={<Registration />} />}
            {!isLoggedIn && <Route exact path="/" element={<Login />}/>} 
            {isLoggedIn && <Route exact path="/main" element={<MainPage />} />}
            {isLoggedIn && <Route exact path="/market" element={<MarketPage />} />}
            {isLoggedIn && <Route exact path="/profile/:userId" element={<ProfilePage />} />}
            {isLoggedIn && <Route exact path="/profile" element={<ProfilePage />} />}
            {isLoggedIn && <Route exact path="/settings" element={<SettingsPage />} />}
            {isLoggedIn && <Route path="/ai-agent" element={<AIAgent />} />}
            {isLoggedIn && <Route exact path="/watch" element={<Shorts />} />}
            {isLoggedIn && <Route exact path="/chatroom" element={<Chatroom />} />}
            <Route path="*" element={<h1>404 Not Found</h1>} />
          </Routes>
        </div>
      </Router>

      {/* <Login></Login> */}
      


    </>
  )
}

export default App
