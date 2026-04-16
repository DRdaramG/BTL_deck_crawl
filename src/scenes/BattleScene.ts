import * as Phaser from "phaser";
import { SHIPS, EQUIPMENT, ENEMIES } from "../data";
import type {
  ShipDefinition,
  PlacedEquipment,
  EnemyDefinition,
  CardDefinition,
  StatusEffectId,
} from "../data";
import { Deck, type CardInstance } from "../systems/deck/Deck";
import { CombatState, type CombatLog } from "../systems/combat/CombatState";
import {
  Color, FONT_FAMILY,
  TITLE_STYLE, SUBTITLE_STYLE, BODY_STYLE, HELP_STYLE, BUTTON_STYLE,
  buildPanel, BOX_SINGLE, BOX_DOUBLE,
  gauge, epDots,
  addScanlines, addVignette,
  truncate,
} from "../ui";

// ─── Layout constants ───────────────────────────────────────

/** Maximum cards shown in hand */
const MAX_HAND = 7;

/** Card dimensions */
const CARD_IW = 22;
const CARD_PX_W = 170;

/** Combat log constants */
const LOG_X = 20;
const LOG_Y = 420;
const LOG_LINES = 10;

// ─── Scene ──────────────────────────────────────────────────

interface BattleSceneData {
  shipId: string;
  placedEquipment: PlacedEquipment[];
  enemyId: string;
}

/**
 * BattleScene — 전투 씬 (M1)
 *
 * 플레이어와 적 함선의 카드 전투를 처리한다.
 * ASCII ART 콘솔 스타일 UI로 전투 진행.
 */
export class BattleScene extends Phaser.Scene {
  private combat!: CombatState;
  private shipDef!: ShipDefinition;
  private enemyDef!: EnemyDefinition;

  // UI groups
  private uiObjects: Phaser.GameObjects.GameObject[] = [];

  // Tooltip
  private tooltipText: Phaser.GameObjects.Text | null = null;

  constructor() {
    super({ key: "BattleScene" });
  }

  // ─── Lifecycle ────────────────────────────────────────────

  init(data: BattleSceneData): void {
    const shipKey = data.shipId ?? "corvette";
    const ship = SHIPS[shipKey];
    if (!ship) throw new Error(`Unknown ship: ${shipKey}`);
    this.shipDef = ship;

    const enemy = ENEMIES.find((e) => e.id === data.enemyId);
    if (!enemy) throw new Error(`Unknown enemy: ${data.enemyId}`);
    this.enemyDef = enemy;

    // Build deck from placed equipment
    const deck = new Deck();
    const placed = data.placedEquipment ?? [];
    deck.buildFromEquipment(placed);

    this.combat = new CombatState(this.shipDef, this.enemyDef, deck, placed);
  }

  create(): void {
    // CRT effects
    addScanlines(this);
    addVignette(this);

    // Start combat
    this.combat.startCombat();

    // Render full UI
    this.renderUI();

    // Setup keyboard
    this.setupKeyboard();
  }

  // ─── Keyboard ─────────────────────────────────────────────

  private setupKeyboard(): void {
    const kb = this.input.keyboard;
    if (!kb) return;

    kb.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on("down", () => {
      this.onEndTurn();
    });

    kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on("down", () => {
      this.scene.start("ShipSelectScene");
    });

    // Number keys 1-7 for quick card play
    for (let i = 0; i < MAX_HAND; i++) {
      const keyCode = Phaser.Input.Keyboard.KeyCodes.ONE + i;
      kb.addKey(keyCode).on("down", () => {
        this.playCardAtIndex(i);
      });
    }
  }

  // ─── Actions ──────────────────────────────────────────────

  private playCardAtIndex(index: number): void {
    if (this.combat.isOver()) return;
    if (this.combat.phase !== "PLAYER_ACTION") return;

    const hand = this.combat.deck.getHand();
    const card = hand[index];
    if (!card) return;

    this.combat.playCard(card.instanceId);
    this.renderUI();
  }

  private onEndTurn(): void {
    if (this.combat.isOver()) return;
    if (this.combat.phase !== "PLAYER_ACTION") return;

    this.combat.endPlayerTurn();
    this.renderUI();
  }

  // ─── Render Helpers ───────────────────────────────────────

  private clearUI(): void {
    for (const obj of this.uiObjects) obj.destroy();
    this.uiObjects = [];
    this.tooltipText = null;
  }

  private addText(
    x: number,
    y: number,
    content: string,
    style: Phaser.Types.GameObjects.Text.TextStyle,
  ): Phaser.GameObjects.Text {
    const t = this.add.text(x, y, content, style);
    this.uiObjects.push(t);
    return t;
  }

  // ─── Main Render ──────────────────────────────────────────

  private renderUI(): void {
    this.clearUI();

    const sceneW = this.scale.width;
    const sceneH = this.scale.height;

    this.renderTitle(sceneW);
    this.renderEnemyPanel(sceneW);
    this.renderPlayerPanel(sceneW);
    this.renderHandCards(sceneW, sceneH);
    this.renderDeckInfo(sceneW, sceneH);
    this.renderCombatLog();
    this.renderControls(sceneW, sceneH);

    if (this.combat.isOver()) {
      this.renderOutcome(sceneW, sceneH);
    }
  }

  // ─── Title ────────────────────────────────────────────────

  private renderTitle(sceneW: number): void {
    const turnInfo = `TURN ${this.combat.turn}`;
    const phaseInfo = this.combat.phase;
    this.addText(sceneW / 2, 8, `═══ BATTLE ═══  ${turnInfo}  [${phaseInfo}]`, {
      ...TITLE_STYLE,
      fontSize: "18px",
    }).setOrigin(0.5, 0);
  }

  // ─── Enemy Panel ─────────────────────────────────────────

  private renderEnemyPanel(sceneW: number): void {
    const enemy = this.combat.enemy;
    const def = this.combat.enemyDef;
    const intent = this.combat.getEnemyIntent();

    const panelIW = 50;
    const panel = buildPanel(panelIW, BOX_DOUBLE)
      .title(`▼ ${def.name}`)
      .separator()
      .left(`HP: ${gauge(enemy.hp, enemy.maxHp, 20)}`)
      .left(`Block: ${enemy.block}`)
      .separator();

    // Intent
    const intentIcon = this.intentIcon(intent.type);
    panel.left(`Intent: ${intentIcon} ${intent.description} (${intent.value})`);

    // Status effects
    const statusStr = this.statusEffectsStr(enemy.statusEffects);
    if (statusStr) {
      panel.left(`Status: ${statusStr}`);
    }

    panel.close();

    this.addText(sceneW / 2, 36, panel.toString(), {
      ...BODY_STYLE,
      fontSize: "14px",
      color: Color.RED,
    }).setOrigin(0.5, 0);
  }

  // ─── Player Panel ────────────────────────────────────────

  private renderPlayerPanel(sceneW: number): void {
    const player = this.combat.player;
    const ship = this.combat.shipDef;

    const panelIW = 50;
    const panel = buildPanel(panelIW, BOX_DOUBLE)
      .title(`▲ ${ship.nameKo} (${ship.name})`)
      .separator()
      .left(`HP:    ${gauge(player.hp, player.maxHp, 20)}`)
      .left(`Shield: ${this.combat.shield}  Armor: ${this.combat.armor}`)
      .left(`Block: ${player.block}`)
      .left(`EP:    ${epDots(player.ep, player.maxEp)}  (${player.ep}/${player.maxEp})`);

    // Status effects
    const statusStr = this.statusEffectsStr(player.statusEffects);
    if (statusStr) {
      panel.left(`Status: ${statusStr}`);
    }

    // Disabled equipment
    if (this.combat.disabledEquipmentIds.size > 0) {
      panel.separator();
      panel.left("Destroyed:");
      for (const eqId of this.combat.disabledEquipmentIds) {
        const eqDef = EQUIPMENT[eqId];
        panel.left(`  x ${eqDef?.name ?? eqId}`);
      }
    }

    panel.close();

    this.addText(sceneW / 2, 200, panel.toString(), {
      ...BODY_STYLE,
      fontSize: "14px",
      color: Color.GREEN,
    }).setOrigin(0.5, 0);
  }

  // ─── Hand Cards ───────────────────────────────────────────

  private renderHandCards(sceneW: number, sceneH: number): void {
    const cardY = sceneH - 170;
    const hand = this.combat.deck.getHand();
    const count = Math.min(hand.length, MAX_HAND);

    if (count === 0) {
      this.addText(sceneW / 2, cardY + 40, "[ No cards in hand ]", SUBTITLE_STYLE)
        .setOrigin(0.5, 0);
      return;
    }

    // Center cards horizontally
    const totalW = count * CARD_PX_W + (count - 1) * 8;
    const startX = (sceneW - totalW) / 2;

    for (let i = 0; i < count; i++) {
      const ci = hand[i]!;
      const cardDef = Deck.getDefinition(ci.cardId);
      if (!cardDef) continue;

      const x = startX + i * (CARD_PX_W + 8);
      const canPlay = this.combat.canPlayCard(ci.instanceId);
      const disabled = this.combat.isCardDisabled(ci.cardId);

      this.renderCard(x, cardY, cardDef, i, canPlay, disabled, ci.instanceId);
    }
  }

  private renderCard(
    x: number,
    y: number,
    cardDef: CardDefinition,
    index: number,
    canPlay: boolean,
    disabled: boolean,
    instanceId: string,
  ): void {
    const box = canPlay ? BOX_DOUBLE : BOX_SINGLE;
    let color: string;
    if (disabled) {
      color = Color.DARK;
    } else if (canPlay) {
      color = Color.CYAN;
    } else {
      color = Color.DIM;
    }

    const iw = CARD_IW;
    const panel = buildPanel(iw, box);

    // Card number shortcut
    panel.center(`[${index + 1}]`);

    // Card name (truncated)
    const nameStr = truncate(cardDef.name, iw - 2);
    panel.center(nameStr);

    panel.separator();

    // Type + EP cost
    const typeLabel = this.cardTypeLabel(cardDef.type);
    panel.left(`${typeLabel}  EP:${cardDef.epCost}`);

    // Effect summary (first effect only, truncated)
    const effectStr = this.cardEffectSummary(cardDef);
    panel.left(truncate(effectStr, iw - 2));

    if (disabled) {
      panel.center("DISABLED");
    }

    panel.close();

    const text = this.addText(x, y, panel.toString(), {
      ...BODY_STYLE,
      fontSize: "12px",
      color,
    });

    // Interactivity
    text.setInteractive({ useHandCursor: canPlay });

    if (canPlay && !disabled) {
      text.on("pointerdown", () => {
        this.combat.playCard(instanceId);
        this.renderUI();
      });
    }

    // Hover for tooltip
    text.on("pointerover", () => {
      this.showTooltip(x, y - 60, cardDef);
    });
    text.on("pointerout", () => {
      this.hideTooltip();
    });
  }

  // ─── Tooltip ──────────────────────────────────────────────

  private showTooltip(x: number, y: number, cardDef: CardDefinition): void {
    this.hideTooltip();

    const lines = [
      `${cardDef.name} (${this.cardTypeLabel(cardDef.type)})`,
      `EP Cost: ${cardDef.epCost}`,
      "",
      cardDef.description,
    ];

    for (const effect of cardDef.effects) {
      let detail = `  - ${effect.type}`;
      if (effect.value !== undefined) detail += `: ${effect.value}`;
      if (effect.hitCount !== undefined) detail += ` x${effect.hitCount}`;
      if (effect.statusEffect) detail += ` [${effect.statusEffect}]`;
      if (effect.statusStacks !== undefined) detail += ` x${effect.statusStacks}`;
      lines.push(detail);
    }

    const tip = this.add.text(x, y, lines.join("\n"), {
      fontFamily: FONT_FAMILY,
      fontSize: "11px",
      color: Color.YELLOW,
      backgroundColor: "#1a1a1a",
      padding: { x: 6, y: 4 },
    }).setDepth(9000);

    this.uiObjects.push(tip);
    this.tooltipText = tip;
  }

  private hideTooltip(): void {
    if (this.tooltipText) {
      this.tooltipText.destroy();
      this.tooltipText = null;
    }
  }

  // ─── Deck Info ────────────────────────────────────────────

  private renderDeckInfo(sceneW: number, sceneH: number): void {
    const cardY = sceneH - 170;
    const deck = this.combat.deck;
    const info = [
      `Draw: ${deck.getQueueSize()}`,
      `Exhaust: ${deck.getExhaustSize()}`,
      `Exclude: ${deck.getExcludeSize()}`,
    ].join("  |  ");

    this.addText(sceneW / 2, cardY - 22, info, {
      ...SUBTITLE_STYLE,
      fontSize: "13px",
    }).setOrigin(0.5, 0);
  }

  // ─── Combat Log ───────────────────────────────────────────

  private renderCombatLog(): void {
    const logs = this.combat.logs;
    const recentLogs = logs.slice(-LOG_LINES);

    const panelIW = 60;
    const panel = buildPanel(panelIW, BOX_SINGLE)
      .title("--- COMBAT LOG ---");

    for (const log of recentLogs) {
      const prefix = `[T${log.turn}]`;
      const msg = truncate(`${prefix} ${log.message}`, panelIW - 2);
      panel.left(msg);
    }

    // Pad to fixed height
    for (let i = recentLogs.length; i < LOG_LINES; i++) {
      panel.blank();
    }

    panel.close();

    this.addText(LOG_X, LOG_Y, panel.toString(), {
      fontFamily: FONT_FAMILY,
      fontSize: "11px",
      color: Color.DIM,
      lineSpacing: 0,
    });
  }

  // ─── Controls ─────────────────────────────────────────────

  private renderControls(sceneW: number, sceneH: number): void {
    if (this.combat.isOver()) return;

    if (this.combat.phase === "PLAYER_ACTION") {
      const cardY = sceneH - 170;
      const btn = this.addText(sceneW - 140, cardY - 24, "[ END TURN ]", {
        ...BUTTON_STYLE,
        fontSize: "16px",
        padding: { x: 12, y: 6 },
      }).setInteractive({ useHandCursor: true });

      btn.on("pointerdown", () => this.onEndTurn());

      this.addText(sceneW / 2, sceneH - 20, "1-7: Play card   SPACE: End turn   ESC: Quit", {
        ...HELP_STYLE,
        fontSize: "11px",
      }).setOrigin(0.5, 0);
    }
  }

  // ─── Outcome Overlay ──────────────────────────────────────

  private renderOutcome(sceneW: number, sceneH: number): void {
    const isVictory = this.combat.phase === "VICTORY";
    const title = isVictory ? "=== VICTORY ===" : "=== DEFEAT ===";
    const color = isVictory ? Color.CYAN : Color.RED;

    // Semi-transparent background overlay
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, sceneW, sceneH);
    overlay.setDepth(5000);
    this.uiObjects.push(overlay);

    this.addText(sceneW / 2, sceneH / 2 - 60, title, {
      fontFamily: FONT_FAMILY,
      fontSize: "32px",
      color,
    }).setOrigin(0.5).setDepth(5001);

    if (isVictory) {
      const continueBtn = this.addText(sceneW / 2, sceneH / 2 + 20, "[ CONTINUE >> REWARDS ]", {
        ...BUTTON_STYLE,
        fontSize: "18px",
        padding: { x: 16, y: 8 },
      }).setOrigin(0.5).setDepth(5001).setInteractive({ useHandCursor: true });

      continueBtn.on("pointerdown", () => {
        this.scene.start("RewardScene", {
          shipId: this.shipDef.id,
          placedEquipment: this.combat.placedEquipment,
        });
      });
    }

    const retryBtn = this.addText(sceneW / 2, sceneH / 2 + 80, "[ RETURN TO SHIP SELECT ]", {
      ...SUBTITLE_STYLE,
      fontSize: "14px",
    }).setOrigin(0.5).setDepth(5001).setInteractive({ useHandCursor: true });

    retryBtn.on("pointerdown", () => {
      this.scene.start("ShipSelectScene");
    });
  }

  // ─── Utility ──────────────────────────────────────────────

  private intentIcon(type: string): string {
    switch (type) {
      case "attack": return "[ATK]";
      case "defend": return "[DEF]";
      case "buff": return "[BUF]";
      case "debuff": return "[DBF]";
      default: return "[???]";
    }
  }

  private statusEffectsStr(effects: Map<StatusEffectId, number>): string {
    const parts: string[] = [];
    for (const [id, stacks] of effects) {
      if (stacks > 0) {
        parts.push(`${id}(${stacks})`);
      }
    }
    return parts.join(" ");
  }

  private cardTypeLabel(type: string): string {
    switch (type) {
      case "attack": return "ATK";
      case "defense": return "DEF";
      case "skill": return "SKL";
      case "passive": return "PSV";
      default: return type.toUpperCase();
    }
  }

  private cardEffectSummary(cardDef: CardDefinition): string {
    if (cardDef.effects.length === 0) return "No effect";
    const e = cardDef.effects[0];
    if (!e) return "No effect";
    switch (e.type) {
      case "damage": return `${e.value ?? 0} DMG`;
      case "damage_all": return `${e.value ?? 0} DMG (all)`;
      case "block": return `${e.value ?? 0} BLK`;
      case "heal": return `${e.value ?? 0} HEAL`;
      case "evade": return "EVADE";
      case "multi_hit": return `${e.value ?? 0}x${e.hitCount ?? 1} DMG`;
      case "apply_status": return `${e.statusEffect ?? "?"} x${e.statusStacks ?? 1}`;
      case "passive_heal": return `+${e.value ?? 0} HP/turn`;
      case "self_damage": return `Self ${e.value ?? 0} DMG`;
      case "draw_card": return `Draw ${e.value ?? 1}`;
      case "restore_ap": return `+${e.value ?? 1} EP`;
      default: return e.type;
    }
  }
}
