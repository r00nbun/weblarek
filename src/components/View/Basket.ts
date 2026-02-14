import { Component } from '../base/Component';
import { IEvents } from '../base/Events';
import { ensureElement, createElement } from '../../utils/utils';

interface BasketData {
    total: number;
}

export class Basket extends Component<BasketData> {
    protected list: HTMLElement;
    protected price: HTMLElement;
    protected button: HTMLButtonElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);

        this.list = ensureElement('.basket__list', this.container);
        this.price = ensureElement('.basket__price', this.container);
        this.button = ensureElement<HTMLButtonElement>('.basket__button', this.container);

        this.button.disabled = true;

        this.button.addEventListener('click', () => {
            this.events.emit('order:open');
        });

        this.items = [];
    }

    set items(elements: HTMLElement[]) {
        if (elements.length === 0) {
            const empty = createElement('li', {
                className: 'modal__title',
                textContent: 'Корзина пуста'
            });
            empty.style.color = 'rgba(255, 255, 255, 0.5)';
            empty.style.listStyle = 'none';

            this.list.replaceChildren(empty);
        } else {
            this.list.replaceChildren(...elements);
        }
    }

    set total(value: number) {
        this.price.textContent = `${value} синапсов`;
    }

    set canCheckout(value: boolean) {
        this.button.disabled = !value;
    }
}
