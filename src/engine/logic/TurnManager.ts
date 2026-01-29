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
                        c.events.emit('onDomainMessage', {
                            id: `react-potion-${Date.now()}`,
                            message: `⚡ REAÇÃO: ${c.name} está em perigo e usa uma poção automaticamente!`
                        });
                        c.inventory.useItem(potion.id, c);
                    }
                }
            });

            c.events.subscribe('onHeal', (data) => {
                c.events.emit('onDomainMessage', {
                    id: `heal-msg-${Date.now()}`,
                    message: `❤️ ${c.name} foi curado!`
                });
            });
        });
    }

    public async startCombat(): Promise<CombatOutcome> {
        this.emitStatus('STARTING');
        this.emitGlobal('🔥 O combate começou!');
        await wait(1000);

        while (this.isCombatOngoing()) {
            this.turnCount++;
            this.emitGlobal(`\n--- Rodada ${this.turnCount} ---`);
            await wait(800);

            for (const actor of this.combatants) {
                if (!actor.isAlive()) continue;

                if (actor.isPlayer) {
                    this.emitStatus('PLAYER_TURN');
                    const choice = await this.getPlayerChoice(actor);

                    if (choice === 'Fled') {
                        const outcome: CombatOutcome = { result: CombatResult.FLED };
                        this.emitCombatEnd(outcome);
                        return outcome;
                    }
                    if (choice === 'Item') {
                        await this.handlePlayerItemUsage(actor as Character);
                    }
                    if (choice === 'Attack') {
                        const target = this.combatants.find(c => c !== actor && c.isAlive());
                        if (target) await CombatSystem.resolveAttack(actor, target);
                    }
                } else {
                    this.emitStatus('ENEMY_TURN');
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
        const outcome: CombatOutcome = {
            result: winner?.isPlayer ? CombatResult.VICTORY : CombatResult.DEFEAT,
            winner: winner
        };

        this.emitGlobal(`\n🏆 Vencedor: ${winner ? winner.name : "Ninguém (Empate)"}`);
        this.emitGlobal("-----------------------");

        this.emitCombatEnd(outcome);
        return outcome;
    }

    private emitStatus(status: any) {
        this.combatants.forEach(c => {
            if (c instanceof Character) {
                c.events.emit('onCombatStatusChange', { status });
            }
        });
    }

    private emitCombatEnd(outcome: CombatOutcome) {
        let result: 'VICTORY' | 'DEFEAT' | 'FLED' = 'DEFEAT';
        if (outcome.result === CombatResult.VICTORY) result = 'VICTORY';
        if (outcome.result === CombatResult.FLED) result = 'FLED';

        this.emitStatus('ENDED');
        this.combatants.forEach(c => {
            if (c instanceof Character) {
                c.events.emit('onCombatEnd', {
                    result,
                    winner: outcome.winner?.name || null
                });
            }
        });
    }

    private emitGlobal(message: string) {
        this.combatants.forEach(c => {
            if (c instanceof Character) {
                // Generate a unique ID for React stability
                const id = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
                c.events.emit('onDomainMessage', { id, message });
            }
        });
    }

    private async handlePlayerItemUsage(actor: Character) {
        const items = actor.inventory.getItems();
        if (items.length === 0) {
            actor.events.emit('onDomainMessage', {
                id: `empty-inv-${Date.now()}`,
                message: "\nInventário vazio!"
            });
            return;
        }

        if (this.inputProvider) {
            const itemOptions = items.map(i => ({
                id: i.id,
                label: `${i.name} (${i.description})`
            }));

            const selectedId = await this.inputProvider.requestChoice(
                'Qual item deseja usar?',
                itemOptions,
                { actorName: actor.name, type: 'ADVENTURE_DECISION', metadata: { subType: 'ITEM_USAGE' } }
            );

            if (selectedId) {
                actor.inventory.useItem(selectedId, actor);
            }
        }
    }

    private async getPlayerChoice(actor: Combatant): Promise<'Attack' | 'Fled' | 'Item'> {
        if (this.inputProvider) {
            const options = [
                { id: 'ATTACK', label: 'Atacar' },
                { id: 'ITEM', label: 'Usar Item' },
                { id: 'FLEE', label: 'Fugir' }
            ];

            const id = await this.inputProvider.requestChoice(
                `Turno de ${actor.name}. O que deseja fazer?`,
                options,
                { actorName: actor.name, type: 'COMBAT_REACTION' }
            );

            if (id === 'ATTACK') return 'Attack';
            if (id === 'ITEM') return 'Item';
            if (id === 'FLEE') return 'Fled';
        }

        return 'Attack';
    }

    private isCombatOngoing(): boolean {
        return this.combatants.filter(c => c.isAlive()).length > 1;
    }
}
