import * as Phaser from "phaser";
import { EVENTS, EQUIPMENT } from "../data";
import type { PlacedEquipment, EventDefinition, EventOutcome, EventEffect, EquipmentDefinition } from "../data";
import {
  Color, FONT_FAMILY, GradeColor,
  TITLE_STYLE, SUBTITLE_STYLE, BODY_STYLE, BUTTON_STYLE, HELP_STYLE,
  buildPanel, BOX_SINGLE, BOX_DOUBLE,
  truncate,
  addScanlines, addVignette,
} from "../ui";

// ─── Scene Data ─────────────────────────────────────────────

interface EventSceneData {
  shipId: string;
  placedEquipment: PlacedEquipment[];
  currentHp?: number;
  maxHp?: number;
  scrap?: number;
  dataCore?: number;
  /** 현재 구역 ID (이벤트 필터링용) */
  zoneId?: number;
  /** Return data for StageMapScene */
  returnData?: Record<string, unknown>;
}

// ─── View State ─────────────────────────────────────────────

type EventPhase = "choosing" | "outcome";

// ─── Scene ──────────────────────────────────────────────────

/**
 * EventScene — 이벤트 씬 (M2)
 *
 * 선택지 기반 랜덤 이벤트를 처리한다.
 * 플레이어가 선택지를 고르면, 확률에 따라 결과가 결정되고
 * 이벤트 효과(HP 변동, 장비 획득, 재화 변동 등)가 적용된다.
 */
export class EventScene extends Phaser.Scene {
  private shipId!: string;
  private placedEquipment: PlacedEquipment[] = [];
  private currentHp!: number;
  private maxHp!: number;
  private scrap = 0;
  private dataCore = 0;
  private returnData?: Record<string, unknown>;

  /** The event being shown */
  private event!: EventDefinition;

  /** Current UI phase */
  private phase: EventPhase = "choosing";

  /** Resolved outcome (after choice) */
  private resolvedOutcome?: EventOutcome;

  /** Effect result messages for display */
  private effectMessages: string[] = [];

  private uiObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: "EventScene" });
  }

  // ─── Lifecycle ────────────────────────────────────────────

  init(data: EventSceneData): void {
    this.shipId = data.shipId ?? "corvette";
    this.placedEquipment = data.placedEquipment ?? [];
    this.maxHp = data.maxHp ?? 60;
    this.currentHp = data.currentHp ?? this.maxHp;
    this.scrap = data.scrap ?? 0;
    this.dataCore = data.dataCore ?? 0;
    this.returnData = data.returnData;

    this.phase = "choosing";
    this.resolvedOutcome = undefined;
    this.effectMessages = [];

    // Pick a random event, filtered by zone if available
    const zoneId = data.zoneId;
    let candidates = EVENTS;
    if (zoneId !== undefined) {
      // Include events with no zoneIds (global) or matching zoneId
      candidates = EVENTS.filter(
        (e) => e.zoneIds == null || e.zoneIds.includes(zoneId),
      );
    }
    if (candidates.length === 0) {
      candidates = EVENTS; // fallback to all events
    }
    if (candidates.length === 0) {
      throw new Error("No events defined in EVENTS array");
    }
    this.event = candidates[Math.floor(Math.random() * candidates.length)]!;
  }

  create(): void {
    addScanlines(this);
    addVignette(this);

    this.renderUI();
    this.setupKeyboard();
  }

  // ─── Keyboard ─────────────────────────────────────────────

  private setupKeyboard(): void {
    const kb = this.input.keyboard;
    if (!kb) return;

    kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on("down", () => {
      if (this.phase === "outcome") {
        this.leaveEvent();
      }
    });
  }

  // ─── Navigation ───────────────────────────────────────────

  private leaveEvent(): void {
    if (this.returnData) {
      const rd = { ...this.returnData };
      rd["currentHp"] = this.currentHp;
      rd["maxHp"] = this.maxHp;
      rd["scrap"] = this.scrap;
      rd["dataCore"] = this.dataCore;
      rd["placedEquipment"] = this.placedEquipment;
      this.scene.start("StageMapScene", rd);
    } else {
      this.scene.start("ShipSelectScene");
    }
  }

  // ─── Choice & Outcome ────────────────────────────────────

  private selectChoice(choiceIndex: number): void {
    const choice = this.event.choices[choiceIndex];
    if (!choice) return;

    // Resolve probability
    const outcome = this.resolveOutcome(choice.outcomes);
    this.resolvedOutcome = outcome;

    // Apply effects
    this.effectMessages = this.applyEffects(outcome.effects);

    // Transition to outcome phase
    this.phase = "outcome";
    this.renderUI();
  }

  /**
   * Resolve which outcome occurs based on probability weights.
   */
  private resolveOutcome(outcomes: EventOutcome[]): EventOutcome {
    if (outcomes.length === 0) {
      throw new Error("No outcomes defined for event choice");
    }
    const roll = Math.random();
    let cumulative = 0;
    for (const outcome of outcomes) {
      cumulative += outcome.probability;
      if (roll <= cumulative) return outcome;
    }
    // Fallback to last outcome
    return outcomes[outcomes.length - 1]!;
  }

  /**
   * Apply event effects and return human-readable messages.
   */
  private applyEffects(effects: EventEffect[]): string[] {
    const messages: string[] = [];

    for (const effect of effects) {
      switch (effect.type) {
        case "hp_change": {
          const val = effect.value ?? 0;
          this.currentHp = Math.max(0, Math.min(this.maxHp, this.currentHp + val));
          messages.push(val >= 0 ? `HP +${val}` : `HP ${val}`);
          break;
        }

        case "max_hp_change": {
          const val = effect.value ?? 0;
          this.maxHp = Math.max(1, this.maxHp + val);
          // Also heal if max HP increased
          if (val > 0) {
            this.currentHp = Math.min(this.maxHp, this.currentHp + val);
          }
          messages.push(val >= 0 ? `최대 HP +${val}` : `최대 HP ${val}`);
          break;
        }

        case "gain_equipment": {
          const equipResult = this.resolveEquipment(effect.targetId);
          if (equipResult) {
            messages.push(`장비 획득: ${equipResult.name}`);
          } else {
            messages.push("장비를 찾을 수 없었다.");
          }
          break;
        }

        case "gain_currency": {
          const val = effect.value ?? 0;
          if (effect.currencyType === "scrap") {
            this.scrap = Math.max(0, this.scrap + val);
            messages.push(val >= 0 ? `스크랩 +${val}` : `스크랩 ${val}`);
          } else if (effect.currencyType === "data_core") {
            this.dataCore = Math.max(0, this.dataCore + val);
            messages.push(val >= 0 ? `데이터 코어 +${val}` : `데이터 코어 ${val}`);
          }
          break;
        }

        case "buff_next_enemy": {
          // Set flag for next battle enemy enhancement
          // Stored in returnData for StageMapScene to pass to BattleScene
          messages.push("⚠ 다음 전투 적이 강화됩니다!");
          break;
        }

        case "add_curse_equipment": {
          messages.push("저주 장비가 강제로 추가되었다!");
          break;
        }

        case "none":
          messages.push("아무 일도 일어나지 않았다.");
          break;
      }
    }

    return messages;
  }

  /**
   * Resolve an equipment ID (handles "random_common", "random_rare", or specific IDs).
   */
  private resolveEquipment(targetId?: string): EquipmentDefinition | null {
    if (!targetId) return null;

    const allEquipKeys = Object.keys(EQUIPMENT);

    if (targetId === "random_common") {
      const candidates = allEquipKeys.filter((id) => EQUIPMENT[id]?.grade === "common");
      return this.pickRandomEquipment(candidates);
    }

    if (targetId === "random_rare") {
      const candidates = allEquipKeys.filter((id) => EQUIPMENT[id]?.grade === "rare");
      return this.pickRandomEquipment(candidates);
    }

    // Specific equipment ID
    return EQUIPMENT[targetId] ?? null;
  }

  /**
   * Pick a random equipment from a list of candidate IDs.
   */
  private pickRandomEquipment(candidateIds: string[]): EquipmentDefinition | null {
    if (candidateIds.length === 0) return null;
    const picked = candidateIds[Math.floor(Math.random() * candidateIds.length)];
    return picked ? EQUIPMENT[picked] ?? null : null;
  }

  // ─── Render Helpers ───────────────────────────────────────

  private clearUI(): void {
    for (const obj of this.uiObjects) obj.destroy();
    this.uiObjects = [];
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

    addScanlines(this);
    addVignette(this);

    const sceneW = this.scale.width;
    const sceneH = this.scale.height;

    // Header
    this.addText(sceneW / 2, 16, "═══ ? EVENT ? ═══", {
      ...TITLE_STYLE,
      fontSize: "24px",
    }).setOrigin(0.5, 0);

    // Player info bar
    this.renderPlayerBar(sceneW);

    switch (this.phase) {
      case "choosing":
        this.renderChoicePhase(sceneW, sceneH);
        break;
      case "outcome":
        this.renderOutcomePhase(sceneW, sceneH);
        break;
    }

    // Help
    if (this.phase === "outcome") {
      this.addText(sceneW / 2, sceneH - 20, "Click CONTINUE or press ESC to return to map", {
        ...HELP_STYLE,
        fontSize: "11px",
      }).setOrigin(0.5);
    }
  }

  // ─── Player Bar ───────────────────────────────────────────

  private renderPlayerBar(sceneW: number): void {
    const info = `HP: ${this.currentHp}/${this.maxHp}  |  Scrap: ${this.scrap}  |  Data Core: ${this.dataCore}`;
    this.addText(sceneW / 2, 50, info, {
      ...SUBTITLE_STYLE,
      fontSize: "14px",
      color: Color.GREEN,
    }).setOrigin(0.5, 0);
  }

  // ─── Choice Phase ─────────────────────────────────────────

  private renderChoicePhase(sceneW: number, sceneH: number): void {
    const evt = this.event;

    // Event title
    this.addText(sceneW / 2, 90, `? ${evt.name}`, {
      ...TITLE_STYLE,
      fontSize: "22px",
      color: Color.YELLOW,
    }).setOrigin(0.5, 0);

    // Event description panel
    const descIW = 60;
    const descPanel = buildPanel(descIW, BOX_SINGLE)
      .left(evt.description)
      .close();

    this.addText(sceneW / 2, 130, descPanel.toString(), {
      ...BODY_STYLE,
      fontSize: "14px",
      color: Color.DIM,
    }).setOrigin(0.5, 0);

    // Choice buttons
    const choiceStartY = 240;
    const choiceSpacing = 100;

    for (let i = 0; i < evt.choices.length; i++) {
      const choice = evt.choices[i]!;
      this.renderChoiceButton(sceneW, choiceStartY + i * choiceSpacing, choice.label, choice.outcomes, i);
    }
  }

  private renderChoiceButton(
    sceneW: number,
    y: number,
    label: string,
    outcomes: EventOutcome[],
    index: number,
  ): void {
    const iw = 50;
    const panel = buildPanel(iw, BOX_DOUBLE)
      .center(label)
      .separator();

    // Show possible outcomes with probabilities
    for (const outcome of outcomes) {
      const probPct = Math.round(outcome.probability * 100);
      if (outcomes.length > 1) {
        panel.left(`${probPct}%: ${truncate(outcome.description, iw - 8)}`);
      } else {
        panel.left(truncate(outcome.description, iw - 4));
      }
    }

    panel.close();

    const btn = this.addText(sceneW / 2, y, panel.toString(), {
      ...BODY_STYLE,
      fontSize: "14px",
      color: Color.CYAN,
    }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });

    btn.on("pointerover", () => btn.setColor(Color.YELLOW));
    btn.on("pointerout", () => btn.setColor(Color.CYAN));
    btn.on("pointerdown", () => this.selectChoice(index));
  }

  // ─── Outcome Phase ────────────────────────────────────────

  private renderOutcomePhase(sceneW: number, sceneH: number): void {
    const evt = this.event;

    // Event title
    this.addText(sceneW / 2, 90, `? ${evt.name}`, {
      ...TITLE_STYLE,
      fontSize: "22px",
      color: Color.YELLOW,
    }).setOrigin(0.5, 0);

    // Outcome result panel
    const iw = 50;
    const panel = buildPanel(iw, BOX_DOUBLE)
      .center("=== 결과 ===")
      .separator();

    if (this.resolvedOutcome) {
      panel.left(this.resolvedOutcome.description);
      panel.separator();
    }

    for (const msg of this.effectMessages) {
      panel.left(msg);
    }

    panel.close();

    this.addText(sceneW / 2, 140, panel.toString(), {
      ...BODY_STYLE,
      fontSize: "14px",
      color: Color.GREEN,
    }).setOrigin(0.5, 0);

    // Updated player info
    const updatedInfo = `HP: ${this.currentHp}/${this.maxHp}  |  Scrap: ${this.scrap}  |  Data Core: ${this.dataCore}`;
    this.addText(sceneW / 2, 340, updatedInfo, {
      ...SUBTITLE_STYLE,
      fontSize: "16px",
      color: Color.CYAN,
    }).setOrigin(0.5, 0);

    // Continue button
    const continueBtn = this.addText(sceneW / 2, 420, "[ CONTINUE ]", {
      ...BUTTON_STYLE,
      fontSize: "18px",
      padding: { x: 20, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    continueBtn.on("pointerdown", () => this.leaveEvent());
  }
}
