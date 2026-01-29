import { Character } from '../entities/Character';
import { TurnManager, CombatResult } from './TurnManager';
import { enemies } from '../data/enemies';
import { SaveManager } from './SaveManager';
import { ItemFactory } from '../core/ItemFactory';
import { RunContext } from './RunContext';

function wait(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}

export class AdventureManager {
    private hero: Character;
    private runContext: RunContext = new RunContext();

    // Callbacks for Engine State (Injected by GameBridge)
    public onEncounterStart?: (enemy: Character) => void;
    public onEncounterEnd?: () => void;

    constructor(hero: Character) {
        this.hero = hero;
    }

    public async startCombat(): Promise<void> {
        await this.handleEncounter();
    }

    public async handleEncounter(enemyData?: any): Promise<any> {
        // Se não for passado um inimigo específico, sorteia um da lista
        const data = enemyData || this.getRandomEnemyData();

        const enemy = new Character({
            name: data.name,
            maxLife: data.hp,
            weaponDamage: data.damage,
            weaponName: data.weapon || "Garra",
            speed: data.speed || 10,
            agility: data.agility || 10,
            dexterity: data.dexterity || 10,
            isPlayer: false
        });

        // Notify Engine (GameBridge) about the active enemy
        this.onEncounterStart?.(enemy);

        const combat = new TurnManager([this.hero, enemy], this.hero.inputProvider);
        const outcome = await combat.startCombat();

        if (outcome.result === CombatResult.VICTORY) {
            const minGold = data.goldRewardRange ? data.goldRewardRange[0] : 10;
            const maxGold = data.goldRewardRange ? data.goldRewardRange[1] : 50;
            const goldReward = Math.floor(Math.random() * (maxGold - minGold + 1)) + minGold;
            const xpReward = data.xpReward || 20;

            this.hero.addRewards(goldReward, xpReward);

            // Item drop logic scaled by level
            if (Math.random() > 0.4) {
                const item = ItemFactory.createRandomItem(this.hero.level);
                this.hero.events.emit('onDomainMessage', {
                    id: `loot-${Date.now()}`,
                    message: `💎 Saque encontrado: ${item.name}!`
                });
                this.hero.addItem(item);
            }
        }

        // Notify Engine to clear enemy
        this.onEncounterEnd?.();
        return outcome;
    }

    private getRandomEnemyData(): any {
        const normalEnemies = enemies.filter(e => !e.isBoss);
        const randomIndex = Math.floor(Math.random() * normalEnemies.length);
        return normalEnemies[randomIndex];
    }

    // CLI Legacy Methods (Commented out to enable browser bundling)
    /*
    public async start(): Promise<void> { ... }
    private async exploreBiomePipeline(): Promise<void> { ... }
    private async spawnRandomEncounter(): Promise<void> { ... }
    private async spawnBossEncounter(): Promise<void> { ... }
    private showBiomeMenu(): number { ... }
    private async showPostCombatMenu(): Promise<boolean> { ... }
    private showInventoryMenu() { ... }
    */
}
