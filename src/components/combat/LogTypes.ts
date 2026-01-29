export type LogType = 'damage' | 'heal' | 'info' | 'phase' | 'loot' | 'death' | 'evade' | 'critical';

export interface BaseLog {
    id: string;
    timestamp: number;
    type: LogType;
}

export interface DamageLog extends BaseLog {
    type: 'damage' | 'critical';
    source: string;
    target: string;
    value: number;
    isCritical?: boolean;
}

export interface HealLog extends BaseLog {
    type: 'heal';
    source: string;
    target: string;
    value: number;
}

export interface PhaseLog extends BaseLog {
    type: 'phase';
    phaseName: string; // "Player Turn", "Enemy Turn", "Combat Start"
}

export interface LootLog extends BaseLog {
    type: 'loot';
    itemName: string;
    count?: number;
}

export interface InfoLog extends BaseLog {
    type: 'info' | 'death' | 'evade';
    message: string;
    icon?: string;
}

export type LogEntry = DamageLog | HealLog | PhaseLog | LootLog | InfoLog;
