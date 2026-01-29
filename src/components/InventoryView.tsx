"use client";

import React from 'react';
import { Item, ItemType, Rarity } from '../engine/core/Item';

interface InventoryViewProps {
    items: Item[];
    onUseItem: (itemId: string) => void;
    onClose: () => void;
}

const getRarityColor = (rarity: Rarity) => {
    switch (rarity) {
        case Rarity.RARE: return 'text-blue-600 border-blue-200 bg-blue-50';
        case Rarity.EPIC: return 'text-purple-600 border-purple-200 bg-purple-50';
        case Rarity.LEGENDARY: return 'text-orange-600 border-orange-200 bg-orange-50';
        default: return 'text-amber-900/70 border-amber-200 bg-amber-50';
    }
};

const getItemIcon = (type: ItemType) => {
    switch (type) {
        case ItemType.CONSUMABLE: return '🧪';
        case ItemType.WEAPON: return '⚔️';
        case ItemType.ARMOR: return '🛡️';
        case ItemType.ACCESSORY: return '💍';
        default: return '📦';
    }
};

export const InventoryView: React.FC<InventoryViewProps> = ({ items, onUseItem, onClose }) => {
    return (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="pixel-panel w-full max-w-lg bg-white p-6 flex flex-col max-h-[80vh]">
                <div className="flex justify-between items-center mb-6 border-b-2 border-amber-100 pb-2">
                    <h2 className="text-2xl font-black text-amber-900 flex items-center gap-2">
                        <span>🎒</span> ALFORGE
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-amber-900/40 hover:text-red-500 font-black text-xl transition-colors"
                    >
                        ✕
                    </button>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 space-y-3 custom-scrollbar">
                    {items.length === 0 ? (
                        <div className="text-center py-10">
                            <p className="text-amber-900/40 font-bold italic uppercase text-sm">Seu alforge está vazio...</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div
                                key={item.id}
                                className={`flex items-center gap-4 p-3 border-2 rounded-sm transition-all hover:scale-[1.01] ${getRarityColor(item.rarity)}`}
                            >
                                <div className="text-3xl bg-white/50 p-2 rounded border border-inherit">
                                    {getItemIcon(item.type)}
                                </div>
                                <div className="flex-1">
                                    <div className="flex justify-between items-start">
                                        <h4 className="font-black uppercase text-sm">{item.name}</h4>
                                        <span className="text-[8px] font-black uppercase px-2 py-0.5 bg-white/50 border border-inherit rounded-full">
                                            {item.rarity}
                                        </span>
                                    </div>
                                    <p className="text-[10px] font-bold opacity-80 leading-tight mt-1 italic">
                                        "{item.description}"
                                    </p>
                                </div>
                                {item.type === ItemType.CONSUMABLE && (
                                    <button
                                        onClick={() => onUseItem(item.id)}
                                        className="pixel-button px-4 py-2 text-[10px] bg-green-500 text-white font-black uppercase shadow-green-700 hover:bg-green-600"
                                    >
                                        USAR
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>

                <div className="mt-6 pt-4 border-t-2 border-amber-100 flex justify-between items-center">
                    <p className="text-[10px] font-black text-amber-900/40 uppercase">
                        Capacidade: {items.length} / 20
                    </p>
                    <button
                        onClick={onClose}
                        className="pixel-button px-6 py-2 text-xs bg-amber-900 text-white font-black uppercase shadow-sm hover:bg-amber-800"
                    >
                        FECHAR
                    </button>
                </div>
            </div>
        </div>
    );
};
