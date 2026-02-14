import { BaseForm } from './Form';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { Buyer } from '../Models/Buyer';
import { TPayment } from '../../types';

interface OrderFormData {
    address: string;
    payment: string;
}

export class OrderForm extends BaseForm<OrderFormData> {
    protected paymentButtons: HTMLButtonElement[];
    protected addressInput: HTMLInputElement;
    // protected paymentError: HTMLElement;

    constructor(events: IEvents, container: HTMLElement, protected buyerModel: Buyer) {
        super(events, container);

        // 1️⃣ Оплата
        this.paymentButtons = Array.from(this.form.querySelectorAll('.order__buttons .button'));
        this.paymentButtons.forEach(button => {
            button.addEventListener('click', () => {
                const method = button.name as TPayment;
                this.buyerModel.setPayment(method);
                this.setPayment(method);
                this.updateValidity();
            });
        });

        // 2️⃣ Адрес
        this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.form);
        this.addressInput.addEventListener('input', () => {
            this.buyerModel.setAddress(this.addressInput.value);
            this.updateValidity();
        });
        this.updateValidity();
    }

    setPayment(method: string) {
        this.paymentButtons.forEach(btn => {
            btn.classList.remove('button_alt_active');
            btn.classList.add('button_alt');
        });

        const active = this.paymentButtons.find(btn => btn.name === method);
        if (active) {
            active.classList.remove('button_alt');
            active.classList.add('button_alt_active');
        }
    }

    protected validate(): Record<string, string | undefined> {
        const errors = this.buyerModel.validate();
        return {
            payment: errors.payment,
            address: errors.address
        };
    }

    protected onSubmit() {
        super.onSubmit();
        this.events.emit('form:next');
    }
}

