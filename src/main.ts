import './scss/styles.scss';
import { API_URL } from './utils/constants';
import { Api } from './components/base/Api';
import { ProductCatalog } from './components/Models/ProductCatalog';
import { Cart } from './components/Models/Cart';
import { Buyer } from './components/Models/Buyer';
import { WebLarekApi } from './components/Models/WebLarekApi';

import { Header } from './components/View/Header';
import { CardCatalog } from './components/View/CardCatalog';
import { CardPreview } from './components/View/CardPreview';
import { Basket } from './components/View/Basket';
import { CardBasket } from './components/View/CardBasket';
import { Modal } from './components/View/Modal';
import { OrderForm } from './components/View/FormOrder';
import { ContactsForm } from './components/View/FormContact';
import { Success } from './components/View/SuccessForm';

import { cloneTemplate } from './utils/utils';
import { EventEmitter } from './components/base/Events';
import { IOrder, IProduct, TPayment } from './types';
import { Gallery } from './components/View/Gallery';

const events = new EventEmitter();

const productsModel = new ProductCatalog(events);
const cartModel = new Cart(events);
const buyerModel = new Buyer(events);
const apiClient = new Api(API_URL);
const webLarekApi = new WebLarekApi(apiClient);

const galleryContainer = document.querySelector<HTMLElement>('.gallery')!;
const modalContainer = document.getElementById('modal-container')!;

const header = new Header(events, document.querySelector('.header')!);
const modal = new Modal(events, modalContainer);
const basketView = new Basket(events, cloneTemplate('#basket'));
const gallery = new Gallery(events, galleryContainer);
const preview = new CardPreview(events, cloneTemplate('#card-preview'));
const success = new Success(events, cloneTemplate('#success'));
const orderForm = new OrderForm(events, cloneTemplate('#order'));
const contactsForm = new ContactsForm(events, cloneTemplate('#contacts'));

// Загрузка каталога товаров
webLarekApi.getProducts().then(products => {
  productsModel.setProducts(products);
});

events.on<IProduct[]>('catalog:change', () => {
  const products = productsModel.getProducts();
  const cards = products.map(product => {
    const card = new CardCatalog(events, cloneTemplate('#card-catalog'));
    card.id = product.id;
    card.title = product.title;
    card.price = product.price;
    card.imageSrc = product.image;
    card.categoryName = product.category;
    return card;
  });
  gallery.items = cards;
});


// Открытие карточки товара
events.on<{ id: string }>('card:select', (data: { id: string }) => {
  const product = productsModel.getProductById(data.id);
  if (!product) return;

  productsModel.setSelectedProduct(product);

  preview.title = product.title;
  preview.categoryName = product.category;
  preview.description = product.description || '';
  preview.price = product.price;
  preview.imageSrc = product.image;

  preview.buttonText = cartModel.hasProduct(product.id) ? 'Удалить из корзины' : 'Купить';
  preview.buttonDisabled = false;

  if (product.price === null) {
    preview.buttonText = 'Недоступно';
    preview.buttonDisabled = true;
  } else {
    preview.buttonText = cartModel.hasProduct(product.id) ? 'Удалить из корзины' : 'Купить';
    preview.buttonDisabled = false;

    preview.onButtonClick = () => {
      if (cartModel.hasProduct(product.id)) {
        cartModel.removeItem(product);
      } else {
        cartModel.addItem(product);
      }

      preview.buttonText = cartModel.hasProduct(product.id) ? 'Удалить из корзины' : 'Купить';
    };
  };

  modal.contentElement = preview;
  modal.open();
});

// Добавление товара в корзину
events.on('basket:add', (data: { id: string }) => {
  const product = productsModel.getProductById(data.id);
  if (!product) return;

  if (!cartModel.hasProduct(product.id)) {
    cartModel.addItem(product);
  }
});

// Обновление корзины
events.on('basket:change', () => {
  const items = cartModel.getItems().map((item, index) => {
    const card = new CardBasket(events, cloneTemplate('#card-basket'));
    card.product = item;
    card.index = index + 1;
    return card.render();
  });

  basketView.items = items;
  basketView.total = cartModel.getTotalPrice();
  header.counter = cartModel.getCount();
  basketView.canCheckout = cartModel.getItems().length > 0;
});

// Открытие корзины
events.on('basket:open', () => {
  modal.contentElement = basketView;
  modal.open();
});

// Удаление товара из корзины
events.on('basket:remove', (data: { id: string }) => {
  const product = cartModel.getItems().find(item => item.id === data.id);
  if (product) {
    cartModel.removeItem(product);
  }
});

// Оформление заказа
events.on('order:open', () => {
  modal.contentElement = orderForm;
  modal.open();
});

events.on('payment:changed', (data: { payment: TPayment }) => {
  buyerModel.setData({ payment: data.payment });
});

events.on('address:changed', (data: { address: string }) => {
  buyerModel.setData({ address: data.address });
});

events.on('form:next', () => {
  modal.contentElement = contactsForm;
  modal.open();
});

events.on('phone:changed', (data: { phone: string }) => {
  buyerModel.setData({ phone: data.phone });
});

events.on('email:changed', (data: { email: string }) => {
  buyerModel.setData({ email: data.email });
});

events.on("buyer:change", () => {
  let buyerData = buyerModel.getData();

  let orderValid = orderForm.checkValidation(buyerModel.validate());
  orderForm.setSubmitEnabled(orderValid);
  orderForm.togglePaymentButton(buyerData.payment);

  let contactsValid = contactsForm.checkValidation(buyerModel.validate());
  contactsForm.setSubmitEnabled(contactsValid);
});

// Завершение оплаты
events.on('contacts:submit', () => {
  const isValid = contactsForm.checkValidation(buyerModel.validate());
  if (!isValid) return;

  const orderItems: string[] = cartModel.getItems().map(item => item.id);

  const { payment, email, phone, address } = buyerModel.getData();

  const order: IOrder = {
    payment,
    email,
    phone,
    address,
    total: cartModel.getTotalPrice(),
    items: orderItems,
  };

  webLarekApi.sendOrder(order)
  .then(() => {
    success.total = cartModel.getTotalPrice();
    modal.contentElement = success;
    modal.open();

    cartModel.clear();
    buyerModel.clear();
  })
  .catch((error) => {
    console.error('Ошибка при отправке заказа:', error);
    alert('Не удалось отправить заказ. Пожалуйста, попробуйте позже.');
  });
});

events.on('success:close', () => {
  modal.close();
});