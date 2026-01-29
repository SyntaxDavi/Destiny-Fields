export interface EnemyData {
    name: string;
    hp: number;
    damage: number;
    weapon: string;
    speed: number;
    agility: number;
    dexterity: number;
    goldRewardRange: [number, number];
    xpReward: number;
    isBoss?: boolean;
}

export const enemies: EnemyData[] = [
    {
        name: "Goblin Lanceiro",
        hp: 40,
        damage: 10,
        weapon: "Lança Curta",
        speed: 15,
        agility: 14,
        dexterity: 12,
        goldRewardRange: [5, 15],
        xpReward: 30
    },
    {
        name: "Slime",
        hp: 30,
        damage: 8,
        weapon: "Gosma",
        speed: 5,
        agility: 4,
        dexterity: 6,
        goldRewardRange: [2, 8],
        xpReward: 20
    },
    {
        name: "Ogro",
        hp: 120,
        damage: 25,
        weapon: "Porrete Gigante",
        speed: 6,
        agility: 5,
        dexterity: 8,
        goldRewardRange: [20, 50],
        xpReward: 80
    },
    {
        name: "Golem de Pedra",
        hp: 300,
        damage: 40,
        weapon: "Punhos de Rocha",
        speed: 4,
        agility: 2,
        dexterity: 10,
        goldRewardRange: [200, 500],
        xpReward: 500,
        isBoss: true
    }
];
