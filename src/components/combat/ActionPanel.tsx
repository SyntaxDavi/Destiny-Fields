import React, { useState, useEffect } from "react";
import { ActionPanelViewModel } from "./viewModels";

interface ActionPanelProps {
    model: ActionPanelViewModel | null;
    onAction: (id: string) => void;
}

export function ActionPanel({ model, onAction }: ActionPanelProps) {
    const [localIdLocked, setLocalIdLocked] = useState<string | null>(null);

    // Reset local lock when model changes (new turn/menu)
    useEffect(() => {
        if (model?.state !== 'COMMITTING') {
            setLocalIdLocked(null);
        }
    }, [model]);

    if (!model) {
        return (
            <div className="h-full flex items-center justify-center text-amber-900/30 italic text-xs font-bold uppercase tracking-wide">
                Aguardando turno...
            </div>
        );
    }

    const handleAction = (id: string) => {
        if (localIdLocked || model.state === 'LOCKED') return;
        setLocalIdLocked(id);
        onAction(id);
    };

    return (
        <div className="space-y-4 w-full animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="py-2 border-b-2 border-amber-900/10 mb-2">
                <p className="text-[10px] font-black text-amber-900/60 text-center uppercase tracking-[0.2em]">
                    {model.title}
                </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
                {model.options.map((opt) => {
                    const isLocked = model.state === 'LOCKED' || localIdLocked !== null;
                    const isSelected = localIdLocked === opt.id;

                    return (
                        <button
                            key={opt.id}
                            disabled={isLocked}
                            onClick={() => handleAction(opt.id)}
                            className={`
                                group relative text-left transition-all duration-200
                                action-button w-full rounded overflow-hidden
                                ${isSelected ? 'bg-amber-100 border-amber-500 transform scale-[0.98]' : ''}
                            `}
                        >
                            <span className="relative z-10 flex items-center justify-between">
                                <span className={isSelected ? 'text-amber-900' : ''}>{opt.label}</span>
                                {!isLocked && !isSelected && <span className="text-amber-500/50 group-hover:text-amber-600 text-xs transition-colors">►</span>}
                                {isSelected && (
                                    <span className="flex items-center gap-2 text-[10px] font-black text-amber-600 uppercase tracking-wider animate-pulse">
                                        Confirmando...
                                    </span>
                                )}
                            </span>
                        </button>
                    );
                })}
            </div>

            {model.state === 'LOCKED' && !localIdLocked && (
                <p className="text-center text-[10px] text-amber-900/40 uppercase font-bold animate-pulse">
                    Turno do Inimigo
                </p>
            )}
        </div>
    );
}
