import { ReactionType } from "./CombatTypes";

export interface Combatant {
    name: string;
    speed: number;
    agility: number;
    dexterity: number;
    isPlayer: boolean;
    isAlive(): boolean;
    takeDamage(damage: number): void;
    handleReaction(attacker: Combatant): Promise<ReactionType>;
}
