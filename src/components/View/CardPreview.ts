import { BaseCard, BaseCardData } from "./Card";
import { IEvents } from "../base/Events";
import { ensureElement } from '../../utils/utils';
import { CDN_URL } from "../../utils/constants";
import { categoryMap } from "../../utils/constants";

interface CardPreviewData extends BaseCardData {
    image: string;
    description: string;
    category: string;
}

export class CardPreview extends BaseCard<CardPreviewData> {
    protected text: HTMLElement;
    protected image: HTMLImageElement;
    protected button: HTMLButtonElement;
    protected category: HTMLElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);

        this.text = ensureElement('.card__text', this.container);
        this.image = ensureElement<HTMLImageElement>('.card__image', this.container);
        this.button = ensureElement<HTMLButtonElement>('.card__button', this.container);
        this.category = ensureElement('.card__category', this.container);
    }

    set onButtonClick(handler: () => void) {
        this.button.onclick = handler;
    }

    set buttonText(value: string) {
        this.button.textContent = value;
    }

    set buttonDisabled(value: boolean) {
        this.button.disabled = value;
    }

    set categoryName(value: string) {
        this.category.textContent = value; 
        this.category.className = 'card__category'; 
        const modifier = categoryMap[value as keyof typeof categoryMap] ?? 'other';
        this.category.classList.add(`${modifier}`);
    }

    set description(value: string) {
        this.text.textContent = value;
    }

    set imageSrc(value: string) {
        this.setImage(this.image, `${CDN_URL}${value.replace(/\.svg$/i, '.png')}`);
    }
}