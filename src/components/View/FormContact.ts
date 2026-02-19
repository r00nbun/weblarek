import { BaseForm } from './Form';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { IBuyer } from '../../types';

interface ContactsFormData {
    email: string;
    phone: string;
}

export class ContactsForm extends BaseForm<ContactsFormData> {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;

    constructor(events: IEvents, container: HTMLElement) {
        super(events, container);

        this.emailInput = ensureElement<HTMLInputElement>('input[name="email"]', this.form);
        this.emailInput.addEventListener('input', () => {
            events.emit('email:changed', { email: this.emailInput.value });
        });

        this.phoneInput = ensureElement<HTMLInputElement>('input[name="phone"]', this.form);
        this.phoneInput.addEventListener('input', () => {
            events.emit('phone:changed', { phone: this.phoneInput.value });
        });
    }

    checkValidation(message: Partial<Record<keyof IBuyer, string>>): boolean {
        this.error = message.email || message.phone || "";
        return !message.email && !message.phone;
    }

    protected onSubmit() {
        super.onSubmit();
    }
}