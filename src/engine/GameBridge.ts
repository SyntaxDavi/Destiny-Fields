import { Character } from "./entities/Character";
import { AdventureManager } from "./logic/AdventureManager";
import { InputProvider } from "./core/InputProvider";

interface ChoiceRequest {
    resolve: (value: number) => void;
    reject: (reason?: Error) => void;
    timeout?: NodeJS.Timeout;
}

export class GameBridge implements InputProvider {
    private static instance: GameBridge | null = null;

    public hero: Character | null = null;
    public activeEnemy: Character | null = null;
    public adventure: AdventureManager | null = null;

    private pendingChoice: ChoiceRequest | null = null;
    private eventUnsubscribers: Array<() => void> = [];

    // UI Callbacks
    public onChoiceRequest: ((title: string, options: string[]) => void) | null = null;
    public onConfirmationRequest: ((message: string) => void) | null = null;
    public onLog: ((message: string) => void) | null = null;

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
        options: string[],
        timeoutMs?: number
    ): Promise<number> {
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
                this.onChoiceRequest(title, options);
            } else {
                reject(new Error("No UI handler registered for choice requests"));
            }
        });
    }

    async requestConfirmation(message: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            // Store as a "choice" between Yes (0) and No (1)
            this.pendingChoice = {
                resolve: (index: number) => resolve(index === 0),
                reject,
            };

            if (this.onConfirmationRequest) {
                this.onConfirmationRequest(message);
            } else if (this.onChoiceRequest) {
                // Fallback to choice request if no specific confirmation handler
                this.onChoiceRequest(message, ["Yes", "No"]);
            } else {
                reject(new Error("No UI handler registered for confirmation"));
            }
        });
    }

    // ─── Public API for UI Layer ───

    /**
     * Resolve the current pending choice with a selection index
     */
    public resolveChoice(index: number): void {
        if (!this.pendingChoice) {
            console.warn("No pending choice to resolve");
            return;
        }

        // Validate index bounds if options were provided (optional validation)
        if (index < 0) {
            console.warn("Invalid choice index:", index);
            return;
        }

        const { resolve, timeout } = this.pendingChoice;
        this.clearPendingChoice();
        resolve(index);
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

        // Subscribe to domain events with cleanup tracking
        const unsub = this.hero.events.subscribe('onDomainMessage', (data: { message: string }) => {
            this.log(data.message);
        });
        this.eventUnsubscribers.push(unsub);

        this.adventure = new AdventureManager(this.hero);
        this.log(`Bem-vindo, ${name} o ${className}!`);
    }

    /**
     * Log a message through the UI callback
     */
    public log(message: string): void {
        // console.log(`[Game] ${message}`); 
        this.onLog?.(message);
    }

    public saveGame() {
        const { SaveManager } = require('./logic/SaveManager');
        if (this.hero) {
            SaveManager.save(this.hero);
            this.log("Jogo salvo com sucesso!");
        }
    }

    public loadGame() {
        const { SaveManager } = require('./logic/SaveManager');
        const loadedHero = SaveManager.load();
        if (loadedHero) {
            loadedHero.inputProvider = this;
            this.hero = loadedHero;
            this.adventure = new AdventureManager(loadedHero);

            // Re-subscribe
            const unsub = loadedHero.events.subscribe('onDomainMessage', (data: { message: string }) => {
                this.log(data.message);
            });
            this.eventUnsubscribers.push(unsub);

            this.log(`Jogo carregado! Bem-vindo de volta, ${loadedHero.name}.`);
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
