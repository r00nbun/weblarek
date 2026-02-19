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
        super(container);
        this.image = ensureElement<HTMLImageElement>('.card__image', this.container);
        this.category = ensureElement('.card__category', this.container);

        this.container.addEventListener('click', () => {
            this.events.emit('card:select', {id: this._id});
        });
    }

    set categoryName(value: string) {
        this.category.textContent = value;
        this.category.className = 'card__category';
        const modifier = categoryMap[value as keyof typeof categoryMap] ?? 'other';
        this.category.classList.add(`${modifier}`);
    }

    set imageSrc(value: string) {
        this.setImage(this.image, `${CDN_URL}${value.replace(/\.svg$/i, '.png')}`);
    }

}