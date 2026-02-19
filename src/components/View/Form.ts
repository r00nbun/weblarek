import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { IBuyer } from '../../types';

export abstract class BaseForm<T> extends Component<T> {
    protected form: HTMLFormElement;
    protected submitButton: HTMLButtonElement;
    protected errorsElement?: HTMLElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);

        this.form = this.container as HTMLFormElement;
        this.submitButton = ensureElement<HTMLButtonElement>('button[type="submit"]', this.form);
        this.errorsElement = ensureElement<HTMLElement>('.form__errors', this.form);

        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            this.onSubmit();
        });
    }

    set error(message: string) {
        if (!this.errorsElement) return;
        this.errorsElement.textContent = message;
    }

    setSubmitEnabled(enabled: boolean): void {
        this.submitButton.disabled = !enabled;
    }

    abstract checkValidation(message: Partial<Record<keyof IBuyer, string>>): boolean

    protected onSubmit() {
        this.events.emit(`${this.form.name}:submit`);
    }
}