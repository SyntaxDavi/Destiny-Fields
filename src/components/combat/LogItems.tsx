import React from "react";
import { DamageLog, HealLog, PhaseLog, LootLog, InfoLog, LogEntry } from "./LogTypes";

export function DamageItem({ log }: { log: DamageLog }) {
    return (
        <div className="flex items-center gap-2 text-xs py-1.5 px-3 hover:bg-red-900/20 rounded transition-colors group border-l-2 border-transparent hover:border-red-500">
            <span className="text-lg grayscale group-hover:grayscale-0 transition-all">💥</span>
            <div className="flex-1">
                <span className="font-bold text-slate-300">{log.target}</span>
                <span className="text-slate-500"> recebeu </span>
                <span className="font-black text-red-500 text-sm">{log.value}</span>
                <span className="text-slate-500"> de dano!</span>
            </div>
            <span className="text-[10px] text-slate-700 group-hover:text-slate-500 font-mono">
                {new Date(log.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </span>
        </div>
    );
}

export function HealItem({ log }: { log: HealLog }) {
    return (
        <div className="flex items-center gap-2 text-xs py-1.5 px-3 hover:bg-emerald-900/20 rounded transition-colors group border-l-2 border-transparent hover:border-emerald-500">
            <span className="text-lg grayscale group-hover:grayscale-0 transition-all">💚</span>
            <div className="flex-1">
                <span className="font-bold text-slate-300">{log.target}</span>
                <span className="text-slate-500"> recuperou </span>
                <span className="font-black text-emerald-500 text-sm">{log.value}</span>
                <span className="text-slate-500"> de vida.</span>
            </div>
        </div>
    );
}

export function PhaseItem({ log }: { log: PhaseLog }) {
    const isPlayer = log.phaseName === 'PLAYER_TURN';
    return (
        <div className="flex items-center justify-center my-6 opacity-60">
            <div className={`h-[1px] flex-1 ${isPlayer ? 'bg-gradient-to-r from-transparent to-blue-500' : 'bg-gradient-to-r from-transparent to-red-500'}`}></div>
            <span className={`px-4 text-[10px] font-black uppercase tracking-[0.2em] ${isPlayer ? 'text-blue-400' : 'text-red-400'}`}>
                {log.phaseName === 'PLAYER_TURN' && "Sua Vez"}
                {log.phaseName === 'ENEMY_TURN' && "Vez do Inimigo"}
                {log.phaseName === 'STARTING' && "Combate Iniciado"}
                {log.phaseName === 'ENDED' && "Fim de Combate"}
            </span>
            <div className={`h-[1px] flex-1 ${isPlayer ? 'bg-gradient-to-l from-transparent to-blue-500' : 'bg-gradient-to-l from-transparent to-red-500'}`}></div>
        </div>
    );
}

export function InfoItem({ log }: { log: InfoLog }) {
    return (
        <div className="text-xs py-1 px-3 text-slate-500 italic flex gap-2 hover:bg-slate-800/50 rounded transition-colors">
            <span>{log.icon || 'ℹ️'}</span>
            <span>{log.message}</span>
        </div>
    );
}

export function LogItemRenderer({ log }: { log: LogEntry }) {
    switch (log.type) {
        case 'damage': return <DamageItem log={log} />;
        case 'heal': return <HealItem log={log} />;
        case 'phase': return <PhaseItem log={log} />;
        case 'info': return <InfoItem log={log} />;
        default: return <div className="text-xs text-slate-300">Unknown log type</div>;
    }
}
