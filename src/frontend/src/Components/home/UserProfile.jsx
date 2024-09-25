import React, { useState, useEffect } from 'react';
import Cookies from 'js-cookie';
import './UserProfile.css';
import axiosInstance from '../axiosConfig';
import { useNavigate } from 'react-router-dom';

const UserProfile = () => {
    const [user, setUser] = useState({ nickname: '' });
    const [currentPassword, setCurrentPassword] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isEditingPassword, setIsEditingPassword] = useState(false);

    const navigate = useNavigate();

    useEffect(() => {
        if (!(Cookies.get('access_token'))) {
            navigate('/login');
        }
        else{
            fetchUserData();
        }
    }, []);

    const fetchUserData = async () => {
        const token = Cookies.get('access_token');
        try {
            const response = await axiosInstance.get('/api/v1/users/user', {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            setUser(response.data);
        } catch (error) {
            console.error('Error fetching user data:', error);
        }
    };

    const handlePasswordChange = () => {
        setIsEditingPassword(true);
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');
    };

    const handleCancelChange = () => {
        setIsEditingPassword(false);
        setCurrentPassword('');
        setPassword('');
        setConfirmPassword('');
    };

    const handleSavePassword = async () => {
        if (password !== confirmPassword) {
            alert('Passwords do not match');
            return;
        }

        const token = Cookies.get('access_token');
        try {
            await axiosInstance.patch('/api/v1/users/password', {
                currentPassword: currentPassword,
                newPassword: password,
                confirmationPassword: confirmPassword
            }, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            alert('Password changed successfully');
            setIsEditingPassword(false);
        } catch (error) {
            console.error('Error changing password:', error);
        }
    };

    return (
        <div className='back'>
            <div className="user-profile">
                <h2>Профиль пользователя</h2>
                <div className="user-info">
                    <div>
                        <label>Имя:</label>
                        <span>{user.nickname}</span>
                    </div>
                    <div>
                        <label>Пароль:</label>
                        {!isEditingPassword ? (
                            <>
                                <input
                                    type="password"
                                    value="********"
                                    readOnly
                                />
                                <button onClick={handlePasswordChange}>Сменить пароль</button>
                            </>
                        ) : (
                            <>
                                <input
                                    type="password"
                                    placeholder="Текущий пароль"
                                    value={currentPassword}
                                    onChange={(e) => setCurrentPassword(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="Новый пароль"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                                <input
                                    type="password"
                                    placeholder="Подтверждение пароля"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                />
                                <button onClick={handleSavePassword}>Созранить</button>
                                <button className="cancel-button" onClick={handleCancelChange}>Закрыть</button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UserProfile;
