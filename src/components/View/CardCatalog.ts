import { BaseCard, BaseCardData } from "./Card";
import { IEvents } from "../base/Events";
import { ensureElement } from '../../utils/utils';
import { CDN_URL } from "../../utils/constants";

interface CardCatalogData extends BaseCardData {
    image: string;
    category: string;
}

export class CardCatalog extends BaseCard<CardCatalogData> {
    protected image: HTMLImageElement;
    protected category: HTMLElement;
    private categoryMap: Record<string, string> = {
        'софт-скил': 'soft',
        'хард-скил': 'hard',
        'кнопка': 'button',
        'дополнительное': 'additional',
        'другое': 'other'
    };

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);
        this.image = ensureElement<HTMLImageElement>('.card__image', this.container);
        this.category = ensureElement('.card__category', this.container);

        this.container.addEventListener('click', () => {
            this.events.emit('card:select', {id: this.id});
        });
    }

    set categoryName(value: string) {
        this.category.textContent = value;
        this.category.className = 'card__category';
        const modifier = this.categoryMap[value] ?? 'other';
        this.category.classList.add(`card__category_${modifier}`);
    }

    set imageSrc(value: string) {
        this.setImage(this.image, `${CDN_URL}${value.replace(/\.svg$/i, '.png')}`);
    }

}