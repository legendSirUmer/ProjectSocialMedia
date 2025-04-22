
import Login from './Components/Login'
import MainPage from './Components/mainPage'
import { useCallback, useEffect, useReducer, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import './App.css'



function App() {
  const [count, setCount] = useState(0)

  return (
    <>
    <header>

    <MainPage></MainPage>
    </header>
      {/* <Login></Login> */}
      


    </>
  )
}

export default App
