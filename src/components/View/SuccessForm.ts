import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface SuccessData {
    total: number;
}

export class Success extends Component<SuccessData> {
    protected description: HTMLElement;
    protected button: HTMLButtonElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);

        this.description = ensureElement('.order-success__description', this.container);
        this.button = ensureElement<HTMLButtonElement>('.order-success__close', this.container);

        this.button.addEventListener('click', () => {
            this.events.emit('success:close');
        });
    }

    set total(value: number) {
        this.description.textContent = `Списано ${value} синапсов`;
    }
}
