import * as Phaser from "phaser";
import { SHIPS } from "../data";
import type { ShipDefinition, GridDefinition } from "../data";
import {
  Color, FONT_FAMILY, TITLE_STYLE, SUBTITLE_STYLE, BODY_STYLE, BUTTON_STYLE,
  BOX_SINGLE, BOX_DOUBLE,
  centerPad, leftPad,
  addScanlines, addVignette,
} from "../ui";

// ─── Layout constants ───────────────────────────────────────
const SHIP_KEYS: readonly string[] = [
  "corvette",
  "frigate",
  "destroyer",
  "cruiser",
  "battlecruiser",
  "battleship",
  "cargo_ship",
  "assault_ship",
  "drone_carrier",
  "carrier",
];

const VISIBLE = 3;
const IW = 36; // inner character width of each card
const MAX_PREVIEW_ROWS = 14; // tallest ship grid (battlecruiser)

// ─── Scene ──────────────────────────────────────────────────

export class ShipSelectScene extends Phaser.Scene {
  private selectedIndex = 0;
  private pageOffset = 0;
  private uiObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: "ShipSelectScene" });
  }

  create(): void {
    this.selectedIndex = 0;
    this.pageOffset = 0;
    this.uiObjects = [];

    this.renderUI();
    this.setupKeyboard();
  }

  // ─── Keyboard ─────────────────────────────────────────────

  private setupKeyboard(): void {
    const kb = this.input.keyboard;
    if (!kb) return;

    kb.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT).on("down", () =>
      this.navigate(-1),
    );
    kb.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT).on("down", () =>
      this.navigate(1),
    );
    kb.addKey(Phaser.Input.Keyboard.KeyCodes.ENTER).on("down", () =>
      this.deploy(),
    );
  }

  // ─── Navigation ───────────────────────────────────────────

  private navigate(dir: number): void {
    const next = this.selectedIndex + dir;
    if (next < 0 || next >= SHIP_KEYS.length) return;

    this.selectedIndex = next;

    // Keep selected ship visible
    if (this.selectedIndex < this.pageOffset) {
      this.pageOffset = this.selectedIndex;
    } else if (this.selectedIndex >= this.pageOffset + VISIBLE) {
      this.pageOffset = this.selectedIndex - VISIBLE + 1;
    }

    this.renderUI();
  }

  private deploy(): void {
    this.scene.start("ShipSetupScene", { shipId: SHIP_KEYS[this.selectedIndex] });
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

    const W = this.scale.width;
    const H = this.scale.height;

    // CRT effects
    addScanlines(this);
    addVignette(this);

    // Title
    this.addText(W / 2, 24, "═══ SHIP SELECTION ═══", TITLE_STYLE)
      .setOrigin(0.5, 0);

    // Page indicator
    const lo = this.pageOffset + 1;
    const hi = Math.min(this.pageOffset + VISIBLE, SHIP_KEYS.length);
    this.addText(W / 2, 58, `[ ${lo}–${hi} / ${SHIP_KEYS.length} ]`, SUBTITLE_STYLE)
      .setOrigin(0.5, 0);

    // Ship cards
    const slotW = Math.floor(W / VISIBLE);
    for (let i = 0; i < VISIBLE; i++) {
      const idx = this.pageOffset + i;
      if (idx >= SHIP_KEYS.length) break;

      const key = SHIP_KEYS[idx];
      if (!key) continue;
      const ship = SHIPS[key];
      if (!ship) continue;

      const cx = slotW * i + slotW / 2;
      this.renderCard(cx, 88, ship, idx === this.selectedIndex);
    }

    // Navigation arrows
    const arrowY = 400;

    if (this.pageOffset > 0) {
      const arrow = this.addText(24, arrowY, "◄", {
        fontFamily: FONT_FAMILY,
        fontSize: "28px",
        color: Color.CYAN,
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      arrow.on("pointerdown", () => this.navigate(-1));
    }

    if (this.pageOffset + VISIBLE < SHIP_KEYS.length) {
      const arrow = this.addText(W - 24, arrowY, "►", {
        fontFamily: FONT_FAMILY,
        fontSize: "28px",
        color: Color.CYAN,
      })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true });
      arrow.on("pointerdown", () => this.navigate(1));
    }

    // Deploy button
    const selKey = SHIP_KEYS[this.selectedIndex] ?? "";
    const selShip = SHIPS[selKey];
    const deployLabel = selShip
      ? `>> DEPLOY: ${selShip.nameKo} (${selShip.name}) <<`
      : ">> DEPLOY <<";

    const btn = this.addText(W / 2, H - 72, deployLabel, {
      ...BUTTON_STYLE,
      padding: { x: 20, y: 8 },
    })
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true });
    btn.on("pointerdown", () => this.deploy());

    // Help text
    this.addText(W / 2, H - 28, "← → Navigate    ENTER Deploy", SUBTITLE_STYLE)
      .setOrigin(0.5);
  }

  // ─── Ship Card ────────────────────────────────────────────

  private renderCard(
    cx: number,
    y: number,
    ship: ShipDefinition,
    selected: boolean,
  ): void {
    const color = selected ? Color.CYAN : Color.GREEN;
    const box = selected ? BOX_DOUBLE : BOX_SINGLE;

    const hr = box.t.repeat(IW);
    const sep = box.m.repeat(IW);

    const lines: string[] = [];

    // Top border
    lines.push(`${box.tl}${hr}${box.tr}`);

    // Ship name (centered)
    const name = `${ship.nameKo} (${ship.name})`;
    lines.push(centerPad(name, IW, box.v));

    // Separator
    lines.push(`${box.ml}${sep}${box.mr}`);

    // Stats
    lines.push(leftPad(`HP: ${ship.maxHp}`, IW, box.v));
    lines.push(
      leftPad(
        `Grid: ${ship.grid.rows}×${ship.grid.cols} (${ship.grid.validCells.length} cells)`,
        IW,
        box.v,
      ),
    );
    lines.push(leftPad(ship.passiveDescription, IW, box.v));

    // Separator
    lines.push(`${box.ml}${sep}${box.mr}`);

    // Grid preview (padded to uniform height)
    const preview = this.buildGridPreview(ship.grid);
    for (let r = 0; r < MAX_PREVIEW_ROWS; r++) {
      const row = r < preview.length ? (preview[r] ?? "") : "";
      lines.push(centerPad(row, IW, box.v));
    }

    // Bottom border
    lines.push(`${box.bl}${hr}${box.br}`);

    const card = this.addText(cx, y, lines.join("\n"), {
      ...BODY_STYLE,
      color,
    }).setOrigin(0.5, 0);

    card.setInteractive({ useHandCursor: true });
    card.on("pointerdown", () => {
      const idx = SHIP_KEYS.indexOf(ship.id);
      if (idx < 0) return;
      this.selectedIndex = idx;
      if (this.selectedIndex < this.pageOffset) {
        this.pageOffset = this.selectedIndex;
      } else if (this.selectedIndex >= this.pageOffset + VISIBLE) {
        this.pageOffset = this.selectedIndex - VISIBLE + 1;
      }
      this.renderUI();
    });
  }

  // ─── Grid Preview ─────────────────────────────────────────

  private buildGridPreview(grid: GridDefinition): string[] {
    const { rows, cols, validCells } = grid;
    const valid = new Set<string>();
    for (const p of validCells) valid.add(`${p.row},${p.col}`);

    const result: string[] = [];
    for (let r = 0; r < rows; r++) {
      let line = "";
      for (let c = 0; c < cols; c++) {
        line += valid.has(`${r},${c}`) ? "█" : " ";
      }
      result.push(line);
    }
    return result;
  }
}
