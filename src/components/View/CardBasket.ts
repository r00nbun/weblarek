import { IEvents } from '../base/Events';
import { ensureElement } from '../../utils/utils';
import { IProduct } from '../../types';
import { BaseCard, BaseCardData } from "./Card";

interface CardBasketData extends BaseCardData {
    product: IProduct;
}

export class CardBasket extends BaseCard<CardBasketData> {
    protected deleteButton: HTMLButtonElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);

        this.deleteButton = ensureElement<HTMLButtonElement>('.basket__item-delete', this.container);

        this.deleteButton.addEventListener('click', () => {
            this.events.emit<{ id: string }>('basket:remove', {
                id: this.id
            });
        });
    }

    set product(value: IProduct) {
        this.id = value.id;
        this.title = value.title;
        this.price = value.price ?? 0;
    }
}