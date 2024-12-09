const dishesData = {
  soups: [
    { keyword: "gaspacho", weight: "350 г", name: "Гаспачо", kind: "veg", img: "images/gazpacho.jpg", price: 195 },
    { keyword: "mushroom_soup", weight: "330 г", name: "Грибной суп-пюре", kind: "veg", img: "images/mushroom_soup.jpg", price: 185 },
    { keyword: "norwegian_soup", weight: "330 г", name: "Норвежский суп", kind: "fish", img: "images/norwegian_soup.jpg", price: 270 },
    { keyword: "tom-yam", weight: "330 г", name: "Том ям с креветками", kind: "fish", img: "images/tom-yam.jpg", price: 350 },
    { keyword: "solyan", weight: "330 г", name: "Солянка с говядиной", kind: "meat", img: "images/solyan.jpg", price: 300 },
    { keyword: "utka", weight: "330 г", name: "Суп с томлёной уткой", kind: "meat", img: "images/utka.jpg", price: 260 },
  ],
  mainDishes: [
    { keyword: "friedpotatoeswithmushrooms1", weight: "250 г", name: "Жареная картошка с грибами", kind: "veg", img: "images/friedpotatoeswithmushrooms1.jpg", price: 150 },
    { keyword: "lasagna", weight: "310 г", name: "Лазанья", kind: "veg", img: "images/lasagna.jpg", price: 385 },
    { keyword: "chickencutletsandmashedpotatoes", weight: "280 г", name: "Котлеты из курицы с картофельным пюре", kind: "meat", img: "images/chickencutletsandmashedpotatoes.jpg", price: 225 },
    { keyword: "tel-z", weight: "400 г", name: "Телятина по-цюрихски", kind: "meat", img: "images/tel-z.jpg", price: 500 },
    { keyword: "losos", weight: "450 г", name: "Стейк из лосося с овощами", kind: "fish", img: "images/losos.jpg", price: 800 },
    { keyword: "midii", weight: "400 г", name: "Мидии в винно-сливочном соусе", kind: "fish", img: "images/midii.jpg", price: 750 },
  ],
  starter: [
    { keyword: "cezar", weight: "280 г", name: "Салат цезарь с курицей", kind: "meat", img: "images/cezar.jpg", price: 230 },
    { keyword: "salat-gov", weight: "310 г", name: "Салат с говядиной и бакалажанами", kind: "meat", img: "images/salat-gov.jpg", price: 295 },
    { keyword: "salat-osmi", weight: "320 г", name: "Тёплый салат с картофелем и осминогом", kind: "fish", img: "images/salat-osmi.jpg", price: 450 },
    { keyword: "karpacho", weight: "200 г", name: "Карпаччо из креветок", kind: "fish", img: "images/karpacho.jpg", price: 380 },
    { keyword: "kaprize", weight: "230 г", name: "Салат капрезе с моцареллой", kind: "veg", img: "images/kaprize.jpg", price: 230 },
    { keyword: "tikva", weight: "210 г", name: "Тыквенный салат", kind: "veg", img: "images/tikva.jpg", price: 250 },
  ],
  drink: [
    { keyword: "orangejuice", weight: "300 мл", name: "Апельсиновый сок", kind: "cold", img: "images/orangejuice.jpg", price: 120 },
    { keyword: "applejuice", weight: "300 мл", name: "Яблочный сок", kind: "cold", img: "images/applejuice.jpg", price: 90 },
    { keyword: "carrotjuice", weight: "300 мл", name: "Морковный сок", kind: "cold", img: "images/carrotjuice.jpg", price: 110 },
    { keyword: "tlatte", weight: "400 мл", name: "Тыквенный латте", kind: "hot", img: "images/tlatte.jpg", price: 250 },
    { keyword: "btea", weight: "400 мл", name: "Черный чай", kind: "hot", img: "images/btea.jpg", price: 180 },
    { keyword: "gtea", weight: "400 мл", name: "Зеленый чай", kind: "hot", img: "images/gtea.jpg", price: 180 },
  ],
  desert: [
    { keyword: "napoleon", weight: "140 г", name: "Торт Наполеон", kind: "small", img: "images/napoleon.jpg", price: 270 },
    { keyword: "medovik", weight: "150 г", name: "Торт Медовик", kind: "small", img: "images/medovik.jpg", price: 290 },
    { keyword: "sirniki", weight: "350 г", name: "Сырники", kind: "mid", img: "images/sirniki.jpg", price: 400 },
    { keyword: "ponchiki", weight: "500 г", name: "Пончики", kind: "big", img: "images/ponchiki.jpg", price: 700 },
    { keyword: "chizkeyk", weight: "120 г", name: "Чизкейк", kind: "small", img: "images/chizkeyk.jpg", price: 260 },
    { keyword: "profit", weight: "280 г", name: "Профитроли", kind: "mid", img: "images/profit.jpg", price: 320 },
  ],
};

// Элементы заказа и скрытые поля формы
const orderElements = {
  soup: { display: document.getElementById("order-soup"), hidden: document.getElementById("hidden-soup") },
  mainDish: { display: document.getElementById("order-mainDish"), hidden: document.getElementById("hidden-mainDish") },
  starter: { display: document.getElementById("order-starter"), hidden: document.getElementById("hidden-starter") },
  drink: { display: document.getElementById("order-drink"), hidden: document.getElementById("hidden-drink") },
  desert: { display: document.getElementById("order-desert"), hidden: document.getElementById("hidden-desert") }
};

const orderSummaryFieldset = document.getElementById("order-summary");
const noSelectionDiv = document.getElementById("no-selection");

let orderPrice = 0; // Переменная для отслеживания общей суммы заказа
const orderPriceElement = document.getElementById("order-price"); // Элемент для отображения общей суммы

// Функция обновления заказа
function updateOrder(category, dishCard) {
  const { display, hidden } = orderElements[category];

  // Убираем выделение со всех карточек в данной категории
  document.querySelectorAll(`.${category}-section .dish-card`).forEach((card) => {
    card.classList.remove("selected-dish");
  });

  // Добавляем выделение выбранной карточке
  dishCard.classList.add("selected-dish");

  // Обновляем текст в заказе клиента
  const dishName = dishCard.querySelector(".name").textContent;
  display.textContent = dishName;

  // Обновляем скрытое поле формы
  hidden.value = dishName;

  // Получаем цену из атрибута data-price карточки
  const dishPrice = parseFloat(dishCard.dataset.price || "0");
  const previousPrice = parseFloat(display.dataset.price || "0"); // Получаем старую цену
  orderPrice = orderPrice - previousPrice + dishPrice; // Пересчитываем общую цену

  // Сохраняем цену текущего блюда
  display.dataset.price = dishPrice;

  // Обновляем отображение общей суммы
  orderPriceElement.textContent = `Общая сумма: ${orderPrice.toFixed(2)} ₽`;

  // Показываем сводку заказа
  orderSummaryFieldset.style.display = "block";
  noSelectionDiv.style.display = "none";
}

// Добавляем обработчики для каждой категории
["soup", "mainDish", "starter", "drink", "desert"].forEach((category) => {
  const addButtons = document.querySelectorAll(`.${category}-section .add-button`);
  addButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const dishCard = button.closest(".dish-card");
      updateOrder(category, dishCard);
    });
  });
});

// Обработчики для фильтров
["soup", "mainDish", "starter", "drink", "desert"].forEach((category) => {
  const section = document.querySelector(`.${category}-section`);
  const filterButtons = section.querySelectorAll(".filter-button");
  const dishCards = section.querySelectorAll(".dish-card");

  filterButtons.forEach((button) => {
    button.addEventListener("click", () => {
      const isActive = button.classList.contains("active");

      filterButtons.forEach((btn) => btn.classList.remove("active"));

      if (isActive) {
        dishCards.forEach((card) => card.classList.remove("hidden"));
      } else {
        button.classList.add("active");
        const selectedKind = button.dataset.kind;
        dishCards.forEach((card) => {
          card.classList.toggle("hidden", card.dataset.kind !== selectedKind);
        });
      }
    });
  });
});
