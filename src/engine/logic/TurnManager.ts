import { Combatant } from "../core/Combatant";
import { ReactionType } from "../core/CombatTypes";
import { wait } from "../utils/wait";
import { Character } from "../entities/Character";
import { ItemType } from '../core/Item';
import { CombatSystem } from './CombatSystem';
import { InputProvider } from "../core/InputProvider";

export enum CombatResult {
    VICTORY,
    DEFEAT,
    FLED
}

export interface CombatOutcome {
    result: CombatResult;
    winner?: Combatant;
}

export class TurnManager {
    private combatants: Combatant[];
    private turnCount: number = 0;
    private inputProvider?: InputProvider;

    constructor(combatants: Combatant[], inputProvider?: InputProvider) {
        this.combatants = [...combatants].sort((a, b) => b.speed - a.speed);
        this.inputProvider = inputProvider;

        // Inject input provider to all characters
        this.combatants.forEach(c => {
            if (c instanceof Character) c.inputProvider = this.inputProvider;
        });

        this.setupReactions();
    }

    private setupReactions() {
        this.combatants.forEach(c => {
            if (!(c instanceof Character)) return;

            c.events.subscribe('onDamage', (data) => {
                if (data.currentLife < c.maxLife * 0.25) {
                    const potion = c.inventory.getItems().find(i => i.type === ItemType.CONSUMABLE && i.name.includes('Poção'));
                    if (potion) {
                        c.events.emit('onDomainMessage', { message: `⚡ REAÇÃO: ${c.name} está em perigo e usa uma poção automaticamente!` });
                        c.inventory.useItem(potion.id, c);
                    }
                }
            });

            c.events.subscribe('onHeal', (data) => {
                c.events.emit('onDomainMessage', { message: `❤️ ${c.name} foi curado!` });
            });
        });
    }

    public async startCombat(): Promise<CombatOutcome> {
        this.emitGlobal('🔥 O combate começou!');
        await wait(1000);

        while (this.isCombatOngoing()) {
            this.turnCount++;
            this.emitGlobal(`\n--- Rodada ${this.turnCount} ---`);
            await wait(800);

            for (const actor of this.combatants) {
                if (!actor.isAlive()) continue;

                if (actor.isPlayer) {
                    const choice = await this.getPlayerChoice(actor);

                    if (choice === 'Fled') return { result: CombatResult.FLED };
                    if (choice === 'Item') {
                        await this.handlePlayerItemUsage(actor as Character);
                    }
                    if (choice === 'Attack') {
                        const target = this.combatants.find(c => c !== actor && c.isAlive());
                        if (target) await CombatSystem.resolveAttack(actor, target);
                    }
                } else {
                    // Enemy turn AI
                    const target = this.combatants.find(c => c !== actor && c.isAlive());
                    if (target) {
                        await CombatSystem.resolveAttack(actor, target);
                    }
                }

                await wait(1000);
                if (!this.isCombatOngoing()) break;
            }
        }

        const winner = this.combatants.find(c => c.isAlive());
        const playerWon = winner?.isPlayer || false;

        this.emitGlobal(`\n🏆 Vencedor: ${winner ? winner.name : "Ninguém (Empate)"}`);
        this.emitGlobal("-----------------------");

        return {
            result: playerWon ? CombatResult.VICTORY : CombatResult.DEFEAT,
            winner: winner
        };
    }

    private emitGlobal(message: string) {
        this.combatants.forEach(c => {
            if (c instanceof Character) {
                c.events.emit('onDomainMessage', { message });
            }
        });
    }

    private async handlePlayerItemUsage(actor: Character) {
        const items = actor.inventory.getItems();
        if (items.length === 0) {
            actor.events.emit('onDomainMessage', { message: "\nInventário vazio!" });
            return;
        }

        if (this.inputProvider) {
            const itemOptions = items.map(i => `${i.name} (${i.description})`);
            const index = await this.inputProvider.requestChoice('Qual item deseja usar?', itemOptions);

            if (index !== -1) {
                actor.inventory.useItem(items[index].id, actor);
            }
        }
    }

    private async getPlayerChoice(actor: Combatant): Promise<'Attack' | 'Fled' | 'Item'> {
        if (this.inputProvider) {
            const options = ['Atacar', 'Usar Item', 'Fugir'];
            const index = await this.inputProvider.requestChoice(`Turno de ${actor.name}. O que deseja fazer?`, options);

            if (index === 0) return 'Attack';
            if (index === 1) return 'Item';
            if (index === 2) return 'Fled';
        }

        return 'Attack';
    }

    private isCombatOngoing(): boolean {
        return this.combatants.filter(c => c.isAlive()).length > 1;
    }
}
