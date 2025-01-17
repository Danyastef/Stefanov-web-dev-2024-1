async function loadDishes() {
    try {
        const response = await fetch(
            'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=616eba57-735e-4f1c-965a-e7a42353c2fd'
        );
        if (!response.ok) {
            throw new Error(`Ошибка загрузки: ${response.statusText}`);
        }

        const data = await response.json();
        console.log(data);

        const goods = data.map((item) => {
            const discount = item.actual_price && item.discount_price
                ? Math.round(((item.actual_price - item.discount_price) / item.actual_price) * 100)
                : null;

            return {
                id: item.id,
                name: item.name,
                image: item.image_url,
                rating: item.rating,
                price: item.actual_price,
                discountPrice: item.discount_price || null,
                discount: discount,
                mainCategory: item.main_category,
                subCategory: item.sub_category,
            };
        });

        // Сохраняем товары в localStorage
        localStorage.setItem('goods', JSON.stringify(goods));
        return goods;
    } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
        alert('Не удалось загрузить товары. Попробуйте позже.');
        return [];
    }
}


async function loadCart() {
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const goods = JSON.parse(localStorage.getItem('goods')) || await loadDishes();
    const cartItemsContainer = document.querySelector('.cart-items');
    const totalCostElement = document.querySelector('.form-total span');
    const deliveryCostElement = document.querySelector('.delivery-cost span');
    const finalCostElement = document.querySelector('.form-total span');
    const cartTitleElement = document.querySelector('.cart-title');

    // Очищаем контейнер перед перерисовкой
    cartItemsContainer.innerHTML = '';

    // Если корзина пуста, показываем сообщение
    if (cart.length === 0) {
        if (cartTitleElement) {
            cartTitleElement.textContent = 'Корзина пустая, добавьте товары';
        }
        totalCostElement.textContent = '0₽';
        deliveryCostElement.textContent = '0₽';
        finalCostElement.textContent = '0₽';
        return;
    }

    // Если корзина не пустая
    if (cartTitleElement) {
        cartTitleElement.textContent = 'Корзина';
    }

    let totalCost = 0;

    // Добавляем товары в корзину
    for (const id of cart) {
        const item = goods.find((good) => good.id === id);
        if (item) {
            const itemElement = document.createElement('div');
            itemElement.className = 'cart-item';
            itemElement.setAttribute('good-id', id);
            itemElement.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <div>
                    <h3>${item.name}</h3>
                    ${
                        item.discountPrice
                            ? `<p class="price">
                                   <span class="price-original">${item.price.toFixed(2)}₽</span> 
                                   <span class="price-discount">${item.discountPrice.toFixed(2)}₽</span>
                                   <span class="discount-percent">-${item.discount}%</span>
                               </p>`
                            : `<p class="price">${item.price.toFixed(2)}₽</p>`
                    }
                    <button class="remove-btn" data-id="${item.id}">Удалить</button>
                </div>
            `;
            cartItemsContainer.appendChild(itemElement);
            totalCost += item.discountPrice || item.price;
        }
    }

    // Расчёт стоимости доставки
    const deliveryDate = document.querySelector('#delivery-date')?.value || null;
    const deliveryTime = document.querySelector('#delivery-time')?.value || null;
    const deliveryCost = calculateDeliveryCost(deliveryDate, deliveryTime);

    // Обновление интерфейса
    totalCostElement.textContent = `${totalCost.toFixed(2)}₽`;
    deliveryCostElement.textContent = `${deliveryCost}₽`;
    finalCostElement.textContent = `${(totalCost + deliveryCost).toFixed(2)}₽`;
}





// Функция для расчёта стоимости доставки

function calculateDeliveryCost(deliveryDate, deliveryTime) {
    const baseCost = 200;

    if (!deliveryDate || !deliveryTime) {
        return baseCost;
    }

    const date = new Date(deliveryDate);
    const dayOfWeek = date.getDay(); // 0 - воскресенье, 6 - суббота
    const eveningHours = deliveryTime >= "18:00";

    let extraCost = 0;
    if (dayOfWeek === 0 || dayOfWeek === 6) {
        extraCost = 300; // Выходные дни
    } else if (eveningHours) {
        extraCost = 200; // Вечерние часы
    }

    return baseCost + extraCost;
}










// Удаление товара из корзины
// Удаление товара из корзины
document.addEventListener('click', (event) => {
    if (event.target.classList.contains('remove-btn')) {
        const productId = parseInt(event.target.dataset.id, 10); // Получаем ID товара
        let cart = JSON.parse(localStorage.getItem('cart')) || []; // Загружаем корзину из localStorage
        
        // Фильтруем корзину, убирая выбранный товар
        cart = cart.filter((id) => id !== productId);
        
        // Сохраняем обновлённую корзину в localStorage
        localStorage.setItem('cart', JSON.stringify(cart));
        
        // Перезагружаем корзину для обновления интерфейса
        loadCart();
    }
});



// Обновление при изменении даты/времени доставки
document.addEventListener('input', (event) => {
    if (event.target.id === 'delivery-date' || event.target.id === 'delivery-time') {
        loadCart();
    }
});


document.querySelector('#orderForm').addEventListener('submit', async (event) => {
    event.preventDefault(); // Предотвращаем стандартное поведение формы

    // Получение данных из формы
    const formData = new FormData(event.target);
    const cart = JSON.parse(localStorage.getItem('cart')) || [];
    const goods = JSON.parse(localStorage.getItem('goods')) || [];

    // Формирование массива идентификаторов товаров
    const goodIds = cart.map((id) => {
        const good = goods.find((item) => item.id === id);
        return good ? good.id : null;
    }).filter(Boolean);

    // Проверка на пустую корзину
    if (goodIds.length === 0) {
        alert('Корзина пуста. Добавьте товары для оформления заказа.');
        return;
    }

    // Преобразование даты в формат "dd.mm.yyyy"
    const formatDate = (dateString) => {
        if (!dateString) return null;
        const [year, month, day] = dateString.split('-');
        return `${day}.${month}.${year}`;
    };

    // Сбор данных в нужном формате
    const payload = {
        comment: formData.get('comment') || '', // Комментарий (опционально)
        delivery_address: formData.get('address'), // Адрес доставки
        delivery_date: formatDate(formData.get('delivery-date')), // Дата доставки
        delivery_interval: formData.get('delivery-time'), // Временной интервал доставки
        email: formData.get('email'), // Email пользователя
        full_name: formData.get('name'), // Имя пользователя
        good_ids: goodIds, // Массив идентификаторов товаров
        phone: formData.get('phone'), // Телефон пользователя
        subscribe: formData.get('subscribe') === 'on', // Подписка (boolean)
    };

    console.log('Отправляемые данные:', payload);

    // Проверка временного интервала
    const validIntervals = ["08:00-12:00", "12:00-14:00", "14:00-18:00", "18:00-22:00"];
    if (!validIntervals.includes(payload.delivery_interval)) {
        alert('Недопустимое значение временного интервала доставки.');
        return;
    }

    try {
        const response = await fetch(
            'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders?api_key=616eba57-735e-4f1c-965a-e7a42353c2fd',
            {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(payload),
            }
        );

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Ошибка: ${response.statusText}, Details: ${errorText}`);
        }

        const result = await response.json();
        console.log('Ответ сервера:', result);

        // Очистка корзины и уведомление пользователя
        localStorage.removeItem('cart');
        alert('Заказ успешно оформлен!');
        loadCart();
    } catch (error) {
        console.error('Ошибка при оформлении заказа:', error);
        alert('Не удалось оформить заказ. Проверьте данные или попробуйте позже.');
    }
});



// Загрузка корзины при загрузке страницы
document.addEventListener('DOMContentLoaded', loadCart);