import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { IProduct } from '../../types';
import { BaseCard, BaseCardData } from "./Card";

interface CardBasketData extends BaseCardData {
    product: IProduct;
    index: number;
}

export class CardBasket extends BaseCard<CardBasketData> {
    protected deleteButton: HTMLButtonElement;
    protected indexElement: HTMLElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);

        this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);
        this.indexElement = ensureElement('.basket__item-index', this.container);

        this.deleteButton.addEventListener('click', () => {
            this.events.emit<{ id: string }>('basket:remove', {
                id: this._id
            });
        });
    }

    set product(value: IProduct) {
        this.id = value.id;
        this.title = value.title;
        this.price = value.price ?? 0;
    }

    set index(value: number) {
        this.indexElement.textContent = value.toString();
    }
}