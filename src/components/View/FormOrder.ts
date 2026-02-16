import { BaseForm } from './Form';
import { IEvents } from '../base/Events';

export interface OrderFormData {
    payment: string | null;
    address: string;
}

interface OrderFormRenderData extends Partial<OrderFormData> {
    valid?: boolean;
    errors?: Record<string, string>;
}

export class OrderForm extends BaseForm<OrderFormData> {
    protected paymentButtons: HTMLButtonElement[];
    protected addressInput: HTMLInputElement;

    constructor(events: IEvents, container: HTMLElement) {
        super(events, container);

        this.paymentButtons = Array.from(this.form.querySelectorAll('.order__buttons .button'));
        this.addressInput = this.form.querySelector<HTMLInputElement>('input[name="address"]')!;

        this.paymentButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                this.events.emit('order:payment-selected', { payment: btn.name });
            });
        });

        this.addressInput.addEventListener('input', () => {
            this.events.emit('order:address-changed', { address: this.addressInput.value });
        });
    }

    render(data?: OrderFormRenderData): HTMLElement {
        if (data?.payment !== undefined) {
            this.paymentButtons.forEach(btn => {
                btn.classList.remove('button_alt_active');
                btn.classList.add('button_alt');
            });
            const active = this.paymentButtons.find(btn => btn.name === data.payment);
            if (active) {
                active.classList.remove('button_alt');
                active.classList.add('button_alt_active');
            }
        }

        if (data?.address !== undefined) {
            this.addressInput.value = data.address;
        }

        if (data?.errors) {
            this.showErrors(data.errors);
        }

        if (data?.valid !== undefined) {
            this.valid = data.valid;
        }

        return this.container;
    }

    protected validate(): Record<string, string | undefined> {
        return {};
    }

    protected onSubmit() {
        super.onSubmit();
        this.events.emit('order:submit');
    }
}