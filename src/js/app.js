// const wsUrl = 'ws://localhost:3000';
const wsUrl = 'wss://ahj-chat-backend-v51c.onrender.com/ws';
let ws;
let currentUser = null;


// Элементы DOM
const loginModal = document.getElementById('login-modal');
const loginForm = document.getElementById('login-form');
const nicknameInput = document.getElementById('nickname-input');
const loginError = document.getElementById('login-error');

const chatContainer = document.getElementById('chat-container');
const userList = document.getElementById('user-list');
const messagesContainer = document.getElementById('messages-container');
const messageForm = document.getElementById('message-form');
const messageInput = document.getElementById('message-input');

// Простая функция генерации ID 
function generateId() {
    return Math.random().toString(36).substring(2, 9) + Date.now().toString(36);
}

function connect() {
    ws = new WebSocket(wsUrl);

    // Слушаем сообщения от сервера
    ws.addEventListener('message', (e) => {
        const data = JSON.parse(e.data);

        // Сервер сказал, что ник занят
        if (data.type === 'error') {
            loginError.textContent = data.message;
            loginError.classList.remove('hidden');
        }

        // Сервер одобрил логин
        if (data.type === 'login_success') {
            currentUser = data.user;
            loginModal.classList.add('hidden'); // Прячем модалку
            chatContainer.classList.remove('hidden'); // Показываем чат
        }

        // Сервер прислал обновленный список юзеров онлайн
        if (data.type === 'users') {
            renderUsers(data.users);
        }

        // Сервер прислал новое сообщение в чат
        if (data.type === 'send') {
            renderMessage(data);
        }
    });

    ws.addEventListener('close', () => {
        console.log('Соединение с сервером потеряно');
    });
}

// 1. Отправка формы ЛОГИНА
loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const nickname = nicknameInput.value.trim();
    if (!nickname) return;

    // Если соединение закрыто или оборвалось, пробуем переподключиться
    if (!ws || ws.readyState === WebSocket.CLOSED) {
        loginError.textContent = 'Соединение потеряно. Переподключаемся... Нажмите еще раз через пару секунд 🔄';
        loginError.classList.remove('hidden');
        connect();
        return;
    }

    // Если подключение в процессе установки (сервер просыпается)
    if (ws.readyState === WebSocket.CONNECTING) {
        loginError.textContent = 'Подключение к серверу... Подождите пару секунд и попробуйте снова ⏳';
        loginError.classList.remove('hidden');
        return;
    }

    loginError.classList.add('hidden');

    const loginMsg = {
        type: 'login',
        name: nickname,
        user: { id: generateId() } // Генерируем себе уникальный ID
    };

    ws.send(JSON.stringify(loginMsg));
});

// 2. Отправка СООБЩЕНИЯ в чат
messageForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = messageInput.value.trim();
    if (!text) return;

    const msg = {
        type: 'send',
        message: text,
        user: currentUser
    };

    ws.send(JSON.stringify(msg));
    messageInput.value = ''; // Очищаем поле ввода
});

// Отрисовка пользователей слева
function renderUsers(users) {
    userList.innerHTML = '';
    users.forEach(u => {
        const li = document.createElement('li');

        const avatar = document.createElement('div');
        avatar.className = 'user-avatar';
        avatar.textContent = u.name.charAt(0).toUpperCase(); // Первая буква имени в кружке

        const nameSpan = document.createElement('span');
        nameSpan.textContent = u.name;

        // Если это мы — добавляем приписку (You)
        if (currentUser && u.id === currentUser.id) {
            nameSpan.textContent += ' (You)';
            nameSpan.className = 'user-me';
        }

        li.append(avatar, nameSpan);
        userList.append(li);
    });
}

// Отрисовка сообщения в чате
function renderMessage(data) {
    const isMe = currentUser && data.user.id === currentUser.id;

    const msgDiv = document.createElement('div');
    // В зависимости от авторства применяем разные CSS классы (вправо или влево)
    msgDiv.className = `message ${isMe ? 'msg-me' : 'msg-other'}`;

    const infoDiv = document.createElement('div');
    infoDiv.className = 'message-info';

    // Формируем красивую дату и время
    const now = new Date();
    const timeString = `${now.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })} ${now.toLocaleDateString('ru-RU')}`;

    // Если сообщение мое, пишем You вместо ника
    infoDiv.textContent = isMe ? `You, ${timeString}` : `${data.user.name}, ${timeString}`;

    const textDiv = document.createElement('div');
    textDiv.className = 'message-text';
    textDiv.textContent = data.message;

    msgDiv.append(infoDiv, textDiv);
    messagesContainer.append(msgDiv);

    // Авто-скролл вниз при новом сообщении
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// Запускаем подключение при загрузке скрипта
connect();
