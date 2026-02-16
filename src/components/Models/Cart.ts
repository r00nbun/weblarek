import { IEvents } from '../base/Events';
import { IProduct } from '../../types';

export class Cart {
  private items: IProduct[] = [];

  constructor(private events: IEvents) {}

  addItem(product: IProduct) {
    this.items.push(product);
    this.events.emit('basket:change');
  }

  removeItem(product: IProduct) {
    this.items = this.items.filter(i => i.id !== product.id);
    this.events.emit('basket:change');
  }

  clear() {
    this.items = [];
    this.events.emit('basket:change');
  }

  getItems() {
    return this.items;
  }

  getTotalPrice() {
    return this.items.reduce((sum, i) => sum + (i.price ?? 0), 0);
  }

  getCount() {
    return this.items.length;
  }

  hasProduct(id: string) {
    return this.items.some(i => i.id === id);
  }
}