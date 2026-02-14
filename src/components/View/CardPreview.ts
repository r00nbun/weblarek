import { BaseCard, BaseCardData } from "./Card";
import { IEvents } from "../base/Events";
import { ensureElement } from '../../utils/utils';
import { CDN_URL } from "../../utils/constants";

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

    protected inBasket: boolean = false;
    private categoryMap: Record<string, string> = {
        'софт-скил': 'soft',
        'хард-скил': 'hard',
        'кнопка': 'button',
        'дополнительное': 'additional',
        'другое': 'other'
    };

    constructor(protected events: IEvents, container: HTMLElement) {
        super(container);

        this.text = ensureElement('.card__text', this.container);
        this.image = ensureElement<HTMLImageElement>('.card__image', this.container);
        this.button = ensureElement<HTMLButtonElement>('.card__button', this.container);
        this.category = ensureElement('.card__category', this.container);

        this.button.addEventListener('click', () => this.toggleBasket());
        this.updateButton();
    }

    set basketState(value: boolean) {
        this.inBasket = value;
        this.updateButton();
    }

    private toggleBasket() {
        this.inBasket = !this.inBasket;

        this.events.emit<{ id: string }>(
            this.inBasket ? 'basket:add' : 'basket:remove',
            { id: this.id }
        );
        this.updateButton();
    }

    private updateButton() {
        const disabled = this.isPriceless;
        this.button.disabled = disabled;

        if (disabled) {
            this.button.textContent = 'Недоступно';
            return;
        }
        
        this.button.textContent = this.inBasket ? 'Удалить из корзины' : 'Купить';
    }

    set categoryName(value: string) {
        this.category.textContent = value; 
        this.category.className = 'card__category'; 
        const modifier = this.categoryMap[value] ?? 'other';
        this.category.classList.add(`card__category_${modifier}`);
    }

    set description(value: string) {
        this.text.textContent = value;
    }

    set imageSrc(value: string) {
        this.setImage(this.image, `${CDN_URL}${value.replace(/\.svg$/i, '.png')}`);
    }
}