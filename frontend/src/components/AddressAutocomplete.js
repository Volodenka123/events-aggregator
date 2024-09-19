// src/components/AddressAutocomplete.js
import React, { useState, useEffect, useRef } from 'react';

const AddressAutocomplete = ({ onSelect }) => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const inputRef = useRef(null);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setQuery(value);

    if (value) {
      fetch(`https://geocode-maps.yandex.ru/1.x/?format=json&geocode=${encodeURIComponent(value)}&apikey=cbb0f3a7-a9c1-43b1-a76e-1c6f522ffc50&results=5`)
        .then(response => response.json())
        .then(data => {
          console.log('API Response:', data); // Логируем ответ API для отладки
          const items = data.response.GeoObjectCollection.featureMember.map(feature => {
            const geoObject = feature.GeoObject;
            const addressParts = geoObject.description.split(', ');
            const city = addressParts.find(part => part.toLowerCase().includes('санкт-петербург')) || 'Санкт-Петербург';
            return {
              value: `${geoObject.name}, ${city}`,
              address: geoObject.description,
              coords: geoObject.Point.pos.split(' ').map(Number)
            };
          });
          setSuggestions(items);
        })
        .catch(err => console.error('Error fetching suggestions:', err));
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setQuery(suggestion.value);
    setSuggestions([]);
    if (onSelect) {
      onSelect(suggestion); // Передаем данные выбранной подсказки родительскому компоненту
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target)) {
        setSuggestions([]);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div style={{ position: 'relative' }}>
      <input
        type="text"
        value={query}
        onChange={handleInputChange}
        ref={inputRef}
        placeholder="Введите адрес"
      />
      {suggestions.length > 0 && (
        <ul style={{ position: 'absolute', top: '100%', left: 0, right: 0, border: '1px solid #ccc', background: '#fff', zIndex: 1000 }}>
          {suggestions.map((suggestion, index) => (
            <li
              key={index}
              onClick={() => handleSuggestionClick(suggestion)}
              style={{ padding: '8px', cursor: 'pointer' }}
            >
              {suggestion.value}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AddressAutocomplete;
