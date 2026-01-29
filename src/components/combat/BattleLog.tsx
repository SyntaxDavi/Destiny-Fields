import React, { useEffect, useRef, useState } from "react";
import { LogEntry } from "./LogTypes";
import { LogItemRenderer } from "./LogItems";

interface BattleLogProps {
    logs: LogEntry[];
}

export function BattleLog({ logs }: BattleLogProps) {
    const endOfLogRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const [shouldAutoScroll, setShouldAutoScroll] = useState(true);
    const [hasNewMessages, setHasNewMessages] = useState(false);

    // Check scroll position
    const handleScroll = () => {
        if (!containerRef.current) return;
        const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
        const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
        setShouldAutoScroll(isAtBottom);
        if (isAtBottom) setHasNewMessages(false);
    };

    // Auto-scroll effect
    useEffect(() => {
        if (shouldAutoScroll) {
            endOfLogRef.current?.scrollIntoView({ behavior: 'smooth' });
            setHasNewMessages(false);
        } else {
            setHasNewMessages(true);
        }
    }, [logs, shouldAutoScroll]);

    return (
        <div className="flex-1 p-4 min-h-[300px] flex flex-col relative font-mono text-sm">
            <p className="text-[10px] font-black uppercase text-amber-900/40 mb-2 border-b border-amber-900/10 flex justify-between tracking-widest pb-1 select-none">
                <span>⚔️ Crônicas da Batalha</span>
                {hasNewMessages && (
                    <button
                        onClick={() => {
                            setShouldAutoScroll(true);
                            endOfLogRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="text-amber-600 animate-pulse cursor-pointer hover:underline"
                    >
                        Novas mensagens ↓
                    </button>
                )}
            </p>

            <div
                ref={containerRef}
                onScroll={handleScroll}
                className="space-y-3 overflow-y-auto max-h-[300px] scroll-smooth pr-2 custom-scrollbar"
            >
                {logs.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full opacity-30 mt-10">
                        <span className="text-4xl mb-2">📜</span>
                        <p className="text-[10px] italic text-amber-900 font-bold uppercase tracking-widest">O pergaminho aguarda...</p>
                    </div>
                )}

                {logs.map((log) => (
                    <LogItemRenderer key={log.id} log={log} />
                ))}
                <div ref={endOfLogRef} />
            </div>
        </div>
    );
}
