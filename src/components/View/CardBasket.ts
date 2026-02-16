import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { BaseCard, BaseCardData } from './Card';
import { IProduct } from '../../types';

export interface CardBasketData extends BaseCardData {
    product: IProduct;
    index: number;
}

export class CardBasket extends BaseCard<CardBasketData> {
    protected deleteButton: HTMLButtonElement;
    protected indexElement: HTMLElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container, events);

        this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);
        this.indexElement = ensureElement('.basket__item-index', this.container);

        this.deleteButton.addEventListener('click', () => {
            this.events.emit('basket:remove', { id: this.container.dataset.id });
        });
    }

    render(data?: Partial<CardBasketData>): HTMLElement {
        if (!data) return this.container;

        if (data.product) {
            this.container.dataset.id = data.product.id;
            this.titleElement.textContent = data.product.title;
            this.priceElement.textContent =
                data.product.price != null ? `${data.product.price} синапсов` : 'Бесценно';
        }

        if (data.index !== undefined) {
            this.indexElement.textContent = String(data.index);
        }

        return this.container;
    }
}