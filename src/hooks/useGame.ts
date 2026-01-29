import { useState, useEffect } from "react";
import { GameBridge } from "../engine/GameBridge";
import { ChoiceOption, ChoiceContext } from "../engine/core/InputProvider";
import { CombatStatus } from "../engine/core/EventBus";
import { LogEntry } from "../components/combat/LogTypes";
import { CombatViewModel } from "../components/combat/viewModels";

export function useGame() {
    const bridge = GameBridge.getInstance();

    // Raw Engine State
    const [status, setStatus] = useState<CombatStatus>('IDLE');
    const [rawLogs, setRawLogs] = useState<LogEntry[]>([]);
    const [choice, setChoice] = useState<{ title: string, options: ChoiceOption[], context: ChoiceContext } | null>(null);
    const [heroStats, setHeroStats] = useState<any>(null);
    const [enemyStats, setEnemyStats] = useState<any>(null);

    // Sync loop for polled data (HP/Stats)
    useEffect(() => {
        const interval = setInterval(() => {
            setHeroStats(bridge.getHeroStatus());
            setEnemyStats(bridge.getEnemyStatus());
            // Failsafe sync for status
            if (bridge.combatStatus !== status) {
                setStatus(bridge.combatStatus);
            }
        }, 100);
        return () => clearInterval(interval);
    }, [bridge, status]);

    // Event Subscriptions
    useEffect(() => {
        bridge.onLog = (msg) => setRawLogs(prev => [msg, ...prev].slice(0, 50));

        bridge.onChoiceRequest = (title, options, context) => {
            setChoice({ title, options, context });
        };

        bridge.onCombatStatusChange = (newStatus) => {
            setStatus(newStatus);
        };

        // Initial Game Setup
        if (!bridge.hero) {
            bridge.initHero('Davi', 'Mago');
            bridge.activeEnemy = new (require('../engine/entities/Character').Character)({
                name: 'Orc Selvagem',
                maxLife: 60,
                weaponDamage: 8
            });
        }

        return () => {
            bridge.onLog = null;
            bridge.onChoiceRequest = null;
            bridge.onCombatStatusChange = null;
        };
    }, []);

    const makeChoice = (id: string) => {
        setChoice(null); // Optimistic locking
        bridge.resolveChoice(id);
    };

    const startGame = () => {
        if (bridge.adventure) {
            bridge.adventure.startCombat();
        }
    };

    // --- Adapter Logic: Transform Raw State to Strict ViewModel ---

    // 1. Determine Phase
    let phase: CombatViewModel['phase'] = 'COMBAT';
    if (status === 'IDLE') phase = 'MENU';
    if (status === 'ENDED') phase = 'RESULT';

    // 2. Determine Turn Owner
    let turnOwner: CombatViewModel['turnOwner'] = null;
    if (status === 'PLAYER_TURN') turnOwner = 'PLAYER';
    if (status === 'ENEMY_TURN') turnOwner = 'ENEMY';

    // 3. Map Hero
    const heroVM: CombatViewModel['hero'] = heroStats ? {
        name: heroStats.name,
        level: heroStats.level,
        className: 'Aventureiro', // TODO: Get from engine
        stats: {
            hp: { icon: '❤️', label: 'Vitalidade', value: heroStats.hp, maxValue: heroStats.maxHp },
            xp: { icon: '✨', label: 'Experiência', value: heroStats.xp, maxValue: heroStats.xpToNextLevel }
        },
        isActive: turnOwner === 'PLAYER'
    } : null;

    // 4. Map Enemy
    const enemyVM: CombatViewModel['enemy'] = enemyStats ? {
        name: enemyStats.name,
        type: 'Inimigo', // TODO: Get from engine
        stats: {
            hp: { icon: '💀', label: 'Vitalidade', value: enemyStats.hp, maxValue: enemyStats.maxHp }
        },
        isActive: turnOwner === 'ENEMY',
        isDead: enemyStats.hp <= 0
    } : null;

    // 5. Map Action Panel
    const actionVM: CombatViewModel['actionPanel'] = choice ? {
        title: choice.title,
        options: choice.options.map(opt => ({
            id: opt.id,
            label: opt.label,
            isSafe: true
        })),
        state: 'CHOOSING' // Simple state for now, can extend to WAITING/LOCKED
    } : {
        title: 'Aguarde...',
        options: [],
        state: 'LOCKED'
    };

    const viewModel: CombatViewModel = {
        phase,
        turnOwner,
        hero: heroVM,
        enemy: enemyVM,
        actionPanel: actionVM,
        logs: rawLogs, // Passed as-is, BattleCenter handles display order
        message: undefined
    };

    return {
        viewModel,
        makeChoice,
        startGame
    };
}

