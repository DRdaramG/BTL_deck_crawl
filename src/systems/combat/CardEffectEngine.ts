import type {
  CardDefinition,
  CardEffect,
  StatusEffectId,
} from "../../data/types";

export interface CombatEntity {
  hp: number;
  maxHp: number;
  block: number;
  ep: number;
  maxEp: number;
  statusEffects: Map<StatusEffectId, number>;
  evading: boolean;
  damageReduction: number;
  damageReflect: boolean;
}

export interface EffectResult {
  type: string;
  value: number;
  description: string;
}

export class CardEffectEngine {
  /** Apply all effects of a card from source to target. */
  static applyCard(
    card: CardDefinition,
    source: CombatEntity,
    target: CombatEntity,
  ): EffectResult[] {
    const results: EffectResult[] = [];
    for (const effect of card.effects) {
      results.push(CardEffectEngine.applyEffect(effect, source, target));
    }
    return results;
  }

  /** Apply a single card effect. */
  static applyEffect(
    effect: CardEffect,
    source: CombatEntity,
    target: CombatEntity,
  ): EffectResult {
    const value = effect.value ?? 0;

    switch (effect.type) {
      case "damage":
      case "damage_all": {
        let amount = value;
        // Overload doubles damage when active (any stacks > 0)
        if ((source.statusEffects.get("overload") ?? 0) > 0) {
          amount *= 2;
        }
        const { actualDamage, blockedAmount } = CardEffectEngine.applyDamage(
          amount,
          target,
        );
        if (target.damageReflect && actualDamage > 0) {
          source.hp = Math.max(0, source.hp - actualDamage);
        }
        return {
          type: effect.type,
          value: actualDamage,
          description: `Dealt ${actualDamage} damage (${blockedAmount} blocked)`,
        };
      }

      case "block": {
        source.block += value;
        return {
          type: "block",
          value,
          description: `Gained ${value} block`,
        };
      }

      case "heal": {
        const healed = Math.min(value, source.maxHp - source.hp);
        source.hp += healed;
        return {
          type: "heal",
          value: healed,
          description: `Healed ${healed} HP`,
        };
      }

      case "evade": {
        source.evading = true;
        return {
          type: "evade",
          value: 1,
          description: "Now evading attacks",
        };
      }

      case "apply_status": {
        if (effect.statusEffect) {
          const current =
            target.statusEffects.get(effect.statusEffect) ?? 0;
          target.statusEffects.set(
            effect.statusEffect,
            current + (effect.statusStacks ?? 1),
          );
        }
        return {
          type: "apply_status",
          value: effect.statusStacks ?? 1,
          description: `Applied ${effect.statusStacks ?? 1} ${effect.statusEffect ?? "unknown"} stacks`,
        };
      }

      case "reduce_ap": {
        // EP is used as AP in this game
        target.ep = Math.max(0, target.ep - value);
        return {
          type: "reduce_ap",
          value,
          description: `Reduced target AP by ${value}`,
        };
      }

      case "damage_reduction": {
        source.damageReduction += value;
        return {
          type: "damage_reduction",
          value,
          description: `Gained ${value} damage reduction`,
        };
      }

      case "damage_reflect": {
        source.damageReflect = true;
        return {
          type: "damage_reflect",
          value: 1,
          description: "Reflecting damage this turn",
        };
      }

      case "passive_heal": {
        // Passive heals are processed during turn-start; record intent only.
        return {
          type: "passive_heal",
          value,
          description: `Passive heal of ${value} per turn registered`,
        };
      }

      case "multi_hit": {
        const hits = effect.hitCount ?? 1;
        let totalDamage = 0;
        let totalBlocked = 0;
        for (let i = 0; i < hits; i++) {
          const { actualDamage, blockedAmount } =
            CardEffectEngine.applyDamage(value, target);
          totalDamage += actualDamage;
          totalBlocked += blockedAmount;
        }
        if (target.damageReflect && totalDamage > 0) {
          source.hp = Math.max(0, source.hp - totalDamage);
        }
        return {
          type: "multi_hit",
          value: totalDamage,
          description: `Hit ${hits} times for ${totalDamage} total damage (${totalBlocked} blocked)`,
        };
      }

      case "salvage": {
        return {
          type: "salvage",
          value,
          description: `Salvaged ${value} currency`,
        };
      }

      case "self_damage": {
        const { actualDamage } = CardEffectEngine.applyDamage(value, source);
        return {
          type: "self_damage",
          value: actualDamage,
          description: `Took ${actualDamage} self-damage`,
        };
      }

      case "boost_damage": {
        return {
          type: "boost_damage",
          value,
          description: `Next attack boosted by ${value}`,
        };
      }

      case "boost_multi_hit": {
        return {
          type: "boost_multi_hit",
          value,
          description: `Next multi-hit count increased by ${value}`,
        };
      }

      case "draw_card": {
        return {
          type: "draw_card",
          value,
          description: `Draw ${value} card(s)`,
        };
      }

      case "exhaust_card": {
        return {
          type: "exhaust_card",
          value,
          description: `Exhaust ${value} card(s)`,
        };
      }

      case "restore_ap": {
        // EP is used as AP in this game
        const restored = Math.min(value, source.maxEp - source.ep);
        source.ep += restored;
        return {
          type: "restore_ap",
          value: restored,
          description: `Restored ${restored} AP`,
        };
      }
    }
  }

  /** Apply damage to a target considering block, armor_break, evading, sensor_jam, and damage_reduction. */
  static applyDamage(
    amount: number,
    target: CombatEntity,
  ): { actualDamage: number; blockedAmount: number } {
    if (target.evading) {
      return { actualDamage: 0, blockedAmount: 0 };
    }

    let incoming = amount;

    // sensor_jam: reduce damage by 50%
    const sensorJam = target.statusEffects.get("sensor_jam") ?? 0;
    if (sensorJam > 0) {
      incoming = Math.floor(incoming * 0.5);
    }

    // armor_break: increase damage taken by stacks
    const armorBreak = target.statusEffects.get("armor_break") ?? 0;
    incoming += armorBreak;

    // damage_reduction
    incoming = Math.max(0, incoming - target.damageReduction);

    // Apply block
    const blockedAmount = Math.min(target.block, incoming);
    target.block -= blockedAmount;
    const afterBlock = incoming - blockedAmount;

    target.hp = Math.max(0, target.hp - afterBlock);

    return { actualDamage: afterBlock, blockedAmount };
  }

  /** Process turn-start status effects: repair heals, emp disables. */
  static processTurnStartEffects(entity: CombatEntity): EffectResult[] {
    const results: EffectResult[] = [];

    // repair: heal by stacks
    const repairStacks = entity.statusEffects.get("repair") ?? 0;
    if (repairStacks > 0) {
      const healed = Math.min(repairStacks, entity.maxHp - entity.hp);
      entity.hp += healed;
      results.push({
        type: "repair",
        value: healed,
        description: `Repair healed ${healed} HP`,
      });
    }

    // emp: signal that actions are disabled
    const empStacks = entity.statusEffects.get("emp") ?? 0;
    if (empStacks > 0) {
      results.push({
        type: "emp",
        value: empStacks,
        description: "EMP active — actions disabled this turn",
      });
    }

    // scramble: signal increased card costs
    const scrambleStacks = entity.statusEffects.get("scramble") ?? 0;
    if (scrambleStacks > 0) {
      results.push({
        type: "scramble",
        value: scrambleStacks,
        description: `Scramble — card costs increased by ${scrambleStacks}`,
      });
    }

    return results;
  }

  /** Process turn-end status effects: burn damage, ion damage (+ possible EMP). */
  static processTurnEndEffects(entity: CombatEntity): EffectResult[] {
    const results: EffectResult[] = [];

    // burn: deal stacks as damage
    const burnStacks = entity.statusEffects.get("burn") ?? 0;
    if (burnStacks > 0) {
      entity.hp = Math.max(0, entity.hp - burnStacks);
      results.push({
        type: "burn",
        value: burnStacks,
        description: `Burn dealt ${burnStacks} damage`,
      });
    }

    // ion: deal stacks as damage; if >= 3 stacks, apply EMP
    const ionStacks = entity.statusEffects.get("ion") ?? 0;
    if (ionStacks > 0) {
      entity.hp = Math.max(0, entity.hp - ionStacks);
      results.push({
        type: "ion",
        value: ionStacks,
        description: `Ion dealt ${ionStacks} damage`,
      });

      if (ionStacks >= 3) {
        const currentEmp = entity.statusEffects.get("emp") ?? 0;
        entity.statusEffects.set("emp", currentEmp + 1);
        results.push({
          type: "emp_applied",
          value: 1,
          description: "Ion overload applied EMP",
        });
      }
    }

    return results;
  }

  /** Tick down / remove status effects at end of turn. */
  static tickStatusEffects(entity: CombatEntity): void {
    for (const [id, stacks] of entity.statusEffects) {
      switch (id) {
        case "burn":
        case "repair":
        case "emp": {
          // Decrease by 1 each turn
          const next = stacks - 1;
          if (next <= 0) {
            entity.statusEffects.delete(id);
          } else {
            entity.statusEffects.set(id, next);
          }
          break;
        }
        case "overload":
        case "ion":
        case "scramble":
        case "armor_break":
        case "sensor_jam": {
          // These persist until explicitly removed or consumed
          // Keep stacks as-is; game logic manages removal
          break;
        }
      }
    }
  }
}
