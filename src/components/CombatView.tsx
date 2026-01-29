import React from "react";
import { useGame } from "../hooks/useGame";
import { CombatLayout } from "./combat/CombatLayout";

export function CombatView() {
    const { viewModel, makeChoice, startGame } = useGame();

    return (
        <CombatLayout
            viewModel={viewModel}
            onMakeChoice={makeChoice}
            onStartGame={startGame}
        />
    );
}
