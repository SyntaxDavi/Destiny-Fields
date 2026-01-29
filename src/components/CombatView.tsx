"use client";

import React from 'react';
import { CharacterCard } from './CharacterCard';
import { useGame } from '../hooks/useGame';

interface CombatProps {
    onEnd: (result: string) => void;
}

export const CombatView: React.FC<CombatProps> = ({ onEnd }) => {
    const { logs, choice, heroData, enemyData, makeChoice } = useGame();

    // Sincronizar detecção de fim de combate
    React.useEffect(() => {
        if (heroData && heroData.hp <= 0) {
            onEnd('defeat');
        } else if (enemyData && enemyData.hp <= 0) {
            onEnd('victory');
        }
    }, [heroData?.hp, enemyData?.hp, onEnd]);

    if (!heroData) return <div className="p-20 text-center font-black uppercase text-amber-900 animate-pulse">Invocando Herói...</div>;

    const currentEnemy = enemyData || { name: 'Inimigo', hp: 100, maxHp: 100 };

    return (
        <div className="w-full max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 items-center animate-in fade-in duration-500">

            {/* Hero Side - Always from bridge hook */}
            <div className="space-y-4">
                <CharacterCard {...heroData} />
                <div className="pixel-panel p-4 bg-blue-50">
                    <p className="text-[10px] font-bold text-blue-800 uppercase mb-2 italic">Ações Disponíveis</p>
                    <div className="grid grid-cols-1 gap-2">
                        {choice ? (
                            choice.options.map((opt, i) => (
                                <button
                                    key={i}
                                    onClick={() => makeChoice(i)}
                                    className="pixel-button p-3 font-black text-xs uppercase"
                                >
                                    {opt}
                                </button>
                            ))
                        ) : (
                            <div className="p-4 text-center text-[10px] font-bold text-slate-400 uppercase animate-pulse">
                                Aguardando Turno...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Battle Log Center */}
            <div className="space-y-4 h-full flex flex-col justify-center">
                <div className="pixel-panel flex-1 p-4 bg-white min-h-[300px] flex flex-col">
                    <p className="text-[10px] font-black uppercase text-slate-400 mb-2 border-b">Pergaminho de Batalha</p>
                    <div className="space-y-2 overflow-y-auto max-h-[240px]">
                        {logs.length === 0 && <p className="text-[10px] italic text-slate-300">O silêncio precede a tempestade...</p>}
                        {logs.map((log, i) => (
                            <p key={i} className={`text-xs font-bold ${i === 0 ? 'text-amber-900 animate-in slide-in-from-left duration-300' : 'text-slate-400'}`}>
                                {i === 0 ? '> ' : ''}{log}
                            </p>
                        ))}
                    </div>
                </div>
            </div>

            {/* Enemy Side */}
            <div className="space-y-4 text-center">
                <div className="relative inline-block group">
                    <span className="text-8xl block">👹</span>
                </div>
                <div className="pixel-panel p-4 bg-red-50">
                    <h4 className="font-black text-red-900 uppercase mb-2">{currentEnemy.name}</h4>
                    <div className="h-4 bg-slate-300 border-2 border-amber-900 p-[1px]">
                        <div
                            className="h-full bg-red-600 transition-all duration-300"
                            style={{ width: `${(currentEnemy.hp / currentEnemy.maxHp) * 100 || 0}%` }}
                        />
                    </div>
                    <p className="text-[10px] font-bold mt-1 text-red-800 uppercase">Ameaça Detectada</p>
                </div>
            </div>

        </div>
    );
};
