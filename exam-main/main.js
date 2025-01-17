async function loadDishes() {
    try {
        const response = await fetch(
            'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=616eba57-735e-4f1c-965a-e7a42353c2fd'
        );
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.statusText}`);
        }
        const menu = await response.json();
        menu.sort((a, b) => a.name.localeCompare(b.name, 'ru'));
        console.log(menu);
        return menu;
    } catch (error) {
        console.error('Ошибка при загрузке блюд:', error);
        alert('Не удалось загрузить меню. Попробуйте обновить страницу.');
        return [];
    }
}

window.loadDishes = loadDishes;

const searchInput = document.getElementById("searchInput");
const suggestionsBox = document.getElementById("suggestionsBox");
const searchBtn = document.getElementById("searchBtn");
const productGrid = document.getElementById("productGrid");
const sortSelect = document.getElementById("sortSelect");
const loadMoreBtn = document.getElementById("loadMoreBtn");

let products = [];
let filteredProducts = [];
let displayedProducts = 8;
const productsPerPage = 8;

async function fetchSuggestions(query) {
    try {
        const response = await fetch(
            `https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/autocomplete?query=${query}&api_key=616eba57-735e-4f1c-965a-e7a42353c2fd`
        );

        if (!response.ok) throw new Error("Ошибка загрузки подсказок");

        const data = await response.json();

        // Проверяем, является ли data массивом
        if (!Array.isArray(data)) {
            console.error("Неверный формат данных для подсказок:", data);
            return [];
        }

        return data;
    } catch (error) {
        console.error("Ошибка получения автодополнений:", error);
        return [];
    }
}

function showSuggestions(suggestions, query) {
    suggestionsBox.innerHTML = "";

    // Проверка, является ли suggestions массивом
    if (!Array.isArray(suggestions) || suggestions.length === 0) {
        suggestionsBox.style.display = "none";
        return;
    }

    suggestions.forEach((suggestion) => {
        const item = document.createElement("div");
        item.className = "suggestion-item";
        item.textContent = suggestion;
        item.addEventListener("click", () => {
            const words = searchInput.value.split(" ");
            words[words.length - 1] = suggestion;
            searchInput.value = words.join(" ") + " ";
            suggestionsBox.style.display = "none";
        });
        suggestionsBox.appendChild(item);
    });

    suggestionsBox.style.display = "block";
}


// Обработчик ввода в строку поиска (ТОЛЬКО ДЛЯ ПОДСКАЗОК)
searchInput.addEventListener("input", async () => {
    const query = searchInput.value.toLowerCase().trim();
    if (!query) {
        suggestionsBox.style.display = "none";
        return;
    }

    const suggestions = await fetchSuggestions(query);
    showSuggestions(suggestions, query);
});

document.addEventListener("click", (event) => {
    if (!suggestionsBox.contains(event.target) && event.target !== searchInput) {
        suggestionsBox.style.display = "none";
    }
});

async function searchProducts() {
    const query = searchInput.value.toLowerCase().trim();
    try {
        const response = await fetch(
            `https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?query=${query}&api_key=616eba57-735e-4f1c-965a-e7a42353c2fd`
        );
        if (!response.ok) throw new Error("Ошибка поиска товаров");

        filteredProducts = await response.json();
        productGrid.innerHTML = "";
        displayedProducts = 0;
        renderProducts();
    } catch (error) {
        console.error("Ошибка поиска товаров:", error);
    }
}

searchBtn.addEventListener("click", searchProducts);
sortSelect.addEventListener("change", () => {
    sortProducts();
    productGrid.innerHTML = "";
    displayedProducts = 0;
    renderProducts();
});

function sortProducts() {
    const sortValue = sortSelect.value;
    if (sortValue === "price-asc") {
        filteredProducts.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortValue === "price-desc") {
        filteredProducts.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortValue === "rating") {
        filteredProducts.sort((a, b) => b.rating - a.rating);
    }
}



loadMoreBtn.addEventListener("click", renderProducts);

async function fetchProducts() {
    try {
        const response = await fetch(
            'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=616eba57-735e-4f1c-965a-e7a42353c2fd'
        );
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.statusText}`);
        }

        const data = await response.json();
        return data.map((item) => ({
            id: item.id,
            name: item.name,
            image: item.image_url,
            rating: item.rating,
            price: item.actual_price,
            discountPrice: item.discount_price || null,
            mainCategory: item.main_category,
            subCategory: item.sub_category,
        }));
    } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
        alert('Не удалось загрузить товары. Попробуйте позже.');
        return [];
    }
}

function renderProducts() {
    const fragment = document.createDocumentFragment();

    const toRender = filteredProducts.slice(displayedProducts, displayedProducts + productsPerPage);
    toRender.forEach((product) => {
        const card = document.createElement("div");
        card.className = "product-card";

        const discountPercent = product.discountPrice !== null
            ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
            : 0;

        const priceHTML = product.discountPrice !== null
            ? `
                <span class="price"><s>${product.price.toFixed(2)}₽</s></span>
                <span class="price-discounted" style="color: red;">${product.discountPrice.toFixed(2)}₽</span>
                <span class="discount-percent" style="color: red;">(-${discountPercent}%)</span>
              `
            : `<span class="price">${product.price.toFixed(2)}₽</span>`;

        card.innerHTML = `
            <img src="${product.image}" alt="${product.name}">
            <h3>${product.name}</h3>
            <div class="rating">⭐️ ${product.rating}</div>
            <div>${priceHTML}</div>
            <button data-id="${product.id}">Добавить в корзину</button>
        `;
        fragment.appendChild(card);
    });

    productGrid.appendChild(fragment);
    displayedProducts += toRender.length;

    if (displayedProducts >= filteredProducts.length) {
        loadMoreBtn.style.display = "none";
    } else {
        loadMoreBtn.style.display = "block";
    }
}

function searchProducts() {
    const query = searchInput.value.toLowerCase().trim();
    filteredProducts = products.filter(product =>
        product.name.toLowerCase().includes(query)
    );

    showSuggestions(query);

    productGrid.innerHTML = "";
    displayedProducts = 0;
    renderProducts();
}



function sortProducts() {
    const sortValue = sortSelect.value;

    if (sortValue === "price-asc") {
        filteredProducts.sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
    } else if (sortValue === "price-desc") {
        filteredProducts.sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
    } else if (sortValue === "rating") {
        filteredProducts.sort((a, b) => b.rating - a.rating);
    }

    productGrid.innerHTML = "";
    displayedProducts = 0;
    renderProducts();
}

document.addEventListener('click', (event) => {
    if (event.target.tagName === 'BUTTON' && event.target.textContent.includes('Добавить в корзину')) {
        const productId = parseInt(event.target.dataset.id, 10);
        const product = products.find((p) => p.id === productId);

        if (!product) {
            console.error("Продукт не найден:", productId);
            return;
        }

        // Получаем текущую корзину
        const cart = JSON.parse(localStorage.getItem('cart')) || [];

        // Проверяем, есть ли уже товар в корзине
        if (cart.includes(productId)) {
            return;
        }

        if (!cart.includes(productId)) {
            cart.push(productId);
            localStorage.setItem('cart', JSON.stringify(cart));
            showNotification('Товар успешно добавлен в корзину!');
        }

        // Сохраняем обновлённую корзину
        localStorage.setItem('cart', JSON.stringify(cart));

    }
});

function showNotification(message) {
    const notificationContainer = document.getElementById('notifications');
    
    // Создаем новый элемент для уведомления
    const notification = document.createElement('div');
    notification.className = 'notification';
    
    // Вставляем сообщение и кнопку закрытия
    notification.innerHTML = `
        <span>${message}</span>
        <button class="close-btn">✖️</button>
    `;

    // Добавляем уведомление в контейнер
    notificationContainer.appendChild(notification);
    notificationContainer.style.display = 'block';

    // Находим кнопку закрытия внутри уведомления и добавляем обработчик события
    const closeButton = notification.querySelector('.close-btn');
    closeButton.addEventListener('click', () => {
        notification.remove();
        if (notificationContainer.childElementCount === 0) {
            notificationContainer.style.display = 'none';
        }
    });
}





async function initCatalog() {
    products = await fetchProducts();
    filteredProducts = [...products];
    renderProducts();
}

loadMoreBtn.addEventListener("click", renderProducts);
sortSelect.addEventListener("change", sortProducts);
searchInput.addEventListener("input", searchProducts);

initCatalog();


