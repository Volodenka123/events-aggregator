import React, { useState } from 'react';

const LoginForm = ({ onLogin, onRegister, onLogout, loggedInUser, onClose }) => {
  const [loginMode, setLoginMode] = useState(true);  // Режим: вход или регистрация
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    const user = { username, password };
  
    if (!username || !password) {
      alert("Логин и пароль обязательны!"); // Добавляем предупреждение
      return;
    }
  
    if (loginMode) {
      const response = await fetch('/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
  
      if (response.ok) {
        const data = await response.json();
        onLogin(data.user); // Передаем пользователя при успешном входе
      } else {
        const errorData = await response.json();
        alert(errorData.message); // Показываем ошибку
      }
    } else {
      const response = await fetch('/api/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(user),
      });
  
      if (response.ok) {
        const data = await response.json();
        onRegister(data.user); // Передаем нового пользователя
      } else {
        const errorData = await response.json();
        alert(errorData.message); // Показываем ошибку
      }
    }
  };
  

  return (
    <div className="login-form">
      <button className="close-form-logout" onClick={onClose}>✖</button>
      {!loggedInUser ? (
        <form onSubmit={handleSubmit}>
          <input 
            type="text"
            placeholder="Логин"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <input 
            type="password"
            placeholder="Пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="submit">
            {loginMode ? 'Войти' : 'Зарегистрироваться'}
          </button>
          <button type="button" onClick={() => setLoginMode(!loginMode)}>
            {loginMode ? 'Перейти к регистрации' : 'Перейти ко входу'}
          </button>
        </form>
      ) : (
        <button onClick={onLogout}>Выйти</button>
      )}
    </div>
  );
};

export default LoginForm;
