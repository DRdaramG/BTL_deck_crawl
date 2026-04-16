import * as Phaser from "phaser";
import { EQUIPMENT } from "../data";
import type { PlacedEquipment, EquipmentDefinition } from "../data";
import {
  Color, FONT_FAMILY, GradeColor,
  TITLE_STYLE, SUBTITLE_STYLE, BODY_STYLE, BUTTON_STYLE, HELP_STYLE,
  buildPanel, BOX_SINGLE, BOX_DOUBLE,
  truncate,
  addScanlines, addVignette,
} from "../ui";

// ─── Constants ──────────────────────────────────────────────

const REWARD_COUNT = 3;
const CARD_IW = 30;
const CARD_PX_W = 240;

interface RewardSceneData {
  shipId: string;
  placedEquipment: PlacedEquipment[];
  /** Stage map return data (for resuming map after rewards) */
  returnData?: Record<string, unknown>;
}

/**
 * RewardScene — 전투 후 보상 씬 (M1)
 *
 * 전투 승리 후 장비 보상 선택 화면을 처리한다.
 * 랜덤으로 장비 3개를 제시하고 플레이어가 1개를 선택한다.
 */
export class RewardScene extends Phaser.Scene {
  private rewardOptions: EquipmentDefinition[] = [];
  private selectedIndex = -1;
  private sceneData!: RewardSceneData;
  private uiObjects: Phaser.GameObjects.GameObject[] = [];

  // Reward amounts
  private scrapReward = 0;
  private dataCoreReward = 0;

  constructor() {
    super({ key: "RewardScene" });
  }

  // ─── Lifecycle ────────────────────────────────────────────

  init(data: RewardSceneData): void {
    this.sceneData = data;
    this.selectedIndex = -1;

    // Generate random rewards
    this.rewardOptions = this.generateRewards(REWARD_COUNT);

    // Generate currency rewards
    this.scrapReward = 10 + Math.floor(Math.random() * 20);
    this.dataCoreReward = Math.random() < 0.3 ? 1 : 0;
  }

  create(): void {
    // CRT effects
    addScanlines(this);
    addVignette(this);

    this.renderUI();
    this.setupKeyboard();
  }

  // ─── Keyboard ─────────────────────────────────────────────

  private setupKeyboard(): void {
    const kb = this.input.keyboard;
    if (!kb) return;

    kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT).on("down", () => {
      this.navigate(-1);
    });
    kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT).on("down", () => {
      this.navigate(1);
    });
    kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).on("down", () => {
      this.confirmSelection();
    });
    kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on("down", () => {
      this.skip();
    });
  }

  // ─── Navigation ───────────────────────────────────────────

  private navigate(dir: number): void {
    if (this.rewardOptions.length === 0) return;

    if (this.selectedIndex === -1) {
      this.selectedIndex = dir > 0 ? 0 : this.rewardOptions.length - 1;
    } else {
      this.selectedIndex = Math.max(
        0,
        Math.min(this.rewardOptions.length - 1, this.selectedIndex + dir),
      );
    }
    this.renderUI();
  }

  private confirmSelection(): void {
    if (this.selectedIndex < 0 || this.selectedIndex >= this.rewardOptions.length) return;
    this.returnToMap();
  }

  private skip(): void {
    this.returnToMap();
  }

  private returnToMap(): void {
    if (this.sceneData.returnData) {
      // Return to stage map with preserved state
      this.scene.start("StageMapScene", this.sceneData.returnData);
    } else {
      this.scene.start("ShipSelectScene");
    }
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

    const sceneW = this.scale.width;
    const sceneH = this.scale.height;

    // Title
    this.addText(sceneW / 2, 30, "=== VICTORY — REWARDS ===", TITLE_STYLE)
      .setOrigin(0.5, 0);

    // Currency rewards
    let currencyStr = `Scrap: +${this.scrapReward}`;
    if (this.dataCoreReward > 0) {
      currencyStr += `   Data Core: +${this.dataCoreReward}`;
    }
    this.addText(sceneW / 2, 70, currencyStr, {
      ...BODY_STYLE,
      fontSize: "16px",
      color: Color.YELLOW,
    }).setOrigin(0.5, 0);

    // Instruction
    this.addText(sceneW / 2, 100, "Select equipment reward (1 of 3):", SUBTITLE_STYLE)
      .setOrigin(0.5, 0);

    // Equipment cards
    const count = this.rewardOptions.length;
    const totalW = count * CARD_PX_W + (count - 1) * 24;
    const startX = (sceneW - totalW) / 2;

    for (let i = 0; i < count; i++) {
      const equip = this.rewardOptions[i]!;
      const x = startX + i * (CARD_PX_W + 24);
      const selected = i === this.selectedIndex;

      this.renderEquipmentCard(x, 140, equip, i, selected);
    }

    // Confirm button
    if (this.selectedIndex >= 0) {
      const selEquip = this.rewardOptions[this.selectedIndex];
      if (selEquip) {
        const confirmBtn = this.addText(
          sceneW / 2,
          sceneH - 100,
          `>> SELECT: ${selEquip.name} <<`,
          {
            ...BUTTON_STYLE,
            fontSize: "18px",
            padding: { x: 16, y: 8 },
          },
        )
          .setOrigin(0.5)
          .setInteractive({ useHandCursor: true });

        confirmBtn.on("pointerdown", () => this.confirmSelection());
      }
    }

    // Skip button
    const skipBtn = this.addText(sceneW / 2, sceneH - 50, "[ SKIP — No reward ]", {
      ...SUBTITLE_STYLE,
      fontSize: "13px",
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });

    skipBtn.on("pointerdown", () => this.skip());

    // Help text
    this.addText(sceneW / 2, sceneH - 24, "<< >> Navigate    ENTER Select    ESC Skip", {
      ...HELP_STYLE,
      fontSize: "11px",
    }).setOrigin(0.5);
  }

  // ─── Equipment Card ───────────────────────────────────────

  private renderEquipmentCard(
    x: number,
    y: number,
    equip: EquipmentDefinition,
    index: number,
    selected: boolean,
  ): void {
    const box = selected ? BOX_DOUBLE : BOX_SINGLE;
    const gradeColor = GradeColor[equip.grade] ?? Color.DIM;
    const color = selected ? Color.CYAN : gradeColor;

    const iw = CARD_IW;
    const panel = buildPanel(iw, box);

    // Name
    panel.center(truncate(equip.name, iw - 2));
    panel.separator();

    // Category + Grade
    panel.left(`${equip.category}`);
    panel.left(`Grade: ${equip.grade}`);
    panel.left(`Shape: ${equip.shapeDescription}`);

    panel.separator();

    // Description (truncated)
    panel.left(truncate(equip.description, iw - 2));

    panel.separator();

    // Provided cards
    panel.left("Cards:");
    for (const pc of equip.providedCards) {
      panel.left(truncate(`  ${pc.cardId} x${pc.count}`, iw - 2));
    }

    panel.close();

    const text = this.addText(x, y, panel.toString(), {
      ...BODY_STYLE,
      fontSize: "13px",
      color,
    });

    text.setInteractive({ useHandCursor: true });
    text.on("pointerdown", () => {
      this.selectedIndex = index;
      this.renderUI();
    });
  }

  // ─── Reward Generation ────────────────────────────────────

  private generateRewards(count: number): EquipmentDefinition[] {
    const allEquipIds = Object.keys(EQUIPMENT);
    const result: EquipmentDefinition[] = [];
    const used = new Set<string>();

    // Weight towards common/rare for early rewards
    const candidates = allEquipIds.filter((id) => {
      const eq = EQUIPMENT[id];
      return eq && (eq.grade === "common" || eq.grade === "rare");
    });

    // Fallback to all equipment if not enough candidates
    const pool = candidates.length >= count ? candidates : allEquipIds;

    while (result.length < count && result.length < pool.length) {
      const idx = Math.floor(Math.random() * pool.length);
      const id = pool[idx];
      if (!id) continue;
      if (used.has(id)) continue;
      used.add(id);

      const eq = EQUIPMENT[id];
      if (eq) result.push(eq);
    }

    return result;
  }
}
