import { Item, Consumable, ItemType, Equippable } from "./Item";
import { Combatant } from "./Combatant";

export class Inventory {
    private items: Item[] = [];
    private maxCapacity: number = 20;

    constructor(initialItems: Item[] = []) {
        this.items = initialItems;
    }

    public addItem(item: Item): boolean {
        if (this.items.length >= this.maxCapacity) {
            console.log("❌ Inventário cheio!");
            return false;
        }
        this.items.push(item);
        console.log(`📦 ${item.name} adicionado ao inventário.`);
        return true;
    }

    public removeItem(itemId: string): Item | null {
        const index = this.items.findIndex(i => i.id === itemId);
        if (index !== -1) {
            return this.items.splice(index, 1)[0];
        }
        return null;
    }

    public useItem(itemId: string, target: Combatant): boolean {
        const item = this.items.find(i => i.id === itemId);
        if (!item) return false;

        if (item.type === ItemType.CONSUMABLE) {
            const consumable = item as Consumable;
            consumable.effects.forEach(effect => effect.apply(target));
            consumable.uses--;
            if (consumable.uses <= 0) {
                this.removeItem(itemId);
            }
            return true;
        }

        console.log("❌ Este item não pode ser usado assim.");
        return false;
    }

    public getItems(): Item[] {
        return [...this.items];
    }

    public toSaveData(): any[] {
        return this.items.map(item => ({
            ...item,
            // We need to handle effects carefully if they are classes
            effects: item.effects.map(e => ({ type: e.type, value: (e as any).value, description: e.description }))
        }));
    }

    public static fromSaveData(data: any[]): Inventory {
        // Here we would rebuild the Item objects, potentially using the ItemFactory or a similar rehydration logic
        // For simplicity in this demo, we'll assume the data is mostly matches.
        return new Inventory(data as Item[]);
    }
}
