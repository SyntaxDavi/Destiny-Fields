"use client";

import React, { useState } from 'react';
import { GameBridge } from '../engine/GameBridge';

interface CreationProps {
    onComplete: (data: any) => void;
    onCancel: () => void;
}

export const CharacterCreationView: React.FC<CreationProps> = ({ onComplete, onCancel }) => {
    const [name, setName] = useState('');
    const [selectedClass, setSelectedClass] = useState('Guerreiro');

    const classes = [
        { name: 'Guerreiro', icon: '⚔️', desc: 'Foco em força e vida.' },
        { name: 'Ladino', icon: '🗡️', desc: 'Agilidade e críticos.' },
        { name: 'Mago', icon: '🔮', desc: 'Inteligência e magia.' },
        { name: 'Tanque', icon: '🛡️', desc: 'Defesa absoluta.' }
    ];

    const handleStart = () => {
        const bridge = GameBridge.getInstance();
        bridge.initHero(name, selectedClass);

        const hero = bridge.hero;
        if (hero) {
            onComplete({
                name: hero.name,
                class: selectedClass,
                level: hero.level,
                hp: hero.currentLife,
                maxHp: hero.maxLife,
                gold: hero.gold
            });
        }
    };

    return (
        <div className="pixel-panel p-8 max-w-xl mx-auto animate-in zoom-in duration-300">
            <h2 className="text-2xl font-black text-amber-900 mb-6 uppercase border-b-4 border-amber-900 pb-2 italic">
                Novo Aventureiro
            </h2>

            <div className="space-y-6">
                <div>
                    <label className="block text-sm font-black text-amber-800 uppercase mb-2">Nome do Herói</label>
                    <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full bg-white border-4 border-amber-900 p-3 text-lg font-bold outline-none focus:bg-amber-50"
                        placeholder="Ex: Link da Silva"
                    />
                </div>

                <div>
                    <label className="block text-sm font-black text-amber-800 uppercase mb-3">Escolha sua Vocação</label>
                    <div className="grid grid-cols-2 gap-3">
                        {classes.map((c) => (
                            <button
                                key={c.name}
                                onClick={() => setSelectedClass(c.name)}
                                className={`p-3 border-4 text-left transition-all ${selectedClass === c.name
                                    ? 'border-amber-900 bg-amber-200'
                                    : 'border-transparent bg-white/50 hover:bg-white'
                                    }`}
                            >
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-xl">{c.icon}</span>
                                    <span className="font-black text-amber-900 uppercase text-xs">{c.name}</span>
                                </div>
                                <p className="text-[10px] text-amber-800 font-bold leading-tight">{c.desc}</p>
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex gap-4 pt-4">
                    <button
                        onClick={onCancel}
                        className="flex-1 pixel-button p-4 font-black uppercase text-amber-900 bg-slate-300 border-slate-500 shadow-slate-600"
                    >
                        Voltar
                    </button>
                    <button
                        disabled={!name}
                        onClick={handleStart}
                        className="flex-[2] pixel-button p-4 font-black uppercase text-amber-900 disabled:opacity-50"
                    >
                        Começar Jornada
                    </button>
                </div>
            </div>
        </div>
    );
};
