import { BaseCard, BaseCardData } from "./Card";
import { IEvents } from "../base/Events";
import { ensureElement } from '../../utils/utils';
import { CDN_URL } from "../../utils/constants";
import { categoryMap } from "../../utils/constants";

interface CardPreviewData extends BaseCardData {
    image: string;
    description: string;
    category: string;
    inBasket: boolean;
}

export class CardPreview extends BaseCard<CardPreviewData> {
    protected text: HTMLElement;
    protected image: HTMLImageElement;
    protected button: HTMLButtonElement;
    protected category: HTMLElement;

    private productId: string = '';

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container, events);

        this.text = ensureElement('.card__text', this.container);
        this.image = ensureElement<HTMLImageElement>('.card__image', this.container);
        this.button = ensureElement<HTMLButtonElement>('.card__button', this.container);
        this.category = ensureElement('.card__category', this.container);

        this.button.addEventListener('click', () => {
            if (!this.productId) return;
            const action = this.button.dataset.action;
            if (action === 'add') {
                this.events.emit('basket:add', { id: this.productId });
            } else if (action === 'remove') {
                this.events.emit('basket:remove', { id: this.productId });
            }
        });
    }

    public showIn(parent: HTMLElement, data: Partial<CardPreviewData>): void {
        this.render(data);
        parent.replaceChildren(this.container);
    }

    render(data: Partial<CardPreviewData>): HTMLElement {
        if (!data) return this.container;

        if (data.id) this.productId = data.id;

        this.renderBase(data);

        if (data.image) {
            this.setImage(this.image, `${CDN_URL}${data.image.replace(/\.svg$/i, '.png')}`);
        }

        if (data.description) this.text.textContent = data.description;

        if (data.category) {
            this.category.textContent = data.category;
            this.category.className = 'card__category';
            const modifier = categoryMap[data.category as keyof typeof categoryMap] ?? 'other';
            this.category.classList.add(modifier);
        }

        if (data.inBasket !== undefined || data.price !== undefined) {
            const disabled = data.price == null;
            this.button.disabled = disabled;
            if (disabled) {
                this.button.textContent = 'Недоступно';
                this.button.dataset.action = '';
            } else if (data.inBasket) {
                this.button.textContent = 'Удалить из корзины';
                this.button.dataset.action = 'remove';
            } else {
                this.button.textContent = 'Купить';
                this.button.dataset.action = 'add';
            }
        }

        return this.container;
    }
}