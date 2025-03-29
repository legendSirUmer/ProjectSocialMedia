
import Login from './Components/Login'
import { useCallback, useEffect, useReducer, useState } from "react";
import { Route, Routes } from "react-router-dom";
import { useSelector } from "react-redux";
import axios from "axios";

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <Login></Login>
    </>
  )
}

export default App
