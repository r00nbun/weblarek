import { Component } from '../base/Component';
import { ensureElement } from '../../utils/utils';
import { IEvents } from '../base/Events';

export interface BaseCardData {
    id: string;
    title: string;
    price: number | null;
}

export abstract class BaseCard<T extends BaseCardData> extends Component<T> {
    protected titleElement: HTMLElement;
    protected priceElement: HTMLElement;

    protected constructor(container: HTMLElement, protected events: IEvents) {
        super(container);
        this.titleElement = ensureElement('.card__title', this.container);
        this.priceElement = ensureElement('.card__price', this.container);
    }

    protected renderBase(data?: Partial<BaseCardData>): void {
        if (!data) return;
        if (data.title) this.titleElement.textContent = data.title;
        if (data.price !== undefined)
            this.priceElement.textContent = data.price ? `${data.price} синапсов` : 'Бесценно';
    }
}