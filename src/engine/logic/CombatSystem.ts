import { Combatant } from "../core/Combatant";
import { ReactionType } from "../core/CombatTypes";
import { wait } from "../utils/wait";

export interface AttackResult {
    hit: boolean;
    damage: number;
    reaction: ReactionType;
    countered: boolean;
}

export class CombatSystem {
    public static async resolveAttack(attacker: Combatant, target: Combatant): Promise<AttackResult> {
        // 1. Get Reaction Choice from Target
        const reaction = await target.handleReaction(attacker);

        // 2. Resolve Hit Chance (D20 + Modifiers)
        const d20 = Math.floor(Math.random() * 20) + 1;
        const attackerMod = (attacker as any).getModifier(attacker.dexterity);
        const attackRoll = d20 + attackerMod;

        let targetDefenseBonus = (target as any).getModifier(target.agility);
        if (reaction === ReactionType.DODGE) {
            console.log(`💨 ${target.name} tenta esquivar! (+2 Defesa)`);
            targetDefenseBonus += 2;
        }

        const armorClass = 10 + targetDefenseBonus;
        const isHit = attackRoll >= armorClass || d20 === 20;

        console.log(`🎲 ${attacker.name} rolou ${d20} + ${attackerMod} = ${attackRoll} vs Defesa ${armorClass}`);

        let resultDamage = 0;
        let isCountered = false;

        if (isHit) {
            console.log(`✅ ACERTOU!`);
            resultDamage = (attacker as any).weaponDamage;
            target.takeDamage(resultDamage);
        } else {
            console.log(`❌ ERROU!`);
            if (reaction === ReactionType.COUNTER && target.isAlive()) {
                isCountered = await this.resolveCounterAttack(target, attacker);
            }
        }

        return {
            hit: isHit,
            damage: resultDamage,
            reaction: reaction,
            countered: isCountered
        };
    }

    private static async resolveCounterAttack(counterer: Combatant, target: Combatant): Promise<boolean> {
        console.log(`⚡ ${counterer.name} vê uma abertura e contra-ataca!`);
        await wait(500);

        const d20 = Math.floor(Math.random() * 20) + 1;
        const roll = d20 + (counterer as any).getModifier(counterer.dexterity);

        console.log(`🎲 Teste de Contra-ataque: ${d20} + mod = ${roll} vs 12`);

        if (roll >= 12) {
            console.log(`🔥 CONTRA-ATAQUE SUCEDIDO!`);
            const damage = (counterer as any).weaponDamage;
            target.takeDamage(damage);
            return true;
        } else {
            console.log(`💨 Quase! O contra-ataque falhou.`);
            return false;
        }
    }
}
