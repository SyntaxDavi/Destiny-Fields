import { Item } from "../engine/core/Item";

export type AppPhase = 'MENU' | 'CREATION' | 'EXPLORATION' | 'COMBAT';

export interface HeroSummaryViewModel {
    name: string;
    className: string;
    level: number;
    hp: number;
    maxHp: number;
    gold: number;
    xp: number;
    xpToNextLevel: number;
}

export interface InventoryViewModel {
    isOpen: boolean;
    items: Item[];
    capacity: number;
    maxCapacity: number;
}

export interface ExplorationViewModel {
    locationName: string;
    description: string;
    // Future: events, interactables, etc.
}

export interface AppViewModel {
    phase: AppPhase;
    hero: HeroSummaryViewModel | null;
    inventory: InventoryViewModel;
    exploration: ExplorationViewModel | null;

    // UI Constraints
    isLoading: boolean;
    message?: string; // Global toast/banner
}
