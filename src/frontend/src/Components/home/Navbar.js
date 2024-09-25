import React from 'react';
import Cookies from 'js-cookie';
import { Link } from "react-router-dom"
import "./Navbar.css"
import { jwtDecode } from 'jwt-decode'

export default function Navbar () {

  const logout = () => {
    Cookies.remove('access_token')
    Cookies.remove('refresh_token')
  }

  const enterMenuStyle = () => {
    return getUserName() ? { "display": "none" } : { "display": "" }
  }

  const logoutMenuStyle = () => {
    if (!getUserName())
        return { "display": "none" }
  }

  const getUserName = () => {
    if (Cookies.get('access_token')){
        const token = Cookies.get('access_token');
        const user = jwtDecode(token).sub
        return user
    }
    else return ''
  }

  return (
    <nav className="nav">
      <Link to="/" className="site-title">
        📚
      </Link>
      <ul>
        <Link to="/">чаты</Link>
        <Link to="/posts">блог</Link>
        <Link to="/profile" style={logoutMenuStyle()}>{getUserName()}</Link>
        <Link to="/login" onClick={logout} style={logoutMenuStyle()}>Выйти</Link>
        <Link to="/login" style={enterMenuStyle()}>Войти</Link>
        <Link to="/registration" style={enterMenuStyle()}>Зарегистрироваться</Link>
      </ul>
    </nav>
  )
}
