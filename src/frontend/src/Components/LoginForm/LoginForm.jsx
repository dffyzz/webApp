import React, { useEffect, useState } from 'react';
import './LoginForm.css';
import { FaEnvelope, FaLock, FaSignInAlt } from "react-icons/fa";
import { Link, useNavigate, Navigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import { Message } from 'semantic-ui-react'
import axiosInstance from '../axiosConfig';

const LoginForm = () => {
    const [isError, setIsError] = useState(false)

    const userIsAuthenticated = () => {
        if (!(Cookies.get('access_token') || Cookies.get('refresh_token'))) {
          return false
        }
        return true;
    }

    const isLoggedIn = userIsAuthenticated()

    const [formData, setFormData] = useState({
        nickname: '',
        password: ''
    });

    useEffect(() => {
        document.title  = "Login";
    }, []);

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };
    
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!(formData.nickname && formData.password)) {
            setIsError(true)
            return
        }

        try {
            // const response = await axios.post('/api/v1/auth/authenticate', formData);
            const response = await axiosInstance.post('/api/v1/auth/authenticate', formData);
            // console.log(formData); 
            
            if (response.status === 200) {
                
                const { access_token, refresh_token } = response.data;
                //var inMinutes = new Date(new Date().getTime() + 1 * 10 * 1000);
                Cookies.set('access_token', access_token, { expires: 1});
                Cookies.set('refresh_token', refresh_token, { expires: 7});
                // console.log('Токены успешно получены и сохранены в куки');
                
                setIsError(false)
                navigate('/')       //!!!!!!!!!!!!!!!!!!!!!!!
            }
        } catch (error) {
            setIsError(true);
            console.error('Error:', error); // Handle error
        }
    }

    if (isLoggedIn) {
        return <Navigate to={'/'} />
    }

  return (
    <div className='outer'>
    <div className='wrapper'>
        <form onSubmit={handleSubmit}>
            <h1>Вход</h1>
            {isError && <div>Логин или пароль введены неверно!</div>}
            <div className='inputs'>
            <div className="input-box">
                <input 
                    type="text" 
                    placeholder='Логин' 
                    name='nickname'
                    value={formData.nickname}
                    onChange={handleChange}
                    required
                />
                <FaEnvelope className='icon'/>
            </div>
            <div className="input-box">
                <input 
                    type="password" 
                    placeholder='Пароль' 
                    name='password'
                    value={formData.password}
                    onChange={handleChange}
                    required
                />
                <FaLock className='icon'/>
            </div>
            </div>

            {/* <div className="remember-forgot"> */}
                {/* <label>
                    <input type="checkbox" /> Запомнить пароль
                </label> */}
                {/* <a href="#">Забыли пароль?</a> */}
            {/* </div> */}
            <button type='submit'><FaSignInAlt className='sign'/> Вход</button>
            <div className="register-link">
                <p>
                    Нет аккаунта? <Link to="/registration">Регистрация</Link> 
                </p>
            </div>
        </form>
        {/* {isError && <Message negative>The username or password provided are incorrect!</Message>}  */}
    </div>
    </div>
  )
}

export default LoginForm