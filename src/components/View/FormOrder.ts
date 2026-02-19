import { BaseForm } from './Form';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { TPayment, IBuyer } from '../../types';

interface OrderFormData {
    address: string;
    payment: TPayment;
}

export class OrderForm extends BaseForm<OrderFormData> {
    protected cashButton: HTMLButtonElement;
    protected cardButton: HTMLButtonElement;
    protected addressInput: HTMLInputElement;

    constructor(events: IEvents, container: HTMLElement) {
        super(events, container);

        // 1️⃣ Оплата
        this.cashButton = ensureElement<HTMLButtonElement>('button[name="cash"]', this.container);
        this.cashButton.addEventListener('click', () => {
            events.emit('payment:changed', { payment: 'cash' })
        });

        this.cardButton = ensureElement<HTMLButtonElement>('button[name="card"]', this.container);
        this.cardButton.addEventListener('click', () => {
            events.emit('payment:changed', { payment: 'card' })
        });

        // 2️⃣ Адрес
        this.addressInput = ensureElement<HTMLInputElement>('input[name="address"]', this.form);
        this.addressInput.addEventListener('input', () => {
            events.emit('address:changed', { address: this.addressInput.value })
        });
    }

    togglePaymentButton(payment: TPayment): void {
        const altActiveClassName = "button_alt-active";
        this.cashButton.classList.toggle(altActiveClassName, payment === "cash");
        this.cardButton.classList.toggle(altActiveClassName, payment === "card",);
    }

    checkValidation(message: Partial<Record<keyof IBuyer, string>>): boolean {
        this.error = "";
        this.error = message.payment || message.address || "";
        return !message.payment && !message.address;
    }

    protected onSubmit() {
        super.onSubmit();
        this.events.emit('form:next');
    }
}