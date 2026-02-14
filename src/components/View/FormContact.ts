import { BaseForm } from './Form';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { Buyer } from '../Models/Buyer';

interface ContactsFormData {
    email: string;
    phone: string;
}

export class ContactsForm extends BaseForm<ContactsFormData> {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;

    constructor(events: IEvents, container: HTMLElement, protected buyerModel: Buyer) {
        super(events, container);

        this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.form);
        this.emailInput.addEventListener('input', () => {
            this.buyerModel.setEmail(this.emailInput.value);
            this.updateValidity();
        });

        this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.form);
        this.phoneInput.addEventListener('input', () => {
            this.buyerModel.setPhone(this.phoneInput.value);
            this.updateValidity();
        });
        this.updateValidity();
    }

    protected validate(): Record<string, string | undefined> {
        const errors = this.buyerModel.validate();
        return {
            email: errors.email,
            phone: errors.phone
        };
    }

    protected onSubmit() {
        super.onSubmit();
    }

}