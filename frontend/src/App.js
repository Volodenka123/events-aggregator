import React, { useEffect, useState } from 'react';
import { YMaps, Map, Placemark } from '@pbe/react-yandex-maps';
import AddEventForm from './components/AddEventForm';
import TagSearch from './components/TagSearch';
import LoginForm from './components/LoginForm';
import './App.css';

// Используем абсолютные пути для доступа к изображениям в каталоге public
const HockeyIcon = '/images/Hock.png';
const SportIcon = '/images/Foot.png';
const BasketIcon = '/images/Sport.png';
const VolleyIcon = '/images/Volley.png';
const RunIcon = '/images/Run.png';

const App = () => {
  const [events, setEvents] = useState([]);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [showLogin, setShowLogin] = useState(false);  // Показывать форму входа/регистрации
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [tempMarker, setTempMarker] = useState(null);
  const [newEventCoords, setNewEventCoords] = useState(null);
  const [address, setAddress] = useState(''); // Адрес для выбранного события
  const [selectedTags, setSelectedTags] = useState([]); // Для поиска по тегам

  useEffect(() => {
    fetch('/api/events')
      .then(res => res.json())
      .then(data => setEvents(data))
      .catch(err => console.error('Error fetching events:', err));
  }, []);

  const handleLoginIconClick = () => {
    setShowLogin(!showLogin);  // Открыть/закрыть форму входа
  };

  const handlePlacemarkClick = async (event) => {
    const eventId = event.get('target').properties.get('id');
    const selected = events.find(e => e.id === eventId);
    setSelectedEvent(selected);

    // Получаем адрес с помощью геокодера
    const coords = selected.location;
    const geocoderUrl = `https://geocode-maps.yandex.ru/1.x/?apikey=cbb0f3a7-a9c1-43b1-a76e-1c6f522ffc50&geocode=${coords[1]},${coords[0]}&format=json`;

    try {
      const response = await fetch(geocoderUrl);
      const data = await response.json();
      const foundAddress = data.response.GeoObjectCollection.featureMember[0]?.GeoObject.metaDataProperty.GeocoderMetaData.text;
      setAddress(foundAddress || 'Адрес не указан');
    } catch (error) {
      console.error('Error fetching address:', error);
    }
  };

  const handleMapClick = (e) => {
    const coords = e.get('coords');
    console.log('Clicked coordinates:', coords);

    if (showForm) {
      setTempMarker(coords);
      setNewEventCoords(coords);
    }
  };

  const handleAddActivityClick = () => {
    setShowForm(true);
  };

  const handleFormSubmit = async (newEvent) => {
    const eventWithLocation = { ...newEvent, location: newEventCoords };

    const response = await fetch('/api/events', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(eventWithLocation),
    });

    if (response.ok) {
      const savedEvent = await response.json();
      setEvents([...events, savedEvent]);
    }

    setShowForm(false);
    setTempMarker(null);
  };

  // Фильтрация мероприятий по выбранным тегам
  const filteredEvents = events.filter(event =>
    selectedTags.length === 0 || event.tags.some(tag => selectedTags.includes(tag))
  );

  // Функция для получения URL иконки
  const getIconUrl = (tags) => {
    if (tags.includes('Футбол')) return SportIcon;
    if (tags.includes('Хоккей')) return HockeyIcon;
    if (tags.includes('Баскетбол')) return BasketIcon;
    if (tags.includes('Волейбол')) return VolleyIcon;
    if (tags.includes('Бег')) return RunIcon;
    return 'https://yastatic.net/s3/mapsapi/js/2.1/placemark.svg'; // Стандартная иконка
  };

  return (
    <YMaps>
      <div className="map-container">
        <div className="top-right-icons">
            <a href="#" className="icon-link"><img src="/images/Frame19.png" alt="Icon 1" /></a>
            <a href="#" className="icon-link" onClick={handleLoginIconClick}><img src="/images/Frame18.png" alt="Icon 2" /></a>
        </div>
        {/* Компонент поиска по тегам */}
        <TagSearch onTagsChange={setSelectedTags} />

        {/* Информация о выбранном мероприятии */}
        {selectedEvent && (
          <div className="selected-event-info">
            <button className="close-info" onClick={() => setSelectedEvent(null)}>✖</button>
            <h2>{selectedEvent.title}</h2>
            <p>{selectedEvent.description}</p>
            <p>{address || 'Адрес не указан'}</p>
            <p>{selectedEvent.time}</p>
            <p>Теги: {selectedEvent.tags.join(', ') || 'Теги не указаны'}</p>
          </div>
        )}

        {/* Форма для добавления мероприятия */}
        {showForm && (
          <div className="add-event-form">
            <button className="close-form" onClick={() => setShowForm(false)}>✖</button>
            <AddEventForm onSubmit={handleFormSubmit} />
          </div>
        )}

        {showLogin && (
          <LoginForm 
            onLogin={(user) => {
              setLoggedInUser(user);
              document.querySelector('.add-activity').classList.add('active');
              setShowLogin(false);  // Закрываем форму после входа
            }}
            onRegister={(user) => {
              setLoggedInUser(user); // Добавляем активный стиль
              setShowLogin(false); // Закрываем форму после регистрации
            }}
            onLogout={() => {
              setLoggedInUser(null);
              document.querySelector('.add-activity').classList.remove('active');
            }} // Выход
            loggedInUser={loggedInUser}
            onClose={() => setShowLogin(false)}  // Функция закрытия формы
          />
        
        )}

        {/* Карта */}
        <Map
          defaultState={{ center: [59.9342802, 30.3350986], zoom: 10 }}
          width="100%"
          height="100%"
          onClick={handleMapClick}
        >
          {/* Плейсмарки для мероприятий */}
          {filteredEvents.map(event => (
            <Placemark
              key={event.id}
              geometry={event.location}
              properties={{
                id: event.id,
                balloonContent: `<strong>${event.title}</strong><br/>${event.description}<br/>${address}`,
              }}
              options={{
                iconLayout: 'default#image',
                iconImageHref: getIconUrl(event.tags),
                iconImageSize: [30, 30], // Размер иконки
                iconImageOffset: [-15, -30], // Смещение иконки относительно ее центра
              }}
              onClick={handlePlacemarkClick}
            />
          ))}

          {/* Временная плейсмарка */}
          {tempMarker && (
            <Placemark
              geometry={tempMarker}
              options={{
                preset: 'islands#redIcon',
              }}
            />
          )}
        </Map>

        {/* Кнопка для создания мероприятия */}
        <button
          className="add-activity"  // Зеленый, если пользователь вошел
          onClick={handleAddActivityClick}
        >
          <img src="/images/create-icon.png" alt="" />
          Создать событие
        </button>
      </div>
    </YMaps>
  );
};

export default App;
