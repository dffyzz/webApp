import React, { useState, useEffect } from 'react';
import axiosInstance from '../axiosConfig';
import PostFilter from './PostFilter';
import './PostMain.css';
import PostModal from './PostModal';
import { useNavigate } from 'react-router-dom';
import Cookies from 'js-cookie';

const PostMain = () => {
  const [posts, setPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [filters, setFilters] = useState({
    book: '',
    nickname: ''
  });
  const [isPostModalOpen, setIsPostModalOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!(Cookies.get('access_token'))) {
      navigate('/login')
    }
    fetchPosts();
  }, []);

  useEffect(() => {
    filterPosts();
  }, [filters, posts]);

  const fetchPosts = async () => {
    const response = await axiosInstance.get('/api/v1/posts');
    setPosts(response.data.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  };

  const filterPosts = () => {
    const { book, nickname } = filters;
    let tempPosts = [...posts];

    if (book) {
      tempPosts = tempPosts.filter(post => post.book.toLowerCase().includes(book.toLowerCase()));
    }

    if (nickname) {
      tempPosts = tempPosts.filter(post => post.nickname.toLowerCase().includes(nickname.toLowerCase()));
    }

    setFilteredPosts(tempPosts);
  };

  const openPostModal = () => {
    setIsPostModalOpen(true);
  };

  const closePostModal = () => {
    setIsPostModalOpen(false);
  };

  return (
    <div className='post-main'>
        <div className='post-buttons'>
            <button className="create-post-button" onClick={openPostModal}>Создать пост</button>  
            <PostFilter filters={filters} setFilters={setFilters} />
        </div>
        <div className="post-list">
            {filteredPosts.map((post) => (
                <div className="post">
                <h2>{post.book}</h2>
                <h3>{post.author}</h3>
                <p>{post.content}</p>
                <small>От: {post.nickname} в {new Date(post.timestamp).toLocaleString([], {timeStyle: 'short'})}</small>
                </div>
            ))}
        </div>
        <PostModal isOpen={isPostModalOpen} onClose={closePostModal} fetchPosts={fetchPosts} />
    </div>
  );
};

export default PostMain;
