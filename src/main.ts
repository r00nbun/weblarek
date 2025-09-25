import './scss/styles.scss';
import { Api } from './components/base/Api';
import { ProductCatalog } from './components/Models/ProductCatalog';
import { Cart } from './components/Models/Cart';
import { Buyer } from './components/Models/Buyer';
import { WebLarekApi } from './components/Models/WebLarekApi';
import { apiProducts } from './utils/data';

const productsModel = new ProductCatalog();
const cartModel = new Cart();
const buyerModel = new Buyer();
const apiClient = new Api(import.meta.env.VITE_API_ORIGIN);
const webLarekApi = new WebLarekApi(apiClient);

productsModel.setProducts(apiProducts.items);

console.log('Массив товаров из каталога:', productsModel.getProducts());

const productId = apiProducts.items[0]?.id;
if (productId) {
  console.log('ID товара:', productsModel.getProductById(productId));
}

productsModel.setSelectedProduct(apiProducts.items[0]);
console.log('Выбранный товар:', productsModel.getSelectedProduct());

cartModel.addItem(apiProducts.items[0]);
cartModel.addItem(apiProducts.items[1]);

// Cart

console.log('Товары в корзине:', cartModel.getItems());

console.log(`ID товара в  корзине: ${productId}: ${cartModel.hasProduct(productId)}`);

console.log('Количество товаров в корзине:', cartModel.getCount());
console.log('Общая стоимость корзины:', cartModel.getTotalPrice());

cartModel.removeItem(apiProducts.items[0]);
console.log('Корзина после удаления товара:', cartModel.getItems());

cartModel.clear();
console.log('Корзина после очистки:', cartModel.getItems());

// Buyer

buyerModel.setPayment('card');
buyerModel.setEmail('test@example.com');
buyerModel.setPhone('+123456789');
buyerModel.setAddress('123 Main St');

console.log('Данные покупателя:', buyerModel.getData());

console.log('Ошибки в данных покупателя:', buyerModel.validate());

buyerModel.clear();
console.log('Данные покупателя после очистки:', buyerModel.getData());
console.log('Ошибки после очистки данных:', buyerModel.validate());

buyerModel.setData({ email: 'partial@example.com' });
console.log('Данные покупателя после частичного обновления:', buyerModel.getData());

// WebLarekApi

webLarekApi.getProducts().then((products) => {
    console.log('Товары с сервера:', products);
}).catch(e => console.error('Ошибка при загрузке с сервера:', e));