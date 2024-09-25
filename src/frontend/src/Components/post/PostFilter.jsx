import React from 'react';

const PostFilter = ({ filters, setFilters }) => {
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFilters({
      ...filters,
      [name]: value
    });
  };

  return (
    <div className="post-filter">
      <input
        type="text"
        name="book"
        placeholder="Фильтр по книге"
        value={filters.book}
        onChange={handleInputChange}
      />
      <input
        type="text"
        name="nickname"
        placeholder="Фильтр по пользователю"
        value={filters.nickname}
        onChange={handleInputChange}
      />
    </div>
  );
};

export default PostFilter;
