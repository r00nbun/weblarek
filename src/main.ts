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
import { IOrder, IProduct } from './types';

const productsModel = new ProductCatalog();
const cartModel = new Cart();
const buyerModel = new Buyer();
const apiClient = new Api(API_URL);
const webLarekApi = new WebLarekApi(apiClient);

const events = new EventEmitter();

const galleryContainer = document.querySelector('.gallery')!;
const modalContainer = document.getElementById('modal-container')!;

const header = new Header(events, document.querySelector('.header')!);
const modal = new Modal(events, modalContainer);
const basketView = new Basket(events, cloneTemplate('#basket'));

const gallery = {
  render: (cards: HTMLElement[]) => galleryContainer.replaceChildren(...cards),
};

// Загрузка каталога товаров
webLarekApi.getProducts().then(products => {
  productsModel.setProducts(products);
  events.emit('catalog:change');
});

// Рендер каталога
events.on<IProduct[]>('catalog:change', () => {
  const products = productsModel.getProducts();
  const cards = products.map(product => {
    const card = new CardCatalog(events, cloneTemplate('#card-catalog'));
    card.id = product.id;
    card.title = product.title;
    card.price = product.price;
    card.imageSrc = product.image;
    card.categoryName = product.category;
    return card.render();
  });
  gallery.render(cards);
});

// Открытие карточки товара
events.on<{ id: string }>('card:select', (data: { id: string }) => {
  const product = productsModel.getProductById(data.id);
  if (!product) return;

  productsModel.setSelectedProduct(product);
  const preview = new CardPreview(events, cloneTemplate('#card-preview'));
  preview.id = product.id;
  preview.title = product.title;
  preview.categoryName = product.category;
  preview.description = product.description || '';
  preview.price = product.price;
  preview.imageSrc = product.image;

  preview.basketState = cartModel.hasProduct(product.id);

  modal.contentElement = preview.render();
  modal.open();
});

// Добавление товара в корзину
events.on('basket:add', (data: { id: string }) => {
  const product = productsModel.getProductById(data.id);
  if (!product) return;

  if (!cartModel.hasProduct(product.id)) {
    cartModel.addItem(product);
    events.emit('basket:change');
  }
});

// Обновление корзины
events.on('basket:change', () => {
  const items = cartModel.getItems().map((item) => {
    const basketItem = new CardBasket(events, cloneTemplate('#card-basket'));
    basketItem.product = item;
    return basketItem.render();
  });

  basketView.items = items;
  basketView.total = cartModel.getTotalPrice();
  header.counter = cartModel.getCount();
  basketView.canCheckout = cartModel.getItems().length > 0;
});

// Открытие корзины
events.on('basket:open', () => {
  modal.contentElement = basketView.render();
  modal.open();
});

// Удаление товара из корзины
events.on('basket:remove', (data: { id: string }) => {
  const product = cartModel.getItems().find(item => item.id === data.id);
  if (product) {
    cartModel.removeItem(product);
    events.emit('basket:change');
  }
});

// Оформление заказа
events.on('order:open', () => {
  const orderForm = new OrderForm(events, cloneTemplate('#order'), buyerModel);
  modal.contentElement = orderForm.render();
  modal.open();
  orderForm.updateValidity();
});

// Переход к форме контактов
events.on('form:next', () => {
  const contactsForm = new ContactsForm(events, cloneTemplate('#contacts'), buyerModel);
  modal.contentElement = contactsForm.render();
  modal.open();
});

events.on('modal:close', () => {
  buyerModel.clear();
});

// Завершение оплаты
events.on('contacts:submit', () => {
  const orderItems: string[] = cartModel.getItems().map(item => item.id);

  const order: IOrder = {
    payment: buyerModel.getData().payment,
    email: buyerModel.getData().email,
    phone: buyerModel.getData().phone,
    address: buyerModel.getData().address,
    total: cartModel.getTotalPrice(),
    items: orderItems,
  };

  webLarekApi.sendOrder(order).then(() => {
    const success = new Success(events, cloneTemplate('#success'));
    success.total = cartModel.getTotalPrice();
    modal.contentElement = success.render();
    modal.open();

    cartModel.clear();
    buyerModel.clear();
    events.emit('basket:change');
    events.on('success:close', () => {
      modal.close();
    });
  });
});