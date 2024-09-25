import React, { useState, useRef } from 'react';
import axiosInstance from '../axiosConfig';
import Cookies from 'js-cookie';

const PostModal = ({ isOpen, onClose, fetchPosts }) => {
  const [book, setBook] = useState('');
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');

  const modalRef = useRef();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const token = Cookies.get('access_token');
      await axiosInstance.post('/api/v1/posts', { book, author, content }, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      fetchPosts();
      setBook('');
      setAuthor('');
      setContent('');
      onClose();
    } catch (error) {
      console.error('Ошибка при создании поста:', error);
    }
  };

  const handleClickOutside = (e) => {
    if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
    }
};

  return (
    <div className="modal-overlay" onClick={handleClickOutside}>
      <div className="modal" ref={modalRef}>
        <button className="close-button" onClick={onClose}>X</button>
        <h2>Пост</h2>
        <form className="post-form" onSubmit={handleSubmit}>
          <label htmlFor="book">Название книги</label>
          <input
            type="text"
            id="book"
            value={book}
            onChange={(e) => setBook(e.target.value)}
            required
          />

          <label htmlFor="author">Автор</label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            required
          />

          <label htmlFor="content">текст</label>
          <textarea
            id="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />

          <button type="submit">Опубликовать</button>
        </form>
      </div>
    </div>
  );
};

export default PostModal;
