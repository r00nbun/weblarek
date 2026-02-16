import { BaseCard, BaseCardData } from "./Card";
import { IEvents } from "../base/Events";
import { ensureElement } from '../../utils/utils';
import { CDN_URL } from "../../utils/constants";
import { categoryMap } from "../../utils/constants";

interface CardCatalogData extends BaseCardData {
    image: string;
    category: string;
}

export class CardCatalog extends BaseCard<CardCatalogData> {
    protected image: HTMLImageElement;
    protected category: HTMLElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container, events);

        this.image = ensureElement<HTMLImageElement>('.card__image', this.container);
        this.category = ensureElement('.card__category', this.container);

        this.container.addEventListener('click', () => {
            this.events.emit('card:select', { id: this.container.dataset.id });
        });
    }

    render(data?: Partial<CardCatalogData>): HTMLElement {
        if (!data) return this.container;

        // Используем базовый метод
        this.renderBase(data);

        // Только уникальное для дочернего класса
        if (data.image) this.setImage(this.image, `${CDN_URL}${data.image.replace(/\.svg$/i, '.png')}`);
        if (data.category) {
            this.category.textContent = data.category;
            this.category.className = 'card__category';
            const modifier = categoryMap[data.category as keyof typeof categoryMap] ?? 'other';
            this.category.classList.add(modifier);
        }

        if (data.id) this.container.dataset.id = data.id;

        return this.container;
    }
}