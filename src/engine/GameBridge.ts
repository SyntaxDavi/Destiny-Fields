import { ChoiceOption, ChoiceContext, InputProvider } from "./core/InputProvider";
import { CombatStatus } from "./core/EventBus";
import { LogEntry } from "../components/combat/LogTypes";
import { Character } from "./entities/Character";
import { AdventureManager } from "./logic/AdventureManager";
import { SaveManager } from "./logic/SaveManager";

interface ChoiceRequest {
    resolve: (value: string) => void;
    reject: (reason?: Error) => void;
    timeout?: NodeJS.Timeout;
}

export class GameBridge implements InputProvider {
    private static instance: GameBridge | null = null;

    public hero: Character | null = null;
    public activeEnemy: Character | null = null;
    public adventure: AdventureManager | null = null;

    public combatStatus: CombatStatus = 'IDLE';
    public lastCombatResult: 'VICTORY' | 'DEFEAT' | 'FLED' | null = null;

    private pendingChoice: ChoiceRequest | null = null;
    private eventUnsubscribers: Array<() => void> = [];

    // UI Callbacks
    public onChoiceRequest: ((title: string, options: ChoiceOption[], context: ChoiceContext) => void) | null = null;
    public onConfirmationRequest: ((message: string) => void) | null = null;
    public onLog: ((entry: LogEntry) => void) | null = null;
    public onCombatStatusChange: ((status: CombatStatus) => void) | null = null;

    private constructor() { }

    public static getInstance(): GameBridge {
        if (!GameBridge.instance) {
            GameBridge.instance = new GameBridge();
        }
        return GameBridge.instance;
    }

    /**
     * Cleanup singleton instance (useful for testing or game reset)
     */
    public static destroy(): void {
        if (GameBridge.instance) {
            GameBridge.instance.dispose();
            GameBridge.instance = null;
        }
    }

    // ─── InputProvider Implementation ───

    async requestChoice(
        title: string,
        options: ChoiceOption[],
        context: ChoiceContext,
        timeoutMs?: number
    ): Promise<string> {
        if (this.pendingChoice) {
            throw new Error("Another choice request is already pending");
        }

        return new Promise((resolve, reject) => {
            this.pendingChoice = { resolve, reject };

            // Optional timeout handling
            if (timeoutMs) {
                this.pendingChoice.timeout = setTimeout(() => {
                    this.rejectPendingChoice(new Error("Choice request timeout"));
                }, timeoutMs);
            }

            if (this.onChoiceRequest) {
                this.onChoiceRequest(title, options, context);
            } else {
                reject(new Error("No UI handler registered for choice requests"));
            }
        });
    }

    async requestConfirmation(message: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            // Store as a "choice" between Yes (TRUE) and No (FALSE)
            this.pendingChoice = {
                resolve: (id: string) => resolve(id === 'YES'),
                reject,
            };

            if (this.onConfirmationRequest) {
                this.onConfirmationRequest(message);
            } else if (this.onChoiceRequest) {
                // Fallback to choice request if no specific confirmation handler
                this.onChoiceRequest(message, [{ id: 'YES', label: 'Sim' }, { id: 'NO', label: 'Não' }], {
                    actorName: 'System',
                    type: 'CAMP_ACTION'
                });
            } else {
                reject(new Error("No UI handler registered for confirmation"));
            }
        });
    }

    /**
     * Resolve the current pending choice with a selection ID
     */
    public resolveChoice(id: string): void {
        if (!this.pendingChoice) {
            console.warn("No pending choice to resolve");
            return;
        }

        const { resolve } = this.pendingChoice;
        this.clearPendingChoice();
        resolve(id);
    }

    /**
     * Cancel the current pending request (e.g., user closed modal)
     */
    public cancelChoice(reason = "User cancelled"): void {
        this.rejectPendingChoice(new Error(reason));
    }

    /**
     * Get a snapshot of the hero's status for the UI
     */
    public getHeroStatus() {
        if (!this.hero) return null;
        return {
            name: this.hero.name,
            hp: this.hero.currentLife,
            maxHp: this.hero.maxLife,
            level: this.hero.level,
            gold: this.hero.gold || 0,
            xp: this.hero.xp,
            xpToNextLevel: this.hero.xpToNextLevel
        };
    }

    /**
     * Get a snapshot of the active enemy's status for the UI
     */
    public getEnemyStatus() {
        if (!this.activeEnemy) return null;
        return {
            name: this.activeEnemy.name,
            hp: this.activeEnemy.currentLife,
            maxHp: this.activeEnemy.maxLife
        };
    }

    /**
     * Get the hero's inventory items
     */
    public getHeroInventory(): any[] {
        return this.hero?.getInventoryItems() || [];
    }

    /**
     * Initialize a new hero and adventure
     */
    public initHero(name: string, className: 'Tanque' | 'Mago' | string): void {
        this.dispose(); // Cleanup existing game state

        const baseStats = {
            name,
            maxLife: className === 'Tanque' ? 150 : 100,
            weaponDamage: className === 'Mago' ? 25 : 15,
            isPlayer: true,
            className: className
        };

        this.hero = new Character(baseStats);
        this.hero.inputProvider = this;

        // onDomainMessage is now deprecated for combat logs, but kept for generic system messages
        const unsub = this.hero.events.subscribe('onDomainMessage', (data) => {
            // For now, treat legacy string logs as 'info'
            this.log({
                id: data.id,
                timestamp: Date.now(),
                type: 'info',
                message: data.message
            });
        });
        this.eventUnsubscribers.push(unsub);

        // Structured Combat Events
        const unsubDamage = this.hero.events.subscribe('onDamage', (data) => {
            this.log({
                id: `dmg-${Date.now()}`,
                timestamp: Date.now(),
                type: 'damage',
                source: 'Misterioso', // TODO: Add attacker to payload
                target: this.hero!.name,
                value: data.damage
            });
        });
        this.eventUnsubscribers.push(unsubDamage);

        const unsubHeal = this.hero.events.subscribe('onHeal', (data) => {
            this.log({
                id: `heal-${Date.now()}`,
                timestamp: Date.now(),
                type: 'heal',
                source: 'Self',
                target: this.hero!.name,
                value: data.amount
            });
        });
        this.eventUnsubscribers.push(unsubHeal);

        const unsubStatus = this.hero.events.subscribe('onCombatStatusChange', (data) => {
            this.combatStatus = data.status;
            this.onCombatStatusChange?.(data.status);

            // Log phase change
            this.log({
                id: `phase-${Date.now()}`,
                timestamp: Date.now(),
                type: 'phase',
                phaseName: data.status
            });
        });
        this.eventUnsubscribers.push(unsubStatus);

        const unsubEnd = this.hero.events.subscribe('onCombatEnd', (data) => {
            this.lastCombatResult = data.result;
        });
        this.eventUnsubscribers.push(unsubEnd);

        this.adventure = new AdventureManager(this.hero);

        // Wire up Engine State Callbacks
        this.adventure.onEncounterStart = (enemy) => {
            this.activeEnemy = enemy;
        };
        this.adventure.onEncounterEnd = () => {
            this.activeEnemy = null;
        };

        this.log({
            id: `welcome-${Date.now()}`,
            timestamp: Date.now(),
            type: 'info',
            message: `Bem-vindo, ${name} o ${className}!`
        });
    }

    /**
     * Log a message through the UI callback
     */
    public log(entry: LogEntry): void {
        this.onLog?.(entry);
    }

    public saveGame() {
        if (this.hero) {
            SaveManager.save(this.hero);
            this.log({
                id: `save-${Date.now()}`,
                timestamp: Date.now(),
                type: 'info',
                message: "Jogo salvo com sucesso!",
                icon: '💾'
            });
        }
    }

    public loadGame() {
        const loadedHero = SaveManager.load();
        if (loadedHero) {
            loadedHero.inputProvider = this;
            this.hero = loadedHero;
            this.adventure = new AdventureManager(loadedHero);

            // Wire up Engine State Callbacks
            this.adventure.onEncounterStart = (enemy) => {
                this.activeEnemy = enemy;
            };
            this.adventure.onEncounterEnd = () => {
                this.activeEnemy = null;
            };

            // Re-subscribe
            const unsub = loadedHero.events.subscribe('onDomainMessage', (data) => {
                this.log({
                    id: data.id || `msg-${Date.now()}`,
                    timestamp: Date.now(),
                    type: 'info',
                    message: data.message
                });
            });
            this.eventUnsubscribers.push(unsub);

            const unsubStatus = loadedHero.events.subscribe('onCombatStatusChange', (data) => {
                this.combatStatus = data.status;
                this.onCombatStatusChange?.(data.status);
            });
            this.eventUnsubscribers.push(unsubStatus);

            this.log({
                id: `load-${Date.now()}`,
                timestamp: Date.now(),
                type: 'info',
                message: `Jogo carregado! Bem-vindo de volta, ${loadedHero.name}.`
            });
            return loadedHero;
        }
        return null;
    }

    /**
     * Cleanup all resources
     */
    public dispose(): void {
        // Reject any pending choice to prevent hanging promises
        if (this.pendingChoice) {
            this.rejectPendingChoice(new Error("Game bridge disposed"));
        }

        // Unsubscribe from all events
        this.eventUnsubscribers.forEach(unsub => unsub());
        this.eventUnsubscribers = [];

        this.hero = null;
        this.activeEnemy = null;
        this.adventure = null;
    }

    // ─── Private Helpers ───

    private clearPendingChoice(): void {
        if (this.pendingChoice?.timeout) {
            clearTimeout(this.pendingChoice.timeout);
        }
        this.pendingChoice = null;
    }

    private rejectPendingChoice(error: Error): void {
        if (this.pendingChoice) {
            const { reject } = this.pendingChoice;
            this.clearPendingChoice();
            reject(error);
        }
    }
}
