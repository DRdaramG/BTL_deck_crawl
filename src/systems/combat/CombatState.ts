import type {
  EnemyDefinition,
  EnemyIntent,
  ShipDefinition,
  StatusEffectId,
  CardDefinition,
} from "../../data/types";
import { CARDS } from "../../data";
import { CardEffectEngine, type CombatEntity, type EffectResult } from "./CardEffectEngine";
import { Deck } from "../deck/Deck";

export type CombatPhase =
  | "COMBAT_START"
  | "TURN_START"
  | "PLAYER_ACTION"
  | "PLAYER_END"
  | "ENEMY_ACTION"
  | "ENEMY_END"
  | "VICTORY"
  | "DEFEAT";

export interface CombatLog {
  turn: number;
  phase: CombatPhase;
  message: string;
}

export class CombatState {
  player: CombatEntity;
  enemy: CombatEntity;
  enemyDef: EnemyDefinition;
  shipDef: ShipDefinition;
  deck: Deck;

  phase: CombatPhase;
  turn: number;
  currentIntent: EnemyIntent;

  logs: CombatLog[];

  private drawPerTurn: number;
  private baseEp: number;

  constructor(shipDef: ShipDefinition, enemyDef: EnemyDefinition, deck: Deck) {
    this.shipDef = shipDef;
    this.enemyDef = enemyDef;
    this.deck = deck;

    this.drawPerTurn = 5;
    this.baseEp = 3;

    this.player = {
      hp: shipDef.maxHp,
      maxHp: shipDef.maxHp,
      block: 0,
      ep: this.baseEp,
      maxEp: this.baseEp,
      statusEffects: new Map<StatusEffectId, number>(),
      evading: false,
      damageReduction: 0,
      damageReflect: false,
    };

    this.enemy = {
      hp: enemyDef.hp,
      maxHp: enemyDef.hp,
      block: 0,
      ep: 0,
      maxEp: 0,
      statusEffects: new Map<StatusEffectId, number>(),
      evading: false,
      damageReduction: 0,
      damageReflect: false,
    };

    this.phase = "COMBAT_START";
    this.turn = 0;
    this.logs = [];

    this.currentIntent = this.determineIntent(0);
  }

  startCombat(): void {
    if (this.phase !== "COMBAT_START") return;
    this.addLog("Combat begins!");
    this.phase = "TURN_START";
    this.startTurn();
  }

  startTurn(): void {
    this.turn++;
    this.player.ep = this.player.maxEp;
    this.player.block = 0;
    this.player.evading = false;
    this.player.damageReduction = 0;
    this.player.damageReflect = false;

    const startEffects = CardEffectEngine.processTurnStartEffects(this.player);
    for (const effect of startEffects) {
      this.addLog(`Turn start effect: ${effect.description}`);
    }

    this.applyShipPassive("on_turn_start");

    if (this.player.hp <= 0) {
      this.phase = "DEFEAT";
      this.addLog("Ship destroyed!");
      return;
    }

    this.deck.draw(this.drawPerTurn);
    this.currentIntent = this.determineIntent(this.turn);
    this.phase = "PLAYER_ACTION";
    this.addLog(
      `Turn ${this.turn}: Drew ${this.drawPerTurn} cards. EP: ${this.player.ep}/${this.player.maxEp}`
    );
    this.addLog(`Enemy intends to: ${this.currentIntent.description}`);
  }

  playCard(instanceId: string): EffectResult[] {
    if (this.phase !== "PLAYER_ACTION") return [];

    const hand = this.deck.getHand();
    const cardInstance = hand.find((c) => c.instanceId === instanceId);
    if (!cardInstance) return [];

    const cardDef = Deck.getDefinition(cardInstance.cardId);
    if (!cardDef) return [];

    const epCost = this.getEffectiveEpCost(cardDef);
    if (this.player.ep < epCost) return [];

    const empStacks = this.player.statusEffects.get("emp");
    if (empStacks !== undefined && empStacks > 0) return [];

    this.player.ep -= epCost;
    this.deck.playCard(instanceId);

    const results = CardEffectEngine.applyCard(cardDef, this.player, this.enemy);

    for (const result of results) {
      this.addLog(`Played ${cardDef.name}: ${result.description}`);
    }

    this.triggerCardPassive(cardDef);

    if (this.enemy.hp <= 0) {
      this.phase = "VICTORY";
      this.addLog(`${this.enemyDef.name} destroyed! Victory!`);
      this.applyShipPassive("on_kill");
      return results;
    }

    return results;
  }

  endPlayerTurn(): void {
    if (this.phase !== "PLAYER_ACTION") return;
    this.phase = "PLAYER_END";

    this.deck.discardHand();

    const endEffects = CardEffectEngine.processTurnEndEffects(this.player);
    for (const effect of endEffects) {
      this.addLog(`Player turn end: ${effect.description}`);
    }

    CardEffectEngine.tickStatusEffects(this.player);

    if (this.player.hp <= 0) {
      this.phase = "DEFEAT";
      this.addLog("Ship destroyed!");
      return;
    }

    this.phase = "ENEMY_ACTION";
    this.executeEnemyTurn();
  }

  private executeEnemyTurn(): void {
    const intent = this.currentIntent;
    this.addLog(`${this.enemyDef.name} uses: ${intent.description}`);

    switch (intent.type) {
      case "attack": {
        const { actualDamage, blockedAmount } = CardEffectEngine.applyDamage(
          intent.value,
          this.player
        );
        if (blockedAmount > 0) {
          this.addLog(`Blocked ${blockedAmount} damage`);
        }
        this.addLog(`${this.enemyDef.name} deals ${actualDamage} damage`);
        break;
      }
      case "defend":
        this.enemy.block += intent.value;
        this.addLog(`${this.enemyDef.name} gains ${intent.value} block`);
        break;
      case "buff": {
        const healAmount = Math.min(intent.value, this.enemy.maxHp - this.enemy.hp);
        this.enemy.hp += healAmount;
        this.addLog(`${this.enemyDef.name} heals for ${healAmount}`);
        break;
      }
      case "debuff":
        this.applyDebuffToPlayer(intent.value);
        break;
    }

    this.phase = "ENEMY_END";

    const enemyEndEffects = CardEffectEngine.processTurnEndEffects(this.enemy);
    for (const effect of enemyEndEffects) {
      this.addLog(`Enemy turn end: ${effect.description}`);
    }

    CardEffectEngine.tickStatusEffects(this.enemy);
    this.enemy.block = 0;

    if (this.player.hp <= 0) {
      this.phase = "DEFEAT";
      this.addLog("Ship destroyed!");
      return;
    }

    this.startTurn();
  }

  getEnemyIntent(): EnemyIntent {
    return this.currentIntent;
  }

  canPlayCard(instanceId: string): boolean {
    if (this.phase !== "PLAYER_ACTION") return false;

    const empStacks = this.player.statusEffects.get("emp");
    if (empStacks !== undefined && empStacks > 0) return false;

    const hand = this.deck.getHand();
    const cardInstance = hand.find((c) => c.instanceId === instanceId);
    if (!cardInstance) return false;

    const cardDef = Deck.getDefinition(cardInstance.cardId);
    if (!cardDef) return false;

    const epCost = this.getEffectiveEpCost(cardDef);
    return this.player.ep >= epCost;
  }

  isOver(): boolean {
    return this.phase === "VICTORY" || this.phase === "DEFEAT";
  }

  addLog(message: string): void {
    this.logs.push({
      turn: this.turn,
      phase: this.phase,
      message,
    });
  }

  private determineIntent(turn: number): EnemyIntent {
    const patterns = this.enemyDef.intentPatterns;
    if (patterns.length === 0) {
      return { type: "attack", value: 0, description: "Idle" };
    }
    const index = turn <= 0 ? 0 : (turn - 1) % patterns.length;
    const intent = patterns[index];
    // Safety for noUncheckedIndexedAccess: patterns[index] could be undefined
    return intent ?? { type: "attack", value: 0, description: "Idle" };
  }

  private getEffectiveEpCost(cardDef: CardDefinition): number {
    const scrambleStacks = this.player.statusEffects.get("scramble");
    const penalty =
      scrambleStacks !== undefined && scrambleStacks > 0 ? scrambleStacks : 0;
    return cardDef.epCost + penalty;
  }

  private triggerCardPassive(cardDef: CardDefinition): void {
    const passive = this.shipDef.passive;
    if (!passive) return;

    let shouldTrigger = false;
    switch (passive.trigger) {
      case "on_attack_card":
        shouldTrigger = cardDef.type === "attack";
        break;
      case "on_block_card":
        shouldTrigger = cardDef.type === "defense";
        break;
      case "on_evade_card":
        shouldTrigger = cardDef.effects.some((e) => e.type === "evade");
        break;
      case "on_drone_card":
        shouldTrigger = cardDef.type === "skill";
        break;
      default:
        break;
    }

    if (shouldTrigger) {
      this.executePassiveEffect(passive.effectType, passive.value);
    }
  }

  private applyShipPassive(
    trigger: "on_turn_start" | "on_kill"
  ): void {
    const passive = this.shipDef.passive;
    if (!passive || passive.trigger !== trigger) return;
    this.executePassiveEffect(passive.effectType, passive.value);
  }

  private executePassiveEffect(effectType: string, value: number): void {
    switch (effectType) {
      case "restore_ap":
        this.player.ep = Math.min(this.player.ep + value, this.player.maxEp);
        this.addLog(`Passive: Restored ${value} EP`);
        break;
      case "add_block":
        this.player.block += value;
        this.addLog(`Passive: Gained ${value} block`);
        break;
      case "add_damage":
        this.addLog(`Passive: Next attack deals +${value} damage`);
        break;
      case "heal": {
        const healAmount = Math.min(value, this.player.maxHp - this.player.hp);
        this.player.hp += healAmount;
        this.addLog(`Passive: Healed ${healAmount} HP`);
        break;
      }
      case "gain_currency":
        this.addLog(`Passive: Gained ${value} currency`);
        break;
      case "damage_reduction":
        this.player.damageReduction += value;
        this.addLog(`Passive: Damage reduction +${value}`);
        break;
      case "draw_card":
        this.deck.draw(value);
        this.addLog(`Passive: Drew ${value} card(s)`);
        break;
      case "none":
        break;
    }
  }

  private applyDebuffToPlayer(value: number): void {
    const currentBurn = this.player.statusEffects.get("burn") ?? 0;
    this.player.statusEffects.set("burn", currentBurn + value);
    this.addLog(`${this.enemyDef.name} applies ${value} burn`);
  }
}
