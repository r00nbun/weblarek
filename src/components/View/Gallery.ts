import { IEvents } from '../base/Events';
import { CardCatalog } from './CardCatalog';
import { cloneTemplate } from '../../utils/utils';
import { IProduct } from '../../types';

export class GalleryView {
    protected container: HTMLElement;

    constructor(protected events: IEvents, container: HTMLElement) {
        this.container = container;
    }

    render(products: IProduct[]) {
        const cards: HTMLElement[] = products.map(product => {
            const card = new CardCatalog(this.events, cloneTemplate('#card-catalog'));
            card.render({
                id: product.id,
                title: product.title,
                price: product.price ?? 0,
                image: product.image,
                category: product.category
            });
            return card.render();
        });

        this.container.replaceChildren(...cards);
    }
}