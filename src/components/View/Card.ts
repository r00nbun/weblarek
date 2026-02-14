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
    protected isPriceless = false;

    protected constructor(container: HTMLElement) {
        super(container);

        this.titleElement = ensureElement('.card__title', this.container);
        this.priceElement = ensureElement('.card__price', this.container);
    }

    set title(value: string) {
        this.titleElement.textContent = value;
    }

    set price(value: number | null) {
        this.isPriceless = value == null;
        this.priceElement.textContent = value != null ? `${value} синапсов` : 'Бесценно';
    }

    set id(value: string) {
        this.container.dataset.id = value;
    }

    get id(): string {
        return this.container.dataset.id ?? '';
    }
}