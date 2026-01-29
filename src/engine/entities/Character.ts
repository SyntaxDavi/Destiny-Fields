import { Combatant } from "../core/Combatant";
import { Inventory } from "../core/Inventory";
import { EventBus } from "../core/EventBus";
import { Item } from "../core/Item";
import { ReactionType } from "../core/CombatTypes";
import { InputProvider } from "../core/InputProvider";

export interface CharacterConfig {
    name: string;
    maxLife?: number;
    currentLife?: number;
    weaponDamage?: number;
    weaponName?: string;
    speed?: number;
    agility?: number;
    dexterity?: number;
    speech?: number;
    intelligence?: number;
    persistence?: number;
    gold?: number;
    level?: number;
    xp?: number;
    xpToNextLevel?: number;
    className?: string;
    isPlayer?: boolean;
    inventoryData?: any[];
}

export class Character implements Combatant {
    public name: string;
    public currentLife: number;
    public maxLife: number;
    public speed: number;
    public weaponDamage: number;
    public weaponName: string;
    public gold: number = 0;
    public level: number = 1;
    public xp: number = 0;
    public xpToNextLevel: number = 100;
    public isPlayer: boolean;
    public className: string;

    public inventory: Inventory;
    public events: EventBus = new EventBus();

    // Atributos
    public agility: number;
    public dexterity: number;
    public speech: number;
    public intelligence: number;
    public persistence: number;

    public inputProvider?: InputProvider;

    constructor(config: CharacterConfig) {
        this.name = config.name;
        this.maxLife = config.maxLife || 100;
        this.currentLife = config.currentLife ?? this.maxLife;
        this.weaponDamage = config.weaponDamage || 15;
        this.weaponName = config.weaponName || "Espada";
        this.speed = config.speed || 10;
        this.agility = config.agility || 10;
        this.dexterity = config.dexterity || 10;
        this.speech = config.speech || 10;
        this.intelligence = config.intelligence || 10;
        this.persistence = config.persistence || 10;
        this.gold = config.gold || 0;
        this.level = config.level || 1;
        this.xp = config.xp || 0;
        this.xpToNextLevel = config.xpToNextLevel || 100;
        this.isPlayer = config.isPlayer || false;
        this.className = config.className || "Aventureiro";

        this.inventory = config.inventoryData ? Inventory.fromSaveData(config.inventoryData) : new Inventory();
    }

    public isAlive(): boolean {
        return this.currentLife > 0;
    }

    public async handleReaction(attacker: Combatant): Promise<ReactionType> {
        if (!this.isPlayer) {
            // IA Reaction Logic
            const roll = Math.random();
            if (roll > 0.8) return ReactionType.DODGE;
            if (roll > 0.6) return ReactionType.COUNTER;
            return ReactionType.NONE;
        }

        // Web/Async UI Reaction
        if (this.inputProvider) {
            const id = await this.inputProvider.requestChoice(
                `${this.name.toUpperCase()} está sendo atacado por ${attacker.name}!`,
                [
                    { id: 'NONE', label: 'Receber Golpe' },
                    { id: 'DODGE', label: 'Tentar Esquivar' },
                    { id: 'COUNTER', label: 'Preparar Contra-ataque' }
                ],
                { actorName: this.name, type: 'COMBAT_REACTION', metadata: { attackerName: attacker.name } }
            );

            switch (id) {
                case 'DODGE': return ReactionType.DODGE;
                case 'COUNTER': return ReactionType.COUNTER;
                default: return ReactionType.NONE;
            }
        }

        return ReactionType.NONE;
    }

    public toSaveData(): CharacterConfig {
        return {
            name: this.name,
            maxLife: this.maxLife,
            currentLife: this.currentLife,
            weaponDamage: this.weaponDamage,
            weaponName: this.weaponName,
            speed: this.speed,
            agility: this.agility,
            dexterity: this.dexterity,
            speech: this.speech,
            intelligence: this.intelligence,
            persistence: this.persistence,
            gold: this.gold,
            level: this.level,
            xp: this.xp,
            xpToNextLevel: this.xpToNextLevel,
            isPlayer: this.isPlayer,
            className: this.className,
            inventoryData: this.inventory.toSaveData()
        };
    }

    public fromSaveData(data: Partial<CharacterConfig>): void {
        if (data.level) this.level = data.level;
        if (data.xp !== undefined) this.xp = data.xp;
        if (data.xpToNextLevel) this.xpToNextLevel = data.xpToNextLevel;

        if (data.maxLife) this.maxLife = data.maxLife;
        if (data.currentLife !== undefined) {
            this.currentLife = data.currentLife; // Pure restoration
        }

        if (data.gold !== undefined) this.gold = data.gold;
        if (data.agility) this.agility = data.agility;
        if (data.dexterity) this.dexterity = data.dexterity;
        if (data.className) this.className = data.className;

        if (data.inventoryData) {
            this.inventory = Inventory.fromSaveData(data.inventoryData);
        }
    }

    public getModifier(stat: number): number {
        return Math.floor((stat - 10) / 2);
    }

    public takeDamage(damage: number) {
        if (this.currentLife <= 0) return;

        this.currentLife -= damage;
        this.events.emit('onDamage', { damage, currentLife: this.currentLife });

        if (this.currentLife <= 0) {
            this.currentLife = 0;
            this.events.emit('onDeath', { entityName: this.name });
        } else {
            // HP status logging moved to UI/Bridge
        }
    }

    public gainXp(amount: number): void {
        this.xp += amount;
        this.events.emit('onDomainMessage', { id: `xp-${this.name}-${Date.now()}`, message: `✨ ${this.name} ganhou ${amount} de XP!` });

        while (this.xp >= this.xpToNextLevel) {
            this.levelUp();
        }
    }

    public levelUp(): void {
        this.level++;
        this.xp -= this.xpToNextLevel;
        this.xpToNextLevel = Math.floor(this.xpToNextLevel * 1.5);

        const hpBonus = 20;
        const damageBonus = 5;

        this.maxLife += hpBonus;
        this.currentLife = this.maxLife;
        this.weaponDamage += damageBonus;

        this.events.emit('onDomainMessage', { id: `lvl-${this.name}-${Date.now()}`, message: `\n🌟 LEVEL UP! ${this.name} atingiu o nível ${this.level}!` });
        this.events.emit('onDomainMessage', { id: `stats-${this.name}-${Date.now()}`, message: `   HP Máximo: ${this.maxLife} | Dano: ${this.weaponDamage}` });
    }

    public restoreFullLife(): void {
        this.currentLife = this.maxLife;
        this.events.emit('onHeal', { amount: this.maxLife });
    }

    public addRewards(gold: number, xp: number): void {
        this.gold += gold;
        this.gainXp(xp);
    }

    public addItem(item: Item): void {
        this.inventory.addItem(item);
        this.events.emit('onInventoryChange', { inventory: this.inventory.getItems() });
    }

    public useItem(itemId: string): boolean {
        const success = this.inventory.useItem(itemId, this);
        if (success) {
            this.events.emit('onInventoryChange', { inventory: this.inventory.getItems() });
        }
        return success;
    }

    public getInventoryItems(): Item[] {
        return this.inventory.getItems();
    }
}
