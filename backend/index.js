const express = require('express');
const app = express();
const fs = require('fs');
const path = require('path');
const PORT = process.env.PORT || 5000;

app.use(express.json()); // Для работы с JSON

const USERS_FILE_PATH = path.join(__dirname, 'users.json');

// Чтение файла users.json
const readUsersFile = () => {
  return new Promise((resolve, reject) => {
    fs.readFile(USERS_FILE_PATH, 'utf8', (err, data) => {
      if (err) {
        reject(err);
      } else {
        try {
          const users = data ? JSON.parse(data) : []; // Если файл пустой, вернуть пустой массив
          resolve(users);
        } catch (parseError) {
          reject(new Error('Ошибка при разборе данных пользователей'));
        }
      }
    });
  });
};

// Запись в файл users.json
const writeUsersFile = (users) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(USERS_FILE_PATH, JSON.stringify(users, null, 2), 'utf8', (err) => {
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
};

// Маршрут для регистрации
app.post('/api/register', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Логин и пароль обязательны' });
  }

  try {
    const users = await readUsersFile();
    const userExists = users.find(user => user.username === username);

    if (userExists) {
      return res.status(400).json({ message: 'Пользователь уже существует' });
    }

    const newUser = { username, password };
    users.push(newUser);

    await writeUsersFile(users);
    res.status(201).json({ message: 'Регистрация успешна' });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
});

// Маршрут для входа
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'Логин и пароль обязательны' });
  }

  try {
    const users = await readUsersFile();
    const user = users.find(user => user.username === username && user.password === password);

    if (!user) {
      return res.status(400).json({ message: 'Неверные логин или пароль' });
    }

    res.status(200).json({ message: 'Вход успешен', user });
  } catch (err) {
    res.status(500).json({ message: 'Ошибка на сервере' });
  }
});

// Маршрут для выхода
app.post('/api/logout', (req, res) => {
  res.status(200).json({ message: 'Выход успешен' });
});

// Пример данных мероприятий
let events = [
  {
    id: 1,
    title: "Футбик во дворе",
    description: "Только профессионалы",
    location: [59.9342802, 30.3350986],
    time: "28 Сентября, 16:00",
    tags: ["Футбол"]
  },
  {
    id: 2,
    title: "Пробежка по набережной",
    description: "2 часа",
    location: [59.909090, 30.364704],
    time: "25 Сентября, 12:00",
    tags: ["Бег"]
  }
];

// Получение всех мероприятий
app.get('/api/events', (req, res) => {
  res.json(events);
});

// Получение одного мероприятия по id
app.get('/api/events/:id', (req, res) => {
  const event = events.find(e => e.id === parseInt(req.params.id));
  if (!event) return res.status(404).send('Мероприятие не найдено');
  res.json(event);
});

// Добавление нового мероприятия
app.post('/api/events', (req, res) => {
  const newEvent = {
    id: events.length + 1,
    title: req.body.title,
    description: req.body.description,
    location: req.body.location,
    time: req.body.time,
    tags: req.body.tags
  };
  events.push(newEvent);
  res.status(201).json(newEvent);
});

// Обновление мероприятия по id
app.put('/api/events/:id', (req, res) => {
  const event = events.find(e => e.id === parseInt(req.params.id));
  if (!event) return res.status(404).send('Мероприятие не найдено');

  event.title = req.body.title;
  event.description = req.body.description;
  event.location = req.body.location;
  event.tags = req.body.tags;
  event.time = req.body.time;
  res.json(event);
});

// Удаление мероприятия
app.delete('/api/events/:id', (req, res) => {
  const eventIndex = events.findIndex(e => e.id === parseInt(req.params.id));
  if (eventIndex === -1) return res.status(404).send('Мероприятие не найдено');

  const deletedEvent = events.splice(eventIndex, 1);
  res.json(deletedEvent);
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
