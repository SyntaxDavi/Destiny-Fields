import React from 'react';

interface CharacterCardProps {
    name: string;
    level: number;
    hp: number;
    maxHp: number;
    gold: number;
    xp: number;
    xpToNextLevel: number;
    className?: string;
}

export const CharacterCard: React.FC<CharacterCardProps> = ({
    name, level, hp, maxHp, gold, xp, xpToNextLevel, className = ''
}) => {
    const hpPercentage = Math.min(100, Math.max(0, (hp / maxHp) * 100));
    const xpPercentage = Math.min(100, Math.max(0, (xp / xpToNextLevel) * 100));

    return (
        <div className={`pixel-panel p-5 rounded-none ${className}`}>
            <div className="flex justify-between items-start mb-3 border-b-2 border-slate-300 pb-2">
                <div>
                    <h3 className="text-xl font-black text-amber-900 leading-tight uppercase tracking-tighter">
                        {name}
                    </h3>
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        Level {level} Explorer
                    </span>
                </div>
                <div className="bg-amber-100 px-2 py-1 border-2 border-amber-900 flex items-center gap-1">
                    <span className="text-sm">🪙</span>
                    <span className="text-sm font-bold text-amber-900">{gold}</span>
                </div>
            </div>

            <div className="space-y-3">
                {/* HP Bar */}
                <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-black uppercase text-amber-900">
                        <span>Vitality</span>
                        <span>{hp}/{maxHp}</span>
                    </div>
                    <div className="h-4 bg-slate-200 border-2 border-slate-800 p-[2px]">
                        <div
                            className="h-full bg-green-500 transition-all duration-300 relative"
                            style={{ width: `${hpPercentage}%` }}
                        >
                            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/30" />
                        </div>
                    </div>
                </div>

                {/* XP Bar */}
                <div className="space-y-1 opacity-90">
                    <div className="flex justify-between text-[10px] font-black uppercase text-amber-900">
                        <span>Experience</span>
                        <span>{xp}/{xpToNextLevel}</span>
                    </div>
                    <div className="h-2 bg-slate-200 border border-slate-400">
                        <div
                            className="h-full bg-amber-400 transition-all duration-500"
                            style={{ width: `${xpPercentage}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};
