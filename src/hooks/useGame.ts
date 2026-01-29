"use client";

import { useState, useEffect } from 'react';
import { GameBridge } from '../engine/GameBridge';

export interface HeroData {
    name: string;
    level: number;
    hp: number;
    maxHp: number;
    gold: number;
    xp: number;
    xpToNextLevel: number;
    className?: string;
}

export interface EnemyData {
    name: string;
    hp: number;
    maxHp: number;
}

export function useGame() {
    const bridge = GameBridge.getInstance();
    const [logs, setLogs] = useState<string[]>([]);
    const [choice, setChoice] = useState<{ title: string, options: string[] } | null>(null);
    const [heroData, setHeroData] = useState<HeroData | null>(null);
    const [enemyData, setEnemyData] = useState<EnemyData | null>(null);

    useEffect(() => {
        bridge.onLog = (msg) => setLogs(prev => [msg, ...prev].slice(0, 15));
        bridge.onChoiceRequest = (title, options) => setChoice({ title, options });

        // Polling for live status updates
        const interval = setInterval(() => {
            const hStatus = bridge.getHeroStatus();
            if (hStatus) setHeroData(hStatus as HeroData);

            const eStatus = bridge.getEnemyStatus();
            setEnemyData(eStatus as EnemyData);
        }, 100);

        return () => {
            clearInterval(interval);
            bridge.onLog = null;
            bridge.onChoiceRequest = null;
        };
    }, [bridge]);

    const makeChoice = (index: number) => {
        setChoice(null);
        bridge.resolveChoice(index);
    };

    return { logs, choice, heroData, enemyData, makeChoice, bridge };
}
