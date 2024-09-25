import React from 'react';
import './App.css';
import LoginForm from './Components/loginForm/LoginForm';
import Home from './Components/home/Home';
import UserProfile from './Components/home/UserProfile';
import SignUpForm from './Components/loginForm/RegistrationForm';
import {BrowserRouter, Route, Routes, Outlet } from 'react-router-dom';
import Navbar from './Components/home/Navbar';
import MainChat from "./Components/Main/MainChat"
import PostMain from './Components/post/PostMain';

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
        <Route
            element={(
              <>
                <Navbar />
                <Outlet />
              </>
            )}
          >
              <Route path="/profile" element={<UserProfile />} />
              <Route path="/home" element={<Home />} />
              <Route path="/" element={<MainChat />} />
              <Route path="/posts" element={<PostMain />} />
          </Route>
          <Route path="/login" element={<LoginForm/>} />
          <Route path="/registration" element={<SignUpForm/>} />
        </Routes>
      </BrowserRouter>
    </div>
  )
}

export default App;
