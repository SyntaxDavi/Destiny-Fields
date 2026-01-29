import { Item } from "./Item";

export type CombatStatus = 'IDLE' | 'STARTING' | 'PLAYER_TURN' | 'ENEMY_TURN' | 'ENDED';

export type CombatEventMap = {
    onDamage: { damage: number; currentLife: number };
    onAttack: { attacker: string; target: string; damage: number };
    onTurnStart: { actor: string };
    onTurnEnd: { actor: string };
    onDeath: { entityName: string };
    onHeal: { amount: number };
    onDomainMessage: { id: string; message: string };
    onBeingTargeted: { attackerName: string };
    onReactionChosen: { reaction: string };
    onInventoryChange: { inventory: Item[] };
    onCombatStatusChange: { status: CombatStatus };
    onCombatEnd: { winner: string | null; result: 'VICTORY' | 'DEFEAT' | 'FLED' };
};

export type CombatEvent = keyof CombatEventMap;
export type EventCallback<K extends CombatEvent> = (data: CombatEventMap[K]) => void;

interface Listener<K extends CombatEvent> {
    callback: EventCallback<K>;
    priority: number;
}

export class EventBus {
    private listeners: {
        [K in CombatEvent]?: Listener<K>[];
    } = {};

    /**
     * Subscribe to an event with an optional priority (higher number runs first).
     */
    public subscribe<K extends CombatEvent>(
        event: K,
        callback: EventCallback<K>,
        priority: number = 0
    ): () => void {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }

        const eventListeners = this.listeners[event] as Listener<K>[];
        eventListeners.push({ callback, priority });

        // Sort by priority descending
        eventListeners.sort((a, b) => b.priority - a.priority);

        return () => {
            const current = this.listeners[event] || [];
            this.listeners[event] = (current.filter(l => l.callback !== callback) as any);
        };
    }

    /**
     * Emit an event. Uses defensive copying to prevent issues if listeners 
     * unsubscribe during the emission loop.
     */
    public emit<K extends CombatEvent>(event: K, data: CombatEventMap[K]): void {
        const eventListeners = this.listeners[event];
        if (eventListeners) {
            // Defensive copy of the listeners array
            const consumers = [...eventListeners];
            consumers.forEach(listener => listener.callback(data));
        }
    }

    public clear(): void {
        this.listeners = {};
    }
}
