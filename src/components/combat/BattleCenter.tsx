import React, { useRef, useEffect } from 'react';
import { LogEntry } from './LogTypes';
import { BattleLog } from './BattleLog';
import { CombatPhase, TurnOwner } from './viewModels';

interface BattleCenterProps {
    logs: LogEntry[];
    phase: CombatPhase;
    turnOwner: TurnOwner;
    message?: string;
}

export function BattleCenter({ logs, phase, turnOwner, message }: BattleCenterProps) {
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom on new logs
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [logs]);

    // Status Banner Logic
    const getBannerStyles = () => {
        if (phase === 'RESULT') return 'bg-slate-800 text-slate-100 border-slate-600';
        if (turnOwner === 'PLAYER') return 'bg-blue-100/90 text-blue-900 border-blue-200 shadow-blue-100';
        if (turnOwner === 'ENEMY') return 'bg-red-100/90 text-red-900 border-red-200 shadow-red-100 animate-pulse';
        return 'bg-amber-100/90 text-amber-900 border-amber-200 shadow-amber-100';
    };

    const getBannerText = () => {
        if (message) return message;
        if (phase === 'RESULT') return 'Combate Finalizado';
        if (turnOwner === 'PLAYER') return 'Sua Vez';
        if (turnOwner === 'ENEMY') return 'Turno Inimigo';
        return 'Preparando...';
    };

    // Reversing logs for display if needed, but usually easiest to adhere to standard "append to bottom"
    // User complaint was "inverted". Usually means they want new logs at bottom.
    // If logs come in [Newest, Oldest], we need to reverse OR render in reverse.
    // Let's assume passed logs are [Newest, ..., Oldest] (stack).
    // So we want to render them in reverse order (Oldest top, Newest bottom).

    // Create a copy to reverse without mutating prop
    const chronologicalLogs = [...logs].reverse();

    return (
        <div className="col-span-6 flex flex-col h-full gap-4 relative">
            {/* Status Banner */}
            <div className={`
                w-full py-3 px-6 rounded text-center font-bold tracking-[0.2em] uppercase text-xs border backdrop-blur-md transition-all duration-300 shadow-lg z-10
                ${getBannerStyles()}
            `}>
                {getBannerText()}
            </div>

            {/* Log Container */}
            <div className="glass-panel panel-border flex-1 rounded-lg overflow-hidden flex flex-col bg-white/40 relative">
                <div
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar scroll-smooth"
                >
                    {/* Render chronological order (Oldest -> Newest) */}
                    <BattleLog logs={chronologicalLogs} />

                    {/* Spacer for bottom scrolling */}
                    <div className="h-4" />
                </div>

                {/* Fade overlay at top */}
                <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-white/80 to-transparent pointer-events-none" />
            </div>
        </div>
    );
}
