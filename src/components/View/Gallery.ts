import { EventEmitter } from '../base/Events';

export class Gallery {
  protected container: HTMLElement;
  protected events: EventEmitter;

  constructor(events: EventEmitter, container: HTMLElement) {
    this.events = events;
    this.container = container;
  }

  render(cards: HTMLElement[]): void {
    this.container.replaceChildren(...cards);
  }

  set items(cards: (HTMLElement | { render: () => HTMLElement })[]) {
    const elements = cards.map(card => 
      'render' in card ? card.render() : card
    );
    this.render(elements);
  }

  clear(): void {
    this.container.replaceChildren();
  }
}