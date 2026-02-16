import { IEvents } from '../base/Events';
import { IBuyer, TPayment } from '../../types';

export class Buyer {
  private payment: TPayment = '';
  private email = '';
  private phone = '';
  private address = '';

  constructor(private events: IEvents) {}

  setData(data: Partial<IBuyer>) {
    if (data.payment !== undefined) this.payment = data.payment;
    if (data.email !== undefined) this.email = data.email;
    if (data.phone !== undefined) this.phone = data.phone;
    if (data.address !== undefined) this.address = data.address;

    this.events.emit('buyer:change');
  }

  getData(): IBuyer {
    return {
      payment: this.payment,
      email: this.email,
      phone: this.phone,
      address: this.address
    };
  }

  clear() {
    this.payment = '';
    this.email = '';
    this.phone = '';
    this.address = '';
    this.events.emit('buyer:change');
  }

  validate() {
    const errors: Record<string, string> = {};
    if (!this.payment) errors.payment = 'Выберите способ оплаты';
    if (!this.email) errors.email = 'Укажите email';
    if (!this.phone) errors.phone = 'Укажите телефон';
    if (!this.address) errors.address = 'Укажите адрес';
    return errors;
  }
}