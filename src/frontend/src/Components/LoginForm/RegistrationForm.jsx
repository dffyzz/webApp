import React, { useEffect, useState } from 'react';
import './LoginForm.css';
import { FaUser, FaLock, FaSignInAlt, FaEnvelope } from "react-icons/fa";
import { Link, useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';
import axiosInstance from '../axiosConfig';

const RegistrationForm = () => {
    const [errorMessage, setErrorMessage] = useState('')

    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        nickname: '',
        password: '',
        role: 'USER',
    });

    useEffect(() => {
        document.title = "Registration";
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

        if (!(formData.firstname && 
            formData.lastname && 
            formData.nickname && 
            formData.password)) {
            setErrorMessage('Please, inform all fields!')
            return
        }

        try {
            // const response = await axios.post('/api/v1/auth/register', formData);
            const response = await axiosInstance.post('/api/v1/auth/register', formData);
            // console.log(formData);
            const { access_token, refresh_token } = response.data;
            Cookies.set('access_token', access_token, { expires: 1});
            Cookies.set('refresh_token', refresh_token, { expires: 7});
            navigate('/login');
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className='outer'>
        <div className='wrapper'>
            <form onSubmit={handleSubmit}>
                <h1>Регистрация</h1>
                <div className="input-box">
                    <input
                        type="text"
                        placeholder='Имя'
                        name="firstname"
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                    <FaUser className='icon'/>
                </div>
                <div className="input-box">
                    <input
                        type="text"
                        placeholder='Фамилия'
                        name="lastname"
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                    <FaUser className='icon'/>
                </div>
                <div className="input-box">
                    <input
                        type="text" 
                        placeholder='Логин'
                        name="nickname"
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
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <FaLock className='icon'/>
                </div>

                <button type='submit'><FaSignInAlt className='sign'/> Зарегистрироваться</button>
                <div className="register-link">
                    <p>
                        Уже есть аккаунт? <Link to="/login">Вход</Link> 
                    </p>
                </div>
            </form>
            {/* {<Message negative>{errorMessage}</Message>} */}
            {/* <pre>{JSON.stringify(formData, null, 2)}</pre> */}
        </div>
        </div>
    )
}

export default RegistrationForm;
