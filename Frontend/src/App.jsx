
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



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <header>

    {/* <MainPage></MainPage> */}
    </header>



    <Router>
        <div id="container">
          <div>
            <h1>Welcome to Our App</h1>
            <Link to="/signup">Sign Up</Link>
            <Link to="/login">Login</Link>
            <Link to="/main">Main Page</Link>
          </div>
          <Routes>
            <Route exact path="/main" element={<MainPage />} />
            <Route exact path="/signup" element={<Registration />} />
            <Route exact path="/login" element={<Login />}/>
            
          </Routes>
        </div>
      </Router>

      {/* <Login></Login> */}
      


    </>
  )
}

export default App
