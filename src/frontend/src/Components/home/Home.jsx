import React, { useEffect, useState } from 'react';
import './Home.css';
import Cookies from 'js-cookie';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../axiosConfig';

const Home = () => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      if (!(Cookies.get('access_token'))) {
        navigate('/login')
      }
      else{
        try {
          const token = Cookies.get('access_token');
          const response = await axiosInstance.get('/api/v1/demo-controller', {
            headers: {
              'Authorization': `Bearer ${token}`
            }
          });
          setData(response.data);
        } catch (error) {
          setError(error);
        }
      }
    };

    fetchData();

    // Чистим эффект
    return () => {
      setData(null);
      setError(null);
    };
  }, []);

  return (
    <div>
      <div className='home'>
        <h1>ABOBA Home</h1>
        {data && (
          <div>
            {/* Отображаем данные */}
            <p>{data}</p>
          </div>
        )}
        {error && (
          <div>
            {/* Отображаем ошибку */}
            <p>Error fetching data: {error.message}</p>
          </div>
        )}
      </div>
    </div>
    
  )
}

export default Home