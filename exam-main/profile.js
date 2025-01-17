// Функция для форматирования даты
function formatDate(dateString, includeMinutes = true) {
    const date = new Date(dateString);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return includeMinutes ? `${day}.${month}.${year} ${hours}:${minutes}` : `${day}.${month}.${year}`;
}

// Функция загрузки товаров
async function loadGoods() {
    const apiUrl = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/goods?api_key=616eba57-735e-4f1c-965a-e7a42353c2fd';
    try {
        const response = await fetch(apiUrl);
        const goods = await response.json();
        return goods.reduce((acc, item) => {
            acc[item.id] = { name: item.name, price: item.discount_price || item.actual_price };
            return acc;
        }, {});
    } catch (error) {
        console.error('Ошибка при загрузке товаров:', error);
        return {};
    }
}

// Функция расчета стоимости доставки
function calculateDeliveryCost(deliveryDate, deliveryTime) {
    const baseDeliveryCost = 200;
    const date = new Date(deliveryDate);
    const isWeekend = date.getDay() === 0 || date.getDay() === 6;
    const isEvening = deliveryTime && deliveryTime.startsWith('18') || deliveryTime.startsWith('19') || deliveryTime.startsWith('20') || deliveryTime.startsWith('21') || deliveryTime.startsWith('22') || deliveryTime.startsWith('23');

    if (isWeekend) {
        return baseDeliveryCost + 300;
    } else if (isEvening) {
        return baseDeliveryCost + 200;
    }
    return baseDeliveryCost;
}
function openEditModal(order) {
    const editModal = document.getElementById('edit-order-modal');
    const editForm = document.getElementById('edit-order-form');

    editForm.full_name.value = order.full_name || '';
    editForm.phone.value = order.phone || '';
    editForm.email.value = order.email || '';
    editForm.delivery_address.value = order.delivery_address || '';
    editForm.delivery_date.value = order.delivery_date || '';
    editForm.delivery_interval.value = order.delivery_interval || '';
    editForm.comment.value = order.comment || '';

    editModal.style.display = 'block';

    editForm.onsubmit = async function (event) {
        event.preventDefault();

        const updatedOrder = {
            full_name: editForm.full_name.value,
            phone: editForm.phone.value,
            email: editForm.email.value,
            delivery_address: editForm.delivery_address.value,
            delivery_date: editForm.delivery_date.value,
            delivery_interval: editForm.delivery_interval.value,
            comment: editForm.comment.value
        };

        try {
            const apiUrl = `https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${order.id}?api_key=616eba57-735e-4f1c-965a-e7a42353c2fd`;
            const response = await fetch(apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(updatedOrder)
            });

            if (!response.ok) {
                throw new Error('Ошибка при обновлении заказа');
            }

            console.log('Заказ обновлен:', await response.json());
            editModal.style.display = 'none';
            loadOrders();
        } catch (error) {
            console.error('Ошибка при обновлении заказа:', error);
            alert('Не удалось обновить заказ. Попробуйте снова.');
        }
    };
}

// Функция открытия модального окна подтверждения удаления
function openDeleteModal(orderId) {
    const deleteModal = document.getElementById('delete-confirm-modal');
    deleteModal.style.display = 'block';

    // Обработчик для кнопки "Да"
    document.getElementById('confirm-delete-btn').onclick = async function () {
        await deleteOrder(orderId);
        deleteModal.style.display = 'none';
        loadOrders();
    };

    // Обработчик для кнопки "Отмена"
    document.getElementById('cancel-delete-btn').onclick = function () {
        deleteModal.style.display = 'none';
    };
}
document.addEventListener('DOMContentLoaded', () => {
    loadOrders();

    // Добавление обработчиков событий для закрытия всех модальных окон
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', closeModal);
    });
    document.getElementById('edit-order-modal').style.display = 'none';

});

// Функция удаления заказа
async function deleteOrder(orderId) {
    const apiUrl = `https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders/${orderId}?api_key=616eba57-735e-4f1c-965a-e7a42353c2fd`;
    try {
        const response = await fetch(apiUrl, { method: 'DELETE' });

        if (!response.ok) {
            throw new Error('Ошибка при удалении заказа');
        }

        console.log(`Заказ ${orderId} удален`);
    } catch (error) {
        console.error('Ошибка при удалении заказа:', error);
    }
}
// Функция для закрытия модального окна
function closeModal() {
    document.getElementById('order-details-modal').style.display = 'none';
    document.getElementById('edit-order-modal').style.display = 'none';
}

// Добавляем обработчик клика на кнопку закрытия
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.close-button').forEach(button => {
        button.addEventListener('click', closeModal);
    });
});

// Функция для открытия модального окна с заказом
async function openOrderModal(order) {
    const goodsMap = await loadGoods();
    const modal = document.getElementById('order-details-modal');
    const modalContent = document.getElementById('order-details');

    const orderItems = order.good_ids ? order.good_ids.map(id => goodsMap[id]?.name || `ID:${id}`).join(', ') : 'Не указан';
    const orderTotal = order.good_ids ? order.good_ids.reduce((sum, id) => sum + (goodsMap[id]?.price || 0), 0) : 0;
    const deliveryCost = calculateDeliveryCost(order.delivery_date, order.delivery_interval);
    const finalTotalPrice = orderTotal + deliveryCost;

    modalContent.innerHTML = `
        <p><strong>Дата оформления:</strong> ${formatDate(order.created_at)}</p>
        <p><strong>Имя:</strong> ${order.full_name || 'Не указано'}</p>
        <p><strong>Телефон:</strong> ${order.phone || 'Не указан'}</p>
        <p><strong>Email:</strong> ${order.email || 'Не указан'}</p>
        <p><strong>Адрес доставки:</strong> ${order.delivery_address || 'Не указан'}</p>
        <p><strong>Дата доставки:</strong> ${formatDate(order.delivery_date, false)}</p>
        <p><strong>Время доставки:</strong> ${order.delivery_interval || 'Не указано'}</p>
        <p><strong>Состав заказа:</strong> ${orderItems}</p>
        <p><strong>Стоимость товаров:</strong> ${orderTotal} ₽</p>
        <p><strong>Стоимость доставки:</strong> ${deliveryCost} ₽</p>
        <p><strong>Итоговая стоимость:</strong> ${finalTotalPrice} ₽</p>
        <p><strong>Комментарий:</strong> ${order.comment || 'Нет комментария'}</p>
    `;

    modal.style.display = 'block';
}



// Функция загрузки и отображения заказов
async function loadOrders() {
    const apiUrl = 'https://edu.std-900.ist.mospolytech.ru/exam-2024-1/api/orders?api_key=616eba57-735e-4f1c-965a-e7a42353c2fd';
    try {
        const [ordersResponse, goodsMap] = await Promise.all([fetch(apiUrl), loadGoods()]);
        const orders = await ordersResponse.json();
        const ordersTable = document.getElementById('orders-tbody');

        if (!ordersTable) {
            console.error('Таблица для отображения заказов не найдена');
            return;
        }
        ordersTable.innerHTML = '';

        orders.forEach((order, index) => {
            const row = document.createElement('tr');

            const orderNumber = document.createElement('td');
            orderNumber.textContent = index + 1;

            const orderDate = document.createElement('td');
            orderDate.textContent = order.created_at ? formatDate(order.created_at) : 'Дата не указана';

            const orderItems = document.createElement('td');
            const itemNames = order.good_ids ? order.good_ids.map(id => goodsMap[id]?.name || `ID:${id}`).slice(0, 2).join(', ') : '';
            orderItems.textContent = itemNames + (order.good_ids && order.good_ids.length > 2 ? '...' : '');
            orderItems.title = order.good_ids ? order.good_ids.map(id => goodsMap[id]?.name || `ID:${id}`).join(', ') : '';

            const orderTotal = document.createElement('td');
            const totalPrice = order.good_ids ? order.good_ids.reduce((sum, id) => sum + (goodsMap[id]?.price || 0), 0) : 0;
            const deliveryCost = calculateDeliveryCost(order.delivery_date, order.delivery_interval);
            const finalTotalPrice = totalPrice + deliveryCost;
            orderTotal.textContent = finalTotalPrice || 'Не указана';

            const orderDateDelivery = document.createElement('td');
            orderDateDelivery.textContent = order.delivery_date ? `${formatDate(order.delivery_date, false)} ${order.delivery_interval || ''}` : 'Не указана';

            const actionsCell = document.createElement('td');
            actionsCell.innerHTML = `
                <span style="cursor: pointer;" class="view-order">👁️</span> 
                <span style="cursor: pointer;" class="edit-order">✏️</span> 
                <span style="cursor: pointer;" class="delete-order">🗑️</span>
            `;

            actionsCell.querySelector('.view-order').addEventListener('click', () => openOrderModal(order));
            actionsCell.querySelector('.edit-order').addEventListener('click', () => openEditModal(order));
            actionsCell.querySelector('.delete-order').addEventListener('click', () => openDeleteModal(order.id));
            row.appendChild(orderNumber);
            row.appendChild(orderDate);
            row.appendChild(orderItems);
            row.appendChild(orderTotal);
            row.appendChild(orderDateDelivery);
            row.appendChild(actionsCell);

            ordersTable.appendChild(row);
        });
    } catch (error) {
        console.error('Ошибка при загрузке заказов:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadOrders);
