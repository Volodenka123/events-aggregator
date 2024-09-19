import React, { useState } from 'react';

const TagSearch = ({ onTagsChange }) => {
  const [availableTags] = useState(['Футбол', 'Хоккей', 'Баскетбол', 'Волейбол', 'Бег']); // Доступные теги
  const [selectedTags, setSelectedTags] = useState([]);
  const [isOpen, setIsOpen] = useState(false); // Управляет состоянием открытия выпадающего меню

  const handleTagChange = (e) => {
    const { value } = e.target;
    setSelectedTags((prevTags) =>
      prevTags.includes(value)
        ? prevTags.filter((tag) => tag !== value)
        : [...prevTags, value]
    );
  };

  const handleSearch = () => {
    onTagsChange(selectedTags);
  };

  const toggleDropdown = () => {
    setIsOpen(!isOpen); // Переключение состояния открытия/закрытия
  };

  return (
    <div className="tag-search-container">
      {/* Кнопка с плюсиком для открытия/закрытия меню */}
      <button className="tag-search-button" onClick={toggleDropdown}>
        Добавить фильтры поиска... <span className="plus-icon">+</span>
      </button>
      
      {/* Выпадающий список тегов */}
      {isOpen && (
        <div className="tag-search-dropdown">
          <label>Фильтр по тегам:</label>
          {availableTags.map((tag) => (
            <div key={tag}>
              <input
                type="checkbox"
                value={tag}
                onChange={handleTagChange}
                checked={selectedTags.includes(tag)}
              />
              {tag}
            </div>
          ))}
          <button onClick={handleSearch}>Поиск</button>
        </div>
      )}
    </div>
  );
};

export default TagSearch;
