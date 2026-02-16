import { BaseForm } from './Form';
import { IEvents } from '../base/Events';

interface ContactsFormData {
    email: string;
    phone: string;
}

export class ContactsForm extends BaseForm<ContactsFormData> {
    protected emailInput: HTMLInputElement;
    protected phoneInput: HTMLInputElement;

    constructor(events: IEvents, container: HTMLElement) {
        super(events, container);

        this.emailInput = this.form.querySelector<HTMLInputElement>('input[name="email"]')!;
        this.phoneInput = this.form.querySelector<HTMLInputElement>('input[name="phone"]')!;

        // Любое действие пользователя → событие и проверка
        const handleInput = (field: 'email' | 'phone', value: string) => {
            this.events.emit('contacts:input', { field, value });
            this.updateValidity();
        };

        this.emailInput.addEventListener('input', () => handleInput('email', this.emailInput.value));
        this.phoneInput.addEventListener('input', () => handleInput('phone', this.phoneInput.value));

        this.updateValidity();
    }

    render(data?: { email?: string; phone?: string; valid?: boolean; errors?: Record<string, string> }) {
        if (data) {
            this.emailInput.value = data.email ?? '';
            this.phoneInput.value = data.phone ?? '';
            this.showErrors(data.errors ?? {});
            this.valid = data.valid ?? false;
        }

        return this.container;
    }

    protected validate(): Record<string, string | undefined> {
        const errors: Record<string, string | undefined> = {};

        if (!this.emailInput.value.trim()) errors.email = 'Укажите email';
        if (!this.phoneInput.value.trim()) errors.phone = 'Укажите телефон';

        return errors;
    }

    protected onSubmit() {
        const errors = this.validate();
        this.showErrors(errors);

        const hasErrors = Object.values(errors).some(Boolean);
        if (!hasErrors) {
            super.onSubmit();
            this.events.emit('contacts:submit');
        }
    }
}