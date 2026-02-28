export default class TaskTracker {
    constructor(container) {
        this.container = container;
        // Массив в памяти, где хранятся все задачи
        this.tasks = [];

        // Находим элементы DOM
        this.form = this.container.querySelector('#task-form');
        this.input = this.container.querySelector('#task-input');
        this.errorMsg = this.container.querySelector('#error-message');
        this.pinnedList = this.container.querySelector('#pinned-tasks');
        this.allList = this.container.querySelector('#all-tasks');

        this.init();
    }

    init() {
        // 1. Обработка отправки формы (нажатие Enter)
        this.form.addEventListener('submit', (e) => {
            e.preventDefault(); // Чтобы страница не перезагружалась
            this.addTask(this.input.value);
        });

        // 2. Обработка ввода текста
        this.input.addEventListener('input', () => {
            this.errorMsg.classList.add('hidden'); // Прячем ошибку, если начали печатать
            this.render(); // Перерисовываем список
        });

        // Первичная отрисовка
        this.render();
    }

    addTask(name) {
        const taskName = name.trim();

        // Проверка на пустое поле 
        if (!taskName) {
            this.errorMsg.classList.remove('hidden');
            return;
        }

        // Добавляем новую задачу в наш массив
        this.tasks.push({
            id: Date.now().toString(), // Уникальный ID
            name: taskName,
            pinned: false // По умолчанию не закреплена
        });

        this.input.value = ''; // Очищаем поле
        this.render(); // Перерисовываем списки
    }

    togglePin(id) {
        // Ищем задачу по ID и меняем её статус
        const task = this.tasks.find(t => t.id === id);
        if (task) {
            task.pinned = !task.pinned;
            this.render(); // Перерисовываем списки после изменения
        }
    }

    render() {
        const filterText = this.input.value.trim().toLowerCase();

        // Разбиваем задачи на две группы
        const pinnedTasks = this.tasks.filter(t => t.pinned);
        // Не закрепленные + фильтруем по тексту ввода (если он есть)
        const allTasks = this.tasks.filter(t => !t.pinned && t.name.toLowerCase().startsWith(filterText));

        // Отрисовываем Pinned
        this.pinnedList.innerHTML = '';
        if (pinnedTasks.length === 0) {
            this.pinnedList.innerHTML = '<li class="empty-message">No pinned tasks</li>';
        } else {
            pinnedTasks.forEach(task => this.pinnedList.appendChild(this.createTaskElement(task)));
        }

        // Отрисовываем All Tasks
        this.allList.innerHTML = '';
        if (allTasks.length === 0) {
            this.allList.innerHTML = '<li class="empty-message">No tasks found</li>';
        } else {
            allTasks.forEach(task => this.allList.appendChild(this.createTaskElement(task)));
        }
    }

    // Создает кусочек HTML для одной задачи
    createTaskElement(task) {
        const li = document.createElement('li');
        li.className = 'task-item';

        const span = document.createElement('span');
        span.textContent = task.name;

        // Кнопка-кружочек для пина
        const btn = document.createElement('button');
        btn.className = `pin-btn ${task.pinned ? 'pinned' : ''}`;
        btn.textContent = task.pinned ? '📍' : '📌';

        // При клике на кнопку вызываем togglePin
        btn.addEventListener('click', () => this.togglePin(task.id));

        li.appendChild(span);
        li.appendChild(btn);

        return li;
    }
}