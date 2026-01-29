import { Item, ItemType, Rarity, Effect, Consumable, Equippable } from "./Item";
import { ITEM_TEMPLATES } from "../data/items";

class HealEffect implements Effect {
    constructor(public value: number, public description: string) { }
    type = 'HEAL';
    apply(target: any): void {
        target.currentLife = Math.min(target.maxLife, target.currentLife + this.value);
    }
}

class DamageEffect implements Effect {
    constructor(public value: number, public description: string) { }
    type = 'DAMAGE';
    apply(target: any): void {
        target.takeDamage(this.value);
    }
}

export class ItemFactory {
    public static createRandomItem(level: number): Item {
        const roll = Math.random();

        if (roll < 0.4) return this.createPotion(level);
        if (roll < 0.7) return this.createWeapon(level);
        return this.createArmor(level);
    }

    private static createPotion(level: number): Item {
        const templates = ITEM_TEMPLATES.POTIONS;
        const roll = Math.random();
        const template = roll < 0.1 ? templates[2] : (roll < 0.4 ? templates[1] : templates[0]);

        return {
            id: Math.random().toString(36).substr(2, 9),
            ...template,
            level,
            effects: [new HealEffect(template.baseValue, template.description)],
            uses: 1
        } as Consumable;
    }

    private static createWeapon(level: number): Item {
        const templates = Math.random() > 0.8 ? ITEM_TEMPLATES.STAVES : ITEM_TEMPLATES.SWORDS;
        const template = templates[Math.floor(Math.random() * templates.length)];

        const scaledDamage = template.baseValue + (level * 2);

        return {
            id: Math.random().toString(36).substr(2, 9),
            ...template,
            level,
            isEquipped: false,
            effects: [new DamageEffect(scaledDamage, template.description)],
            statModifiers: { damage: scaledDamage }
        } as Equippable;
    }

    private static createArmor(level: number): Item {
        const templates = ITEM_TEMPLATES.SHIELDS;
        const template = templates[Math.floor(Math.random() * templates.length)];

        const scaledDefense = template.baseValue + Math.floor(level / 2);

        return {
            id: Math.random().toString(36).substr(2, 9),
            ...template,
            level,
            isEquipped: false,
            effects: [],
            statModifiers: { defense: scaledDefense }
        } as Equippable;
    }

    public static createFallbackItem(): Item {
        return {
            id: 'fallback',
            name: 'Pão Velho',
            description: 'Melhor que nada.',
            type: ItemType.CONSUMABLE,
            rarity: Rarity.COMMON,
            level: 1,
            effects: [new HealEffect(5, 'Cura 5 HP')],
            uses: 1
        } as Consumable;
    }

    public static rehydrate(data: any): Item {
        const effects = (data.effects || []).map((e: any) => {
            if (e.type === 'HEAL') return new HealEffect(e.value, e.description);
            if (e.type === 'DAMAGE') return new DamageEffect(e.value, e.description);
            return e;
        });

        return {
            ...data,
            effects
        };
    }
}
