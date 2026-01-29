import { useState, useEffect, useCallback } from "react";
import { GameBridge } from "../engine/GameBridge";
import { AppViewModel, AppPhase, HeroSummaryViewModel } from "../app/appViewModels";

export function useGameController() {
    const bridge = GameBridge.getInstance();

    // --- State ---
    const [phase, setPhase] = useState<AppPhase>('MENU');
    const [hero, setHero] = useState<HeroSummaryViewModel | null>(null);
    const [isInventoryOpen, setInventoryOpen] = useState(false);
    const [inventoryItems, setInventoryItems] = useState<any[]>([]); // Typed as any[] temporarily to match Engine Item

    // --- Actions ---
    const actions = {
        startCreation: () => setPhase('CREATION'),

        cancelCreation: () => setPhase('MENU'),

        startJourney: (data: { name: string; class: string }) => {
            bridge.initHero(data.name, data.class);
            syncHeroState();
            setPhase('EXPLORATION');
        },

        loadGame: () => {
            const loaded = bridge.loadGame();
            if (loaded) {
                syncHeroState();
                setPhase('EXPLORATION');
            } else {
                alert("Nenhum save encontrado!"); // Could be improved to a UI message later
            }
        },

        saveGame: () => {
            bridge.saveGame();
        },

        openInventory: () => {
            setInventoryItems(bridge.getHeroInventory());
            setInventoryOpen(true);
        },

        closeInventory: () => {
            setInventoryOpen(false);
        },

        useItem: (itemId: string) => {
            if (bridge.hero?.useItem(itemId)) {
                // Refresh inventory and hero stats after use
                setInventoryItems(bridge.getHeroInventory());
                syncHeroState();
            }
        },

        startCombat: async () => {
            if (bridge.adventure) {
                // Determine phase *before* async to prevent flicker? 
                // Actually, the engine drives status. 
                // But for now, we trigger the logic.
                // The Engine event `onCombatStatusChange` will eventually drive the AppPhase to COMBAT.
                // However, `handleEncounter` is async and might happen instantaneously or waiting.

                // For this refactor, we let the Engine events drive the phase as much as possible,
                // BUT current `page.tsx` was manual.
                // Let's rely on event listeners below.
                await bridge.adventure.handleEncounter();

                // Fallback: Ensure we go back to exploration if events didn't trigger 'IDLE'
                setPhase('EXPLORATION');
            }
        },

        exitToMenu: () => {
            setPhase('MENU');
            setHero(null);
        }
    };

    // --- Sync Logic ---
    const syncHeroState = useCallback(() => {
        const status = bridge.getHeroStatus();
        if (status) {
            setHero({
                name: status.name,
                className: 'Aventureiro', // TODO: Bridge should return class
                level: status.level,
                hp: status.hp,
                maxHp: status.maxHp,
                gold: status.gold,
                xp: status.xp,
                xpToNextLevel: status.xpToNextLevel
            });
        }
    }, [bridge]);

    // --- Event Subscriptions ---
    useEffect(() => {
        // Poll for Hero Updates (HP, XP changes)
        const interval = setInterval(() => {
            if (phase === 'EXPLORATION' || phase === 'COMBAT') {
                syncHeroState();
            }
        }, 200);

        // Subscribe to Combat Status to driver Phase
        // This is the "Engine drives UI" part
        bridge.onCombatStatusChange = (status) => {
            if (status === 'STARTING' || status === 'PLAYER_TURN' || status === 'ENEMY_TURN') {
                setPhase('COMBAT');
            } else if (status === 'ENDED') {
                // Combat ended. The AdventureManager will likely wrap up soon.
                // We can wait for the async handleEncounter to finish, 
                // OR we can switch back to EXPLORATION after a delay/user action.
                // For now, let's allow the 'finish' click in the UI to handle it, 
                // OR automatically switch back if the bridge says so.
            } else if (status === 'IDLE') {
                setPhase('EXPLORATION');
            }
        };

        return () => {
            clearInterval(interval);
            bridge.onCombatStatusChange = null;
        };
    }, [bridge, phase, syncHeroState]);


    // --- ViewModel Construction ---
    const viewModel: AppViewModel = {
        phase,
        hero,
        inventory: {
            isOpen: isInventoryOpen,
            items: inventoryItems,
            capacity: inventoryItems.length,
            maxCapacity: 20
        },
        exploration: phase === 'EXPLORATION' ? {
            locationName: 'Campos do Destino',
            description: '"Você caminha por uma trilha gramada..."'
        } : null,
        isLoading: false
    };

    return {
        viewModel,
        actions
    };
}
