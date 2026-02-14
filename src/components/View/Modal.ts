import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';

interface ModalData {
    content: HTMLElement;
}

export class Modal extends Component<ModalData> {
    protected closeButton: HTMLButtonElement;
    protected content: HTMLElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);

        this.closeButton = ensureElement<HTMLButtonElement>('.modal__close', this.container);
        this.content = ensureElement<HTMLElement>('.modal__content', this.container);

        this.closeButton.addEventListener('click', () => this.close());
        this.container.addEventListener('click', (e) => {
            if (e.target === this.container) {
                this.close();
            }
        });
    }

    set contentElement(value: HTMLElement) {
        this.content.replaceChildren(value);
    }

    open() {
        this.container.classList.add('modal_active');
    }

    close() {
        this.container.classList.remove('modal_active');
        this.events.emit('modal:close');
    }
}

