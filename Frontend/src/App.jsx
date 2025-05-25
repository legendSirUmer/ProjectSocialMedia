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



function App() {
  const [count, setCount] = useState(0)

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
            <Link hidden  to="/main">Main Page</Link>
            <Link hidden to="/market">Market</Link>
            <Link hidden to="/profile">Profile</Link>
            <Link hidden to="/settings">Settings</Link>
            <Link hidden to="/ai-agent">AI Agent</Link>
            <Link hidden to="/watch">Shorts</Link>

            
          </div>
          <Routes>
            <Route exact path="/main" element={<MainPage />} />
            <Route exact path="/signup" element={<Registration />} />
            <Route exact path="/" element={<Login />}/>
            <Route exact path="/market" element={<MarketPage />} />
            <Route exact path="/profile/:userId" element={<ProfilePage />} />
            <Route exact path="/profile" element={<ProfilePage />} />
            <Route exact path="/settings" element={<SettingsPage />} />
            <Route path="/ai-agent" element={<AIAgent />} />
            <Route exact path="/watch" element={<Shorts />} />
 
         
            <Route path="*" element={<h1>404 Not Found</h1>} />

          </Routes>
        </div>
      </Router>

      {/* <Login></Login> */}
      


    </>
  )
}

export default App
