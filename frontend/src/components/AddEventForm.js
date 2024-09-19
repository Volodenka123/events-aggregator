import React, { useState } from 'react';

const AddEventForm = ({ onSubmit }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [time, setTime] = useState('');
  const [tags, setTags] = useState([]);

  const possibleTags = ['Футбол', 'Хоккей', 'Баскетбол', 'Волейбол', 'Бег']; // Возможные теги

  const handleSubmit = (e) => {
    e.preventDefault();
    const newEvent = {
      title,
      description,
      time,
      tags,
    };
    onSubmit(newEvent);
  };

  const handleTagChange = (e) => {
    const { value } = e.target;
    setTags((prevTags) =>
      prevTags.includes(value) ? prevTags.filter((tag) => tag !== value) : [...prevTags, value]
    );
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>
        Название:
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} required />
      </label>
      <label>
        Описание:
        <textarea value={description} onChange={(e) => setDescription(e.target.value)} required />
      </label>
      <label>
        Время:
        <textarea value={time} onChange={(e) => setTime(e.target.value)} required />
      </label>
      <label>
        {possibleTags.map((tag) => (
          <div key={tag}>
            <input
              type="checkbox"
              value={tag}
              onChange={handleTagChange}
              checked={tags.includes(tag)}
            />
            {tag}
          </div>
        ))}
      </label>
      <button type="submit">Добавить</button>
    </form>
  );
};

export default AddEventForm;
