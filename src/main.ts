import './scss/styles.scss';
import { GalleryView } from './components/View/Gallery';

import { EventEmitter } from './components/base/Events';
import { Cart } from './components/Models/Cart';
import { Buyer } from './components/Models/Buyer';
import { ProductCatalog } from './components/Models/ProductCatalog';
import { WebLarekApi } from './components/Models/WebLarekApi';
import { Api } from './components/base/Api';
import { Header } from './components/View/Header';
import { Basket } from './components/View/Basket';
import { CardBasket } from './components/View/CardBasket';
import { Modal } from './components/View/Modal';
import { cloneTemplate } from './utils/utils';
import { API_URL } from './utils/constants';
import { IOrder, IProduct } from './types';
import { CardPreview } from './components/View/CardPreview';
import { OrderForm } from './components/View/FormOrder';
import { ContactsForm } from './components/View/FormContact';
import { Success } from './components/View/SuccessForm';

import { TPayment, IBuyer } from './types';

// События
const events = new EventEmitter();

// Модели
const productsModel = new ProductCatalog(events);
const cartModel = new Cart(events);
const buyerModel = new Buyer(events);
const apiClient = new Api(API_URL);
const webLarekApi = new WebLarekApi(apiClient);

// View
const galleryContainer = document.querySelector<HTMLElement>('.gallery')!;
const modalContainer = document.getElementById('modal-container')!;
const header = new Header(events, document.querySelector('.header')!);
const modal = new Modal(events, modalContainer);
const basketView = new Basket(events, cloneTemplate('#basket'));
const galleryView = new GalleryView(events, galleryContainer);
const orderForm = new OrderForm(events, cloneTemplate('#order'));
const contactsForm = new ContactsForm(events, cloneTemplate('#contacts'));
const successView = new Success(events, cloneTemplate('#success'));

// Загрузка каталога
(async function loadCatalog() {
  try {
    const products = await webLarekApi.getProducts();
    productsModel.setProducts(products);
  } catch (err) {
    console.error('Ошибка загрузки каталога', err);
  }
})();

// события модели
events.on('catalog:change', () => {
  galleryView.render(productsModel.getProducts());
});

events.on('basket:change', () => {
  const items = cartModel.getItems().map((item, index) => {
    const card = new CardBasket(events, cloneTemplate('#card-basket'));
    card.render({ product: item, index: index + 1, id: item.id, title: item.title, price: item.price ?? 0 });
    return card.render();
  });
  basketView.items = items;
  basketView.total = cartModel.getTotalPrice();
  header.counter = cartModel.getCount();
  basketView.canCheckout = items.length > 0;
});

events.on('card:select', ({ id }: { id: string }) => {
  const product = productsModel.getProductById(id);
  if (!product) return;

  productsModel.setSelectedProduct(product);

  const preview = new CardPreview(events, cloneTemplate('#card-preview'));

  const getPreviewData = (product: IProduct) => ({
    id: product.id,
    title: product.title,
    price: product.price,
    image: product.image,
    category: product.category,
    description: product.description || '',
    inBasket: cartModel.hasProduct(product.id),
  });

  const data = getPreviewData(product);

  preview.render(data);

  preview.showIn(modal['content'], data);

  modal.open();

  const updateListener = () => {
    preview.render(getPreviewData(product));
  };
  events.on('basket:change', updateListener);

  events.on('modal:close', () => {
    events.off('basket:change', updateListener);
  });
});

events.on('basket:open', () => {
  modal.contentElement = basketView.render();
  modal.open();
});

// удаление из корзины
events.on('basket:remove', ({ id }: { id: string }) => {
  const product = cartModel.getItems().find(p => p.id === id);
  if (product) cartModel.removeItem(product);
});

function updateFormState<
  K extends keyof IBuyer
>(
  form: {
    render: (data: any) => void;
  },
  fields: K[]
) {
  const data = buyerModel.getData();
  const errors = buyerModel.validate();

  const filteredErrors: Record<string, string> = {};

  fields.forEach((field) => {
    if (errors[field]) {
      filteredErrors[field as string] = errors[field]!;
    }
  });

  const valid = fields.every((field) => !errors[field]);

  form.render({
    ...fields.reduce((acc, field) => {
      acc[field] = data[field];
      return acc;
    }, {} as any),
    errors: filteredErrors,
    valid,
  });
}

// открытие
events.on('order:open', () => {
  modal.contentElement = orderForm.render();
  updateFormState(orderForm, ['payment', 'address']);
});

events.on('order:submit', () => {
  const errors = buyerModel.validate();

  if (!errors.payment && !errors.address) {
    modal.contentElement = contactsForm.render();
    updateFormState(contactsForm, ['email', 'phone']);
  } else {
    updateFormState(orderForm, ['payment', 'address']);
  }
});

events.on('order:payment-selected', ({ payment }: { payment: TPayment }) => {
  buyerModel.setData({ payment });
  updateFormState(orderForm, ['payment', 'address']);
});

// --- Пользователь изменяет адрес ---
events.on('order:address-changed', ({ address }: { address: string }) => {
  buyerModel.setData({ address });
  updateFormState(orderForm, ['payment', 'address']);
});


events.on('contacts:input', ({ field, value }: { field: 'email' | 'phone'; value: string }) => {
  buyerModel.setData({ [field]: value });
  updateFormState(contactsForm, ['email', 'phone']);
});

// --- Сабмит формы контактов ---
events.on('contacts:submit', async () => {
  const data = buyerModel.getData();
  const errors = buyerModel.validate();

  const fields: (keyof IBuyer)[] = ['email', 'phone'];

  const valid = fields.every((field) => !errors[field]);

  if (valid) {
    const totalPrice = cartModel.getTotalPrice();
    // Отправка заказа
    const orderItems = cartModel.getItems().map(i => i.id);
    const order: IOrder = {
      payment: data.payment,
      email: data.email,
      phone: data.phone,
      address: data.address,
      total: totalPrice,
      items: orderItems
    };

    try {
      await webLarekApi.sendOrder(order);
      successView.total = totalPrice;
      modal.contentElement = successView.render();
      modal.open();

      cartModel.clear();
      buyerModel.clear();
      events.on('success:close', () => {
        modal.close();
      });
    } catch (err) {
      console.error('Ошибка отправки заказа', err);
    }
  } else {
    // Отображаем ошибки и блокируем кнопку
    contactsForm.render({ email: data.email, phone: data.phone, valid, errors });
  }
});

events.on('modal:close', () => {
  buyerModel.clear();
});

// --- Presenter: добавление в корзину ---
events.on('basket:add', ({ id }: { id: string }) => {
  const product = productsModel.getProductById(id);
  if (!product) return;
  if (!cartModel.hasProduct(product.id)) cartModel.addItem(product);
});

events.on('basket:remove', ({ id }: { id: string }) => {
  const product = cartModel.getItems().find(p => p.id === id);
  if (product) cartModel.removeItem(product);
});