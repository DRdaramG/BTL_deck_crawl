import type {
  CardDefinition,
  PlacedEquipment,
} from "../../data/types";
import { CARDS, EQUIPMENT } from "../../data";

export interface CardInstance {
  instanceId: string;
  cardId: string;
}

export class Deck {
  private queue: CardInstance[] = [];
  private hand: CardInstance[] = [];
  private exhaust: CardInstance[] = [];
  private exclude: CardInstance[] = [];

  constructor() {
    // Piles are initialized empty; call buildFromEquipment to populate.
  }

  /** Build deck from placed equipment, creating card instances and shuffling. */
  buildFromEquipment(placedEquipment: PlacedEquipment[]): void {
    this.queue = [];
    this.hand = [];
    this.exhaust = [];
    this.exclude = [];

    for (const placed of placedEquipment) {
      const equipDef = EQUIPMENT[placed.equipmentId];
      if (!equipDef) continue;

      for (const provided of equipDef.providedCards) {
        for (let i = 0; i < provided.count; i++) {
          this.queue.push({
            instanceId: crypto.randomUUID(),
            cardId: provided.cardId,
          });
        }
      }
    }

    this.shuffle();
  }

  /** Fisher-Yates shuffle on the draw pile. */
  shuffle(): void {
    const arr = this.queue;
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const temp = arr[i]!;
      arr[i] = arr[j]!;
      arr[j] = temp;
    }
  }

  /** Draw up to `count` cards from queue to hand. Reloads if queue is empty. */
  draw(count: number): CardInstance[] {
    const drawn: CardInstance[] = [];

    for (let i = 0; i < count; i++) {
      if (this.queue.length === 0) {
        if (this.exhaust.length === 0) break;
        this.reload();
      }

      const card = this.queue.pop();
      if (!card) break;

      this.hand.push(card);
      drawn.push(card);
    }

    return drawn;
  }

  /** Move all exhaust cards back to queue and shuffle. */
  reload(): void {
    this.queue.push(...this.exhaust);
    this.exhaust = [];
    this.shuffle();
  }

  /** Play a card from hand: move to exhaust and return it. */
  playCard(instanceId: string): CardInstance | null {
    const idx = this.hand.findIndex((c) => c.instanceId === instanceId);
    if (idx === -1) return null;

    const card = this.hand.splice(idx, 1)[0]!;
    this.exhaust.push(card);
    return card;
  }

  /** Discard all cards in hand to exhaust. */
  discardHand(): void {
    this.exhaust.push(...this.hand);
    this.hand = [];
  }

  /** Permanently remove a card from any pile. Returns true if found. */
  excludeCard(instanceId: string): boolean {
    const piles: CardInstance[][] = [
      this.hand,
      this.queue,
      this.exhaust,
    ];

    for (const pile of piles) {
      const idx = pile.findIndex((c) => c.instanceId === instanceId);
      if (idx !== -1) {
        const card = pile.splice(idx, 1)[0]!;
        this.exclude.push(card);
        return true;
      }
    }

    return false;
  }

  getHand(): CardInstance[] {
    return [...this.hand];
  }

  getQueueSize(): number {
    return this.queue.length;
  }

  getExhaustSize(): number {
    return this.exhaust.length;
  }

  getExcludeSize(): number {
    return this.exclude.length;
  }

  /** Resolve a cardId to its static definition. */
  static getDefinition(cardId: string): CardDefinition | undefined {
    return CARDS[cardId];
  }
}
