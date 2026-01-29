import { Combatant } from "./Combatant";

export enum ItemType {
    CONSUMABLE = 'CONSUMABLE',
    WEAPON = 'WEAPON',
    ARMOR = 'ARMOR',
    ACCESSORY = 'ACCESSORY'
}

export enum Rarity {
    COMMON = 'COMMON',
    RARE = 'RARE',
    EPIC = 'EPIC',
    LEGENDARY = 'LEGENDARY'
}

export interface Effect {
    type: string;
    value: number;
    description: string;
    apply(target: Combatant): void;
}

export interface Item {
    id: string;
    name: string;
    type: ItemType;
    rarity: Rarity;
    level: number;
    effects: Effect[];
    description: string;
}

export interface Consumable extends Item {
    type: ItemType.CONSUMABLE;
    uses: number;
}

export interface Equippable extends Item {
    type: ItemType.WEAPON | ItemType.ARMOR | ItemType.ACCESSORY;
    isEquipped: boolean;
}
