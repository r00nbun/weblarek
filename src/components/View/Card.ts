import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';

export interface BaseCardData {
    id: string;
    title: string;
    price: number;
}

export abstract class BaseCard<T extends BaseCardData> extends Component<T> {
    protected titleElement: HTMLElement;
    protected priceElement: HTMLElement;
    protected _id: string = '';

    protected constructor(container: HTMLElement) {
        super(container);

        this.titleElement = ensureElement('.card__title', this.container);
        this.priceElement = ensureElement('.card__price', this.container);
    }

    set title(value: string) {
        this.titleElement.textContent = value;
    }

    set price(value: number | null) {
        this.priceElement.textContent = value != null ? `${value} синапсов` : 'Бесценно';
    }

    set id(value: string) {
        this._id = value;
    }
}