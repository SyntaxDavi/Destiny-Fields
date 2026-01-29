import React from "react";
import { HeroPanel } from "./HeroPanel";
import { EnemyPanel } from "./EnemyPanel";
import { BattleCenter } from "./BattleCenter";
import { ActionPanel } from "./ActionPanel";
import { CombatViewModel } from "./viewModels";

interface CombatLayoutProps {
    viewModel: CombatViewModel;
    onMakeChoice: (id: string) => void;
    onStartGame: () => void;
}

export function CombatLayout({ viewModel, onMakeChoice, onStartGame }: CombatLayoutProps) {
    const { hero, enemy, logs, actionPanel, phase, turnOwner, message } = viewModel;

    // Start Phase (Menu)
    if (phase === 'MENU' && hero) {
        return (
            <div className="h-screen w-full texture-paper flex items-center justify-center p-6 font-sans relative overflow-hidden">
                <div className="absolute inset-0 bg-white/60 pointer-events-none" />

                <div className="relative z-10 flex flex-col items-center gap-8 max-w-lg w-full animate-in fade-in zoom-in duration-500">
                    <h1 className="text-6xl font-serif font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-b from-amber-700 to-amber-900 drop-shadow-sm uppercase text-center leading-tight">
                        Destiny<br />Fields
                    </h1>

                    <div className="glass-panel panel-border p-8 w-full flex flex-col items-center gap-6 bg-white/80">
                        {/* Hero Preview */}
                        <div className="flex flex-col items-center">
                            <div className="w-24 h-24 bg-amber-100/50 rounded-full mb-4 flex items-center justify-center text-4xl ring-4 ring-amber-500/20 shadow-lg">
                                🛡️
                            </div>
                            <h2 className="text-2xl font-black text-amber-900 uppercase tracking-tight">{hero.name}</h2>
                            <p className="text-amber-900/60 text-xs font-bold uppercase tracking-widest">
                                {hero.className} • Lv. {hero.level}
                            </p>
                        </div>

                        <button
                            onClick={onStartGame}
                            className="w-full py-4 action-button text-lg tracking-[0.2em] shadow-lg transform transition-all hover:scale-[1.02] active:scale-[0.98]"
                        >
                            INICIAR AVENTURA
                        </button>
                    </div>

                    <p className="text-amber-900/30 text-[10px] tracking-[0.3em] uppercase font-black">v0.2.0 • Alpha</p>
                </div>
            </div>
        );
    }

    // Loading State
    if (!hero) {
        return (
            <div className="h-screen w-full texture-paper flex items-center justify-center">
                <p className="text-amber-900/60 animate-pulse font-bold uppercase tracking-widest text-sm">
                    Carregando Mundo...
                </p>
            </div>
        );
    }

    // Combat Phase
    return (
        <div className="h-screen w-full texture-paper flex items-center justify-center p-6 font-sans relative overflow-hidden">
            {/* Dynamic Background Shader/Overlay */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-amber-100/10 to-amber-900/5 pointer-events-none" />

            <div className="w-full max-w-7xl grid grid-cols-12 gap-6 relative z-10 h-[85vh]">

                {/* ─── LEFT COLUMN: HERO ─── */}
                <div className="col-span-3 flex flex-col h-full gap-6">
                    <HeroPanel hero={hero} />

                    {/* Action Panel anchored below hero */}
                    <div className="glass-panel panel-border p-6 flex-1 bg-white/80">
                        <ActionPanel model={actionPanel} onAction={onMakeChoice} />
                    </div>
                </div>

                {/* ─── CENTER COLUMN: BATTLE CENTER ─── */}
                <div className="col-span-6 h-full">
                    <BattleCenter
                        logs={logs}
                        phase={phase}
                        turnOwner={turnOwner}
                        message={message}
                    />
                </div>

                {/* ─── RIGHT COLUMN: ENEMY ─── */}
                <div className="col-span-3 h-full">
                    <EnemyPanel enemy={enemy} />
                </div>

            </div>
        </div>
    );
}
