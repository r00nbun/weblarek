import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

export abstract class BaseForm<T> extends Component<T> {
    protected form: HTMLFormElement;
    protected submitButton: HTMLButtonElement;
    protected errorsElement?: HTMLElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);

        this.form = this.container as HTMLFormElement;
        this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.form);
        this.errorsElement = this.form.querySelector('.form__errors') ?? undefined;

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.onSubmit();
        });
    }

    protected showErrors(errors: Record<string, string | undefined>) {
        if (!this.errorsElement) return;
        const messages = Object.values(errors).filter(Boolean);
        this.errorsElement.textContent = messages.join(', ');
    }

    protected abstract validate(): Record<string, string | undefined>;

    public updateValidity() {
        const errors = this.validate();
        this.showErrors(errors);

        const hasErrors = Object.values(errors).some(Boolean);
        this.valid = !hasErrors;
    }

    protected onSubmit() {
        this.events.emit(`${this.form.name}:submit`);
    }

    set valid(value: boolean) {
        this.submitButton.disabled = !value;
    }
}

