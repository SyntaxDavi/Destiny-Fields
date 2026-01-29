import React, { memo } from 'react';
import { EnemyViewModel } from './viewModels';

interface EnemyPanelProps {
    enemy: EnemyViewModel | null;
}

export const EnemyPanel = memo(({ enemy }: EnemyPanelProps) => {
    if (!enemy) {
        return (
            <div className="glass-panel p-4 flex items-center justify-center h-full border-2 border-dashed border-amber-200/50 min-h-[300px]">
                <span className="text-amber-900/40 italic text-sm font-bold opacity-50">Nenhum inimigo visível</span>
            </div>
        );
    }

    const hpPercent = Math.max(0, Math.min(100, (enemy.stats.hp.value / (enemy.stats.hp.maxValue || 100)) * 100));

    return (
        <div className={`
            glass-panel panel-border p-6 flex flex-col items-center text-center h-full justify-between transition-all duration-500 bg-white/60
            ${enemy.isActive ? 'ring-2 ring-red-500/20 shadow-[0_0_20px_rgba(220,38,38,0.1)] scale-[1.01]' : ''}
            ${enemy.isDead ? 'opacity-50 grayscale' : ''}
        `}>
            <div className="flex flex-col items-center w-full">
                {/* Avatar */}
                <div className={`
                    w-24 h-24 bg-red-100/50 rounded-full mb-6 flex items-center justify-center text-4xl ring-2 ring-red-500/20 shadow-md transition-transform
                    ${enemy.isActive ? 'animate-bounce-slow' : ''}
                `}>
                    💀
                </div>

                {/* Name & Type */}
                <h2 className="font-black text-2xl text-red-900 mb-2 tracking-tight">{enemy.name}</h2>
                <span className="text-xs bg-red-50 px-3 py-1 rounded text-red-800 border border-red-200 mb-8 uppercase tracking-widest font-bold">
                    {enemy.type}
                </span>

                {/* HP Bar */}
                <div className="w-full space-y-1 mt-auto select-none">
                    <div className="flex justify-between text-xs text-red-800/60 font-bold uppercase tracking-wider">
                        <span>{enemy.stats.hp.label}</span>
                        <span>{enemy.stats.hp.value} / {enemy.stats.hp.maxValue}</span>
                    </div>
                    <div className="w-full h-4 bg-red-50 rounded-full overflow-hidden shadow-inner border border-red-200/50 relative">
                        <div
                            className="h-full bg-gradient-to-r from-red-600 to-red-500 transition-all duration-200 ease-linear shadow-[0_0_10px_rgba(220,38,38,0.3)]"
                            style={{ width: `${hpPercent}%` }}
                        />
                        {/* Shine effect */}
                        <div className="absolute inset-0 bg-white/10" />
                    </div>
                </div>
            </div>

            {/* Status Indicator */}
            <div className={`mt-6 w-full text-xs font-bold uppercase tracking-widest text-center py-2 border-t border-dashed border-red-200/50 transition-colors duration-300 ${enemy.isActive ? 'text-red-600 animate-pulse' : 'text-red-900/30'}`}>
                {enemy.isActive ? 'Atacando...' : 'Aguardando'}
            </div>
        </div>
    );
});

EnemyPanel.displayName = 'EnemyPanel';
