export default class ImageGallery {
    constructor(container) {
        this.container = container;
        this.form = this.container.querySelector('#image-form');
        this.nameInput = this.container.querySelector('#img-name');
        this.urlInput = this.container.querySelector('#img-url');
        this.errorMsg = this.container.querySelector('#url-error');
        this.gallery = this.container.querySelector('#gallery-container');

        this.init();
    }

    init() {
        // Событие submit обрабатывает и клик по кнопке, и нажатие Enter
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.checkAndAddImage();
        });

        // Прячем ошибку, если пользователь начал вводить новую ссылку
        this.urlInput.addEventListener('input', () => {
            this.errorMsg.classList.add('hidden');
        });
    }

    checkAndAddImage() {
        const name = this.nameInput.value.trim();
        const url = this.urlInput.value.trim();

        if (!name || !url) return;

        // Создаем невидимую картинку в памяти браузера для проверки
        const img = new Image();

        // Если картинка успешно загрузилась
        img.onload = () => {
            this.errorMsg.classList.add('hidden'); // Прячем ошибку на всякий случай
            this.renderImage(name, url);           // Рисуем картинку на экране

            // Очищаем поля формы только после успешной загрузки
            this.nameInput.value = '';
            this.urlInput.value = '';
        };

        // Если сервер вернул 404 или по ссылке нет картинки
        img.onerror = () => {
            this.errorMsg.classList.remove('hidden'); // Показываем нашу красную ошибку
        };

        // начинаем загрузку только ПОСЛЕ того, как назначили onload и onerror
        img.src = url;
    }

    renderImage(name, url) {
        // Создаем карточку
        const item = document.createElement('div');
        item.className = 'gallery-item';

        // Создаем картинку
        const imgEl = document.createElement('img');
        imgEl.src = url;
        imgEl.alt = name;

        // Создаем кнопку удаления
        const deleteBtn = document.createElement('button');
        deleteBtn.className = 'delete-btn';
        deleteBtn.textContent = '✖';
        deleteBtn.addEventListener('click', () => {
            item.remove();
        });

        item.appendChild(imgEl);
        item.appendChild(deleteBtn);

        this.gallery.appendChild(item);
    }
}