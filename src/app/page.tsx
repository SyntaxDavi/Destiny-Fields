"use client";

import React from 'react';
import { CharacterCard } from '../components/CharacterCard';
import { CharacterCreationView } from '../components/CharacterCreationView';
import { CombatView } from '../components/CombatView';
import { InventoryView } from '../components/InventoryView';
import { useGameController } from '../hooks/useGameController';

export default function Home() {
  const { viewModel, actions } = useGameController();
  const { phase, hero, inventory, exploration } = viewModel;

  return (
    <main className="min-h-screen py-10 px-4 flex flex-col items-center">

      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-6xl md:text-8xl font-black text-amber-950 retro-text tracking-tighter italic border-b-8 border-amber-900 inline-block px-4 pb-2 bg-amber-100/50">
          DESTINY-FIELDS
        </h1>
        <p className="text-amber-800 font-black uppercase text-sm mt-4 tracking-widest">
          Uma aventura em estilo clássico
        </p>
      </div>

      {phase === 'MENU' && (
        <div className="max-w-md w-full space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <button
            onClick={actions.startCreation}
            className="w-full pixel-button p-6 font-black text-2xl uppercase text-amber-950 flex items-center justify-center gap-4"
          >
            <span>🌱</span> Iniciar Jornada
          </button>

          <button
            onClick={actions.loadGame}
            className="w-full pixel-button p-6 font-black text-2xl uppercase text-amber-950 flex items-center justify-center gap-4 bg-amber-100"
          >
            <span>📜</span> Carregar Jogo
          </button>

          <div className="pt-8 text-center">
            <span className="bg-amber-900 text-white px-3 py-1 text-[10px] font-black uppercase">Alpha 1.0.0</span>
          </div>
        </div>
      )}

      {phase === 'CREATION' && (
        <CharacterCreationView
          onComplete={actions.startJourney}
          onCancel={actions.cancelCreation}
        />
      )}

      {phase === 'EXPLORATION' && hero && (
        <div className="w-full max-w-5xl flex flex-col md:flex-row gap-8 animate-in fade-in duration-500">
          <div className="w-full md:w-72">
            <CharacterCard
              name={hero.name}
              level={hero.level}
              hp={hero.hp}
              maxHp={hero.maxHp}
              gold={hero.gold}
              xp={hero.xp}
              xpToNextLevel={hero.xpToNextLevel}
              className={hero.className}
            />
            <div className="mt-4 space-y-2">
              <button
                onClick={actions.saveGame}
                className="w-full pixel-button p-2 text-[10px] font-black uppercase bg-blue-100 border-blue-900 text-blue-900"
              >
                💾 Salvar Progresso
              </button>
              <button
                onClick={actions.openInventory}
                className="w-full pixel-button p-2 text-[10px] font-black uppercase bg-amber-100 border-amber-900 text-amber-900"
              >
                🎒 Abrir Alforge
              </button>
            </div>
          </div>

          <div className="flex-1 pixel-panel p-8 bg-white flex flex-col">
            <div className="flex-1">
              <h2 className="text-2xl font-black text-amber-900 mb-4 border-b-2 border-slate-200 pb-2 flex items-center gap-2">
                <span>🌿</span> {exploration?.locationName || 'Desconhecido'}
              </h2>
              <div className="bg-green-50 border-2 border-green-200 p-6 rounded-sm italic font-bold text-green-900 mb-6 relative">
                <span className="absolute -top-3 -left-3 text-2xl">🌲</span>
                {exploration?.description}
              </div>
              <p className="font-black text-amber-800 uppercase text-xs mb-4">Eventos Próximos</p>
              <div className="space-y-2">
                <div className="p-3 bg-amber-50 border-2 border-dashed border-amber-300 text-xs font-bold text-amber-800 text-center uppercase">
                  Ruídos estranhos no matagal à frente...
                </div>
              </div>
            </div>

            <div className="mt-8 flex gap-4">
              <button
                onClick={actions.exitToMenu}
                className="pixel-button px-6 py-3 font-black text-xs uppercase bg-slate-300 border-slate-500 shadow-slate-600"
              >
                Sair
              </button>
              <button
                onClick={actions.startCombat}
                className="pixel-button flex-1 p-4 font-black text-lg uppercase bg-green-500 shadow-green-700"
              >
                Investigar Arbustos ⚔️
              </button>
            </div>
          </div>
        </div>
      )}

      {phase === 'COMBAT' && (
        <CombatView />
      )}

      {inventory.isOpen && (
        <InventoryView
          items={inventory.items}
          onClose={actions.closeInventory}
          onUseItem={actions.useItem}
        />
      )}

      {/* Footer Decoration */}
      <div className="mt-20 flex gap-4 opacity-30 select-none grayscale">
        <span className="text-4xl">🌻</span>
        <span className="text-4xl">🐄</span>
        <span className="text-4xl">🏘️</span>
      </div>
    </main>
  );
}
