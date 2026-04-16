import type {
  EnemyDefinition,
  EnemyIntent,
  ShipDefinition,
  StatusEffectId,
  CardDefinition,
  PlacedEquipment,
  EquipmentCategory,
} from "../../data/types";
import { CARDS, EQUIPMENT } from "../../data";
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

/** Categories that represent critical ship sections for game over condition. */
const CRITICAL_CATEGORIES: ReadonlySet<EquipmentCategory> = new Set([
  "crew_quarter",
]);

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

  /** Equipment placed on the ship at combat start. */
  placedEquipment: PlacedEquipment[];
  /** Set of equipment IDs that have been destroyed during combat. */
  disabledEquipmentIds: Set<string>;

  /** Shield points — absorbs damage before armor. */
  shield: number;
  /** Armor points — absorbs damage after shield, before HP. */
  armor: number;

  private drawPerTurn: number;
  private baseEp: number;

  constructor(
    shipDef: ShipDefinition,
    enemyDef: EnemyDefinition,
    deck: Deck,
    placedEquipment: PlacedEquipment[],
  ) {
    this.shipDef = shipDef;
    this.enemyDef = enemyDef;
    this.deck = deck;
    this.placedEquipment = placedEquipment;
    this.disabledEquipmentIds = new Set();

    this.drawPerTurn = 5;
    this.baseEp = 3;

    this.shield = 0;
    this.armor = 0;

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

    if (this.checkDefeat()) return;

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

    // Check if card belongs to destroyed equipment
    if (this.isCardDisabled(cardInstance.cardId)) return [];

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

    if (this.checkDefeat()) return;

    this.phase = "ENEMY_ACTION";
    this.executeEnemyTurn();
  }

  private executeEnemyTurn(): void {
    const intent = this.currentIntent;
    this.addLog(`${this.enemyDef.name} uses: ${intent.description}`);

    switch (intent.type) {
      case "attack": {
        this.applyEnemyAttack(intent.value);
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

    if (this.checkDefeat()) return;

    this.startTurn();
  }

  /**
   * Apply enemy attack damage through the shield → armor → hull pipeline.
   * When hull is hit, a random equipped (non-disabled) equipment takes damage.
   */
  private applyEnemyAttack(rawDamage: number): void {
    let incoming = rawDamage;

    // sensor_jam: reduce damage by 50%
    const sensorJam = this.player.statusEffects.get("sensor_jam") ?? 0;
    if (sensorJam > 0) {
      incoming = Math.floor(incoming * 0.5);
    }

    // armor_break: increase damage taken
    const armorBreak = this.player.statusEffects.get("armor_break") ?? 0;
    incoming += armorBreak;

    // damage_reduction
    incoming = Math.max(0, incoming - this.player.damageReduction);

    // evading
    if (this.player.evading) {
      this.addLog("Attack evaded!");
      return;
    }

    // 1. Shield absorbs first
    if (this.shield > 0) {
      const shieldAbsorb = Math.min(this.shield, incoming);
      this.shield -= shieldAbsorb;
      incoming -= shieldAbsorb;
      if (shieldAbsorb > 0) {
        this.addLog(`Shield absorbed ${shieldAbsorb} damage (remaining: ${this.shield})`);
      }
    }

    // 2. Block absorbs next (from block cards)
    if (this.player.block > 0 && incoming > 0) {
      const blockAbsorb = Math.min(this.player.block, incoming);
      this.player.block -= blockAbsorb;
      incoming -= blockAbsorb;
      if (blockAbsorb > 0) {
        this.addLog(`Block absorbed ${blockAbsorb} damage`);
      }
    }

    // 3. Armor absorbs next
    if (this.armor > 0 && incoming > 0) {
      const armorAbsorb = Math.min(this.armor, incoming);
      this.armor -= armorAbsorb;
      incoming -= armorAbsorb;
      if (armorAbsorb > 0) {
        this.addLog(`Armor absorbed ${armorAbsorb} damage (remaining: ${this.armor})`);
      }
    }

    // 4. Hull damage → HP loss + possible equipment destruction
    if (incoming > 0) {
      this.player.hp = Math.max(0, this.player.hp - incoming);
      this.addLog(`Hull hit! ${incoming} damage to HP (HP: ${this.player.hp}/${this.player.maxHp})`);

      // Equipment destruction: random active equipment gets hit
      this.damageRandomEquipment();
    }
  }

  /**
   * Randomly destroy one active (non-disabled) equipment piece.
   * Disables all cards provided by that equipment.
   */
  private damageRandomEquipment(): void {
    const activeEquipment = this.placedEquipment.filter(
      (pe) => !this.disabledEquipmentIds.has(pe.equipmentId),
    );

    if (activeEquipment.length === 0) return;

    const target = activeEquipment[Math.floor(Math.random() * activeEquipment.length)]!;
    this.disabledEquipmentIds.add(target.equipmentId);

    const equipDef = EQUIPMENT[target.equipmentId];
    const equipName = equipDef?.name ?? target.equipmentId;
    this.addLog(`⚠ ${equipName} destroyed! Its cards are now disabled.`);

    // Check game over condition
    this.checkGameOver();
  }

  /**
   * Check if all critical equipment (crew_quarter) has been destroyed.
   * If so, trigger immediate game over.
   */
  private checkGameOver(): boolean {
    // Gather all placed critical equipment IDs
    const criticalIds: string[] = [];
    for (const pe of this.placedEquipment) {
      const equipDef = EQUIPMENT[pe.equipmentId];
      if (equipDef && CRITICAL_CATEGORIES.has(equipDef.category)) {
        criticalIds.push(pe.equipmentId);
      }
    }

    // If no critical equipment was placed, skip this check
    if (criticalIds.length === 0) return false;

    // Check if ALL critical equipment is destroyed
    const allDestroyed = criticalIds.every((id) => this.disabledEquipmentIds.has(id));
    if (allDestroyed) {
      this.phase = "DEFEAT";
      this.addLog("All critical ship sections destroyed — GAME OVER!");
      return true;
    }

    return false;
  }

  /** Check defeat conditions: HP or critical sections. */
  private checkDefeat(): boolean {
    if (this.player.hp <= 0) {
      this.phase = "DEFEAT";
      this.addLog("Ship destroyed!");
      return true;
    }
    return this.checkGameOver();
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

    // Check if card belongs to a destroyed equipment
    if (this.isCardDisabled(cardInstance.cardId)) return false;

    const cardDef = Deck.getDefinition(cardInstance.cardId);
    if (!cardDef) return false;

    const epCost = this.getEffectiveEpCost(cardDef);
    return this.player.ep >= epCost;
  }

  /** Check if a card ID belongs to any destroyed equipment. */
  isCardDisabled(cardId: string): boolean {
    for (const pe of this.placedEquipment) {
      if (!this.disabledEquipmentIds.has(pe.equipmentId)) continue;
      const equipDef = EQUIPMENT[pe.equipmentId];
      if (!equipDef) continue;
      for (const provided of equipDef.providedCards) {
        if (provided.cardId === cardId) return true;
      }
    }
    return false;
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
