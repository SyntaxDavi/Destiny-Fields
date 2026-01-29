import React, { memo } from 'react';
import { HeroViewModel } from './viewModels';

interface HeroPanelProps {
    hero: HeroViewModel | null;
}

export const HeroPanel = memo(({ hero }: HeroPanelProps) => {
    if (!hero) return <div className="p-4 animate-pulse bg-slate-100 rounded opacity-50 h-full min-h-[300px]" />;

    // Robust Math: Clamp values to prevent layout explosion
    const hpPercent = Math.max(0, Math.min(100, (hero.stats.hp.value / (hero.stats.hp.maxValue || 100)) * 100));
    const xpPercent = Math.max(0, Math.min(100, (hero.stats.xp.value / (hero.stats.xp.maxValue || 100)) * 100));

    return (
        <div className="glass-panel panel-border p-6 flex flex-col items-center text-center h-full justify-between transition-colors bg-white/60">
            <div className="flex flex-col items-center w-full">
                {/* Avatar */}
                <div className="w-20 h-20 bg-amber-100/50 rounded-full mb-4 flex items-center justify-center text-3xl ring-2 ring-amber-500/30 shadow-lg">
                    🛡️
                </div>

                {/* Name & Badge */}
                <h2 className="font-black text-xl text-amber-900 mb-1 tracking-tight">{hero.name}</h2>
                <span className="text-xs bg-amber-100 px-3 py-1 rounded-full text-amber-700 border border-amber-200 mb-6 font-bold uppercase tracking-wider">
                    {hero.className} • Lv. {hero.level}
                </span>

                {/* HP Bar */}
                <div className="w-full space-y-1 mb-4 select-none">
                    <div className="flex justify-between text-xs text-amber-900/60 font-bold uppercase tracking-wider">
                        <span>{hero.stats.hp.label}</span>
                        <span>{hero.stats.hp.value} / {hero.stats.hp.maxValue}</span>
                    </div>
                    <div className="w-full h-4 bg-amber-100/50 rounded-full overflow-hidden shadow-inner border border-amber-200/50 relative">
                        <div
                            className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-500 ease-out shadow-[0_0_10px_rgba(16,185,129,0.2)]"
                            style={{ width: `${hpPercent}%` }}
                        />
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-white/10" />
                    </div>
                </div>

                {/* XP Bar */}
                <div className="w-full space-y-1 select-none opacity-80 hover:opacity-100 transition-opacity">
                    <div className="flex justify-between text-[10px] text-amber-900/50 font-bold uppercase tracking-wider">
                        <span>{hero.stats.xp.label}</span>
                        <span>{hero.stats.xp.value} / {hero.stats.xp.maxValue}</span>
                    </div>
                    <div className="w-full h-2 bg-amber-100/30 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-amber-400/80 transition-all duration-1000 ease-in-out"
                            style={{ width: `${xpPercent}%` }}
                        />
                    </div>
                </div>
            </div>

            {/* Status Indicator */}
            <div className={`mt-6 w-full text-xs font-bold uppercase tracking-widest text-center py-2 border-t border-dashed border-amber-200/50 transition-colors duration-300 ${hero.isActive ? 'text-emerald-600 animate-pulse' : 'text-amber-900/30'}`}>
                {hero.isActive ? 'Sua Vez' : 'Aguardando'}
            </div>
        </div>
    );
});

HeroPanel.displayName = 'HeroPanel';
