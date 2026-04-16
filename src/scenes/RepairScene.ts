import * as Phaser from "phaser";
import type { PlacedEquipment } from "../data";
import {
  Color, FONT_FAMILY,
  TITLE_STYLE, SUBTITLE_STYLE, BODY_STYLE, BUTTON_STYLE, HELP_STYLE,
  buildPanel, BOX_SINGLE, BOX_DOUBLE,
  addScanlines, addVignette,
} from "../ui";

// ─── Constants ──────────────────────────────────────────────

/** HP recovery percentage at repair station */
const REPAIR_HEAL_PERCENT = 0.3;

/** Minimum HP healed at repair station */
const REPAIR_MIN_HEAL = 5;

// ─── Scene Data ─────────────────────────────────────────────

interface RepairSceneData {
  shipId: string;
  placedEquipment: PlacedEquipment[];
  currentHp?: number;
  maxHp?: number;
  scrap?: number;
  dataCore?: number;
  /** Return data for StageMapScene */
  returnData?: Record<string, unknown>;
}

// ─── Scene ──────────────────────────────────────────────────

/**
 * RepairScene — 수리 기지 씬 (M2)
 *
 * 수리 기지에서 플레이어는 함선의 HP를 회복할 수 있다.
 * 최대 HP의 30% (최소 5)를 회복하며, 보스 전 마지막 휴식 지점이다.
 */
export class RepairScene extends Phaser.Scene {
  private shipId!: string;
  private placedEquipment: PlacedEquipment[] = [];
  private currentHp!: number;
  private maxHp!: number;
  private scrap = 0;
  private dataCore = 0;
  private returnData?: Record<string, unknown>;

  /** Amount of HP to heal */
  private healAmount = 0;

  /** Whether repair has been performed */
  private repaired = false;

  private uiObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: "RepairScene" });
  }

  // ─── Lifecycle ────────────────────────────────────────────

  init(data: RepairSceneData): void {
    this.shipId = data.shipId ?? "corvette";
    this.placedEquipment = data.placedEquipment ?? [];
    this.maxHp = data.maxHp ?? 60;
    this.currentHp = data.currentHp ?? this.maxHp;
    this.scrap = data.scrap ?? 0;
    this.dataCore = data.dataCore ?? 0;
    this.returnData = data.returnData;

    this.repaired = false;

    // Calculate heal amount
    this.healAmount = Math.max(REPAIR_MIN_HEAL, Math.floor(this.maxHp * REPAIR_HEAL_PERCENT));
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
      this.leaveRepair();
    });
  }

  // ─── Navigation ───────────────────────────────────────────

  private leaveRepair(): void {
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

  // ─── Actions ──────────────────────────────────────────────

  private performRepair(): void {
    if (this.repaired) return;
    if (this.currentHp >= this.maxHp) return;

    this.currentHp = Math.min(this.maxHp, this.currentHp + this.healAmount);
    this.repaired = true;
    this.renderUI();
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
    this.addText(sceneW / 2, 16, "═══ + REPAIR STATION + ═══", {
      ...TITLE_STYLE,
      fontSize: "24px",
    }).setOrigin(0.5, 0);

    // Player info bar
    const info = `HP: ${this.currentHp}/${this.maxHp}  |  Scrap: ${this.scrap}  |  Data Core: ${this.dataCore}`;
    this.addText(sceneW / 2, 50, info, {
      ...SUBTITLE_STYLE,
      fontSize: "14px",
      color: Color.GREEN,
    }).setOrigin(0.5, 0);

    // Repair station panel
    const iw = 50;
    const panel = buildPanel(iw, BOX_DOUBLE)
      .center("+ 수리 기지")
      .separator()
      .left("전투 중 입은 피해를 수리합니다.")
      .left("보스 전 마지막 휴식 기회입니다.")
      .separator()
      .left(`회복량: HP +${this.healAmount} (최대 HP의 ${Math.round(REPAIR_HEAL_PERCENT * 100)}%)`)
      .left(`현재 HP: ${this.currentHp}/${this.maxHp}`)
      .close();

    this.addText(sceneW / 2, 100, panel.toString(), {
      ...BODY_STYLE,
      fontSize: "14px",
      color: Color.CYAN,
    }).setOrigin(0.5, 0);

    if (this.repaired) {
      // Show repair result
      const resultPanel = buildPanel(iw, BOX_SINGLE)
        .center("=== 수리 완료 ===")
        .separator()
        .left(`HP +${this.healAmount} 회복!`)
        .left(`현재 HP: ${this.currentHp}/${this.maxHp}`)
        .close();

      this.addText(sceneW / 2, 300, resultPanel.toString(), {
        ...BODY_STYLE,
        fontSize: "14px",
        color: Color.GREEN,
      }).setOrigin(0.5, 0);

      // Continue button
      const continueBtn = this.addText(sceneW / 2, 440, "[ CONTINUE ]", {
        ...BUTTON_STYLE,
        fontSize: "18px",
        padding: { x: 20, y: 8 },
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      continueBtn.on("pointerdown", () => this.leaveRepair());
    } else {
      const atFullHp = this.currentHp >= this.maxHp;

      if (atFullHp) {
        // Already at full HP
        this.addText(sceneW / 2, 320, "HP가 이미 최대입니다.", {
          ...BODY_STYLE,
          fontSize: "16px",
          color: Color.DIM,
        }).setOrigin(0.5);
      } else {
        // Repair button
        const repairBtn = this.addText(sceneW / 2, 320, `[ 수리하기 — HP +${this.healAmount} ]`, {
          ...BUTTON_STYLE,
          fontSize: "18px",
          padding: { x: 20, y: 8 },
        }).setOrigin(0.5).setInteractive({ useHandCursor: true });

        repairBtn.on("pointerover", () => repairBtn.setColor(Color.YELLOW));
        repairBtn.on("pointerout", () => repairBtn.setColor(Color.CYAN));
        repairBtn.on("pointerdown", () => this.performRepair());
      }

      // Skip button
      const skipBtn = this.addText(sceneW / 2, 400, "[ SKIP — 수리하지 않고 진행 ]", {
        ...SUBTITLE_STYLE,
        fontSize: "13px",
      }).setOrigin(0.5).setInteractive({ useHandCursor: true });

      skipBtn.on("pointerdown", () => this.leaveRepair());
    }

    // Help
    this.addText(sceneW / 2, sceneH - 20, "ESC: Return to map", {
      ...HELP_STYLE,
      fontSize: "11px",
    }).setOrigin(0.5);
  }
}
