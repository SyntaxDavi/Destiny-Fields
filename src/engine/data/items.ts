import { ItemType, Rarity } from "../core/Item";

export interface ItemTemplate {
    name: string;
    description: string;
    type: ItemType;
    rarity: Rarity;
    baseValue: number;
}

export const ITEM_TEMPLATES = {
    POTIONS: [
        { name: "Pequena Poção de Vida", description: "Cura 20 HP.", type: ItemType.CONSUMABLE, rarity: Rarity.COMMON, baseValue: 20 },
        { name: "Poção de Vida Média", description: "Cura 50 HP.", type: ItemType.CONSUMABLE, rarity: Rarity.RARE, baseValue: 50 },
        { name: "Grande Poção de Vida", description: "Cura 100 HP.", type: ItemType.CONSUMABLE, rarity: Rarity.EPIC, baseValue: 100 },
    ],
    SWORDS: [
        { name: "Adaga de Ferrugem", description: "+5 Dano.", type: ItemType.WEAPON, rarity: Rarity.COMMON, baseValue: 5 },
        { name: "Espada Curta", description: "+12 Dano.", type: ItemType.WEAPON, rarity: Rarity.COMMON, baseValue: 12 },
        { name: "Espada de Ferro", description: "+20 Dano.", type: ItemType.WEAPON, rarity: Rarity.RARE, baseValue: 20 },
        { name: "Lâmina de Aço", description: "+35 Dano.", type: ItemType.WEAPON, rarity: Rarity.EPIC, baseValue: 35 },
        { name: "Zweihänder", description: "+60 Dano.", type: ItemType.WEAPON, rarity: Rarity.LEGENDARY, baseValue: 60 },
    ],
    SHIELDS: [
        { name: "Broquel de Couro", description: "+2 Defesa.", type: ItemType.ARMOR, rarity: Rarity.COMMON, baseValue: 2 },
        { name: "Escudo de Madeira", description: "+5 Defesa.", type: ItemType.ARMOR, rarity: Rarity.COMMON, baseValue: 5 },
        { name: "Escudo de Ferro", description: "+12 Defesa.", type: ItemType.ARMOR, rarity: Rarity.RARE, baseValue: 12 },
    ],
    STAVES: [
        { name: "Cajado de Carvalho", description: "+10 Magia.", type: ItemType.WEAPON, rarity: Rarity.COMMON, baseValue: 10 },
        { name: "Cajado de Aprendiz", description: "+25 Magia.", type: ItemType.WEAPON, rarity: Rarity.RARE, baseValue: 25 },
        { name: "Varinha de Cristal", description: "+50 Magia.", type: ItemType.WEAPON, rarity: Rarity.EPIC, baseValue: 50 },
    ]
};
