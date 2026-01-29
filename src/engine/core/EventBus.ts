export type CombatEvent = 'onDamage' | 'onAttack' | 'onTurnStart' | 'onTurnEnd' | 'onDeath' | 'onHeal' | 'onDomainMessage' | 'onBeingTargeted' | 'onReactionChosen';

export type EventCallback = (data: any) => void;

export class EventBus {
    private listeners: Map<CombatEvent, EventCallback[]> = new Map();

    public subscribe(event: CombatEvent, callback: EventCallback): () => void {
        const eventListeners = this.listeners.get(event) || [];
        eventListeners.push(callback);
        this.listeners.set(event, eventListeners);

        return () => {
            const current = this.listeners.get(event) || [];
            this.listeners.set(event, current.filter(l => l !== callback));
        };
    }

    public emit(event: CombatEvent, data: any): void {
        const eventListeners = this.listeners.get(event);
        if (eventListeners) {
            eventListeners.forEach(callback => callback(data));
        }
    }

    public clear(): void {
        this.listeners.clear();
    }
}
