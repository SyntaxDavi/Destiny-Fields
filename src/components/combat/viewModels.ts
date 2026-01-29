import { LogEntry } from "./LogTypes";

export type CombatPhase = 'MENU' | 'COMBAT' | 'RESULT';
export type TurnOwner = 'PLAYER' | 'ENEMY' | null;
export type InteractionState = 'WAITING' | 'CHOOSING' | 'COMMITTING' | 'LOCKED';

export interface StatViewData {
    icon: string;
    label: string;
    value: number;
    maxValue?: number;
    colorClass?: string;
}

export interface HeroViewModel {
    name: string;
    level: number;
    className: string;
    stats: {
        hp: StatViewData;
        xp: StatViewData;
    };
    isActive: boolean;
}

export interface EnemyViewModel {
    name: string;
    type: string; // "Orc", "Goblin", etc.
    stats: {
        hp: StatViewData;
    };
    isActive: boolean;
    isDead: boolean;
}

export interface ActionPanelViewModel {
    title: string;
    options: {
        id: string;
        label: string;
        description?: string;
        isSafe: boolean; // For future usage (e.g. traps)
    }[];
    state: InteractionState;
}

export interface CombatViewModel {
    phase: CombatPhase;
    turnOwner: TurnOwner;
    hero: HeroViewModel | null;
    enemy: EnemyViewModel | null;
    actionPanel: ActionPanelViewModel | null;
    logs: LogEntry[];
    message?: string; // Top banner message
}
