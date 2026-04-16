import * as Phaser from "phaser";
import { SHIPS, EQUIPMENT, CARDS, ENEMIES } from "../data";
import type {
  ShipDefinition,
  EquipmentDefinition,
  Rotation,
  Position,
} from "../data";
import { GridModel } from "../systems/grid/GridModel";
import { rotateShape } from "../systems/grid/Polyomino";
import { Deck } from "../systems/deck/Deck";
import {
  Color, GradeColor, FONT_FAMILY, CHAR_HALF_W,
  TITLE_STYLE, SUBTITLE_STYLE, HELP_STYLE, BUTTON_STYLE, CellChar,
  displayWidth, truncate, padEnd,
  buildPanel, BOX_DOUBLE,
  addScanlines, addVignette,
} from "../ui";

// ─── Layout constants ───────────────────────────────────────
const GRID_FONT_SIZE = 16;
const CELL_PX_W = CHAR_HALF_W * 2; // each cell = 2 chars wide
const CELL_PX_H = GRID_FONT_SIZE; // each cell = 1 line tall

const LEFT_PANEL_W = 700;
const RIGHT_X = 720;
const RIGHT_W = 540;

// ─── Scene ──────────────────────────────────────────────────

export class ShipSetupScene extends Phaser.Scene {
  private shipDef!: ShipDefinition;
  private gridModel!: GridModel;
  private selectedEquipmentId: string | null = null;
  private currentRotation: Rotation = 0;
  private availableEquipment: string[] = [];

  // Text objects
  private gridText!: Phaser.GameObjects.Text;
  private equipmentListText!: Phaser.GameObjects.Text;
  private deckPreviewText!: Phaser.GameObjects.Text;
  private infoText!: Phaser.GameObjects.Text;
  private titleText!: Phaser.GameObjects.Text;
  private deployBtn!: Phaser.GameObjects.Text;
  private helpText!: Phaser.GameObjects.Text;

  // Grid pixel origin (top-left of first data cell, excluding labels)
  private gridOriginX = 0;
  private gridOriginY = 0;

  // Equipment list click zones: array of { y, h, equipmentId }
  private equipListZones: { y: number; h: number; equipmentId: string }[] = [];

  constructor() {
    super({ key: "ShipSetupScene" });
  }

  // ─── Lifecycle ────────────────────────────────────────────

  init(data: { shipId: string }): void {
    const ship = SHIPS[data.shipId];
    if (!ship) {
      throw new Error(`Unknown ship: ${data.shipId}`);
    }
    this.shipDef = ship;
    this.gridModel = new GridModel(ship.grid);
    this.selectedEquipmentId = null;
    this.currentRotation = 0;
    this.availableEquipment = [...ship.startingEquipment];
    this.equipListZones = [];
  }

  create(): void {
    const W = this.scale.width;

    // CRT effects
    addScanlines(this);
    addVignette(this);

    // ── Title ──
    this.titleText = this.add
      .text(W / 2, 16, "═══ EQUIPMENT SETUP ═══", TITLE_STYLE)
      .setOrigin(0.5, 0);

    // ── Ship name subtitle ──
    this.add
      .text(
        W / 2,
        48,
        `${this.shipDef.nameKo} (${this.shipDef.name})  HP: ${this.shipDef.maxHp}`,
        SUBTITLE_STYLE,
      )
      .setOrigin(0.5, 0);

    // ── Grid text (left panel) ──
    this.gridText = this.add
      .text(0, 0, "", {
        fontFamily: FONT_FAMILY,
        fontSize: `${GRID_FONT_SIZE}px`,
        color: Color.GREEN,
        lineSpacing: 0,
      })
      .setInteractive();

    this.computeGridOrigin();
    this.renderGrid();

    // ── Equipment list text (right panel, top) ──
    this.equipmentListText = this.add.text(RIGHT_X, 80, "", {
      fontFamily: FONT_FAMILY,
      fontSize: "14px",
      color: Color.GREEN,
      lineSpacing: 2,
    });
    this.equipmentListText.setInteractive();

    // ── Deck preview text (right panel, bottom) ──
    this.deckPreviewText = this.add.text(RIGHT_X, 500, "", {
      fontFamily: FONT_FAMILY,
      fontSize: "14px",
      color: Color.GREEN,
      lineSpacing: 1,
    });

    // ── Info / status bar ──
    this.infoText = this.add
      .text(LEFT_PANEL_W / 2, 770, "Click equipment on the right, then click grid to place.", SUBTITLE_STYLE)
      .setOrigin(0.5, 0);

    // ── Help text ──
    this.helpText = this.add
      .text(LEFT_PANEL_W / 2, 785, "R / Right-click: Rotate    Click placed: Remove", HELP_STYLE)
      .setOrigin(0.5, 0);

    // ── Deploy button ──
    this.deployBtn = this.add
      .text(RIGHT_X + RIGHT_W / 2, 755, ">> DEPLOY >>", BUTTON_STYLE)
      .setOrigin(0.5, 0)
      .setInteractive({ useHandCursor: true });
    this.deployBtn.on("pointerdown", () => this.deploy());

    // ── Initial renders ──
    this.renderEquipmentList();
    this.renderDeckPreview();

    // ── Input: grid pointer events ──
    this.gridText.on("pointermove", (_p: Phaser.Input.Pointer) => {
      const local = this.gridText.getLocalPoint(_p.x, _p.y);
      const cell = this.pixelToCell(local.x, local.y);
      if (cell) {
        this.renderGrid(cell.row, cell.col);
      } else {
        this.renderGrid();
      }
    });

    this.gridText.on("pointerout", () => {
      this.renderGrid();
    });

    this.gridText.on("pointerdown", (p: Phaser.Input.Pointer) => {
      // Right-click → rotate
      if (p.button === 2) {
        this.rotateEquipment();
        return;
      }
      const local = this.gridText.getLocalPoint(p.x, p.y);
      const cell = this.pixelToCell(local.x, local.y);
      if (cell) {
        this.handleGridClick(cell.row, cell.col);
      }
    });

    // ── Equipment list click ──
    this.equipmentListText.on("pointerdown", (p: Phaser.Input.Pointer) => {
      const local = this.equipmentListText.getLocalPoint(p.x, p.y);
      for (const zone of this.equipListZones) {
        if (local.y >= zone.y && local.y < zone.y + zone.h) {
          this.handleEquipmentListClick(zone.equipmentId);
          break;
        }
      }
    });

    // ── Keyboard: R to rotate ──
    const kb = this.input.keyboard;
    if (kb) {
      kb.addKey(Phaser.Input.Keyboard.KeyCodes.R).on("down", () =>
        this.rotateEquipment(),
      );
    }

    // Disable browser right-click menu on the canvas
    this.input.mouse?.disableContextMenu();
  }

  // ─── Grid origin computation ──────────────────────────────

  private computeGridOrigin(): void {
    const rows = this.gridModel.rows;
    const cols = this.gridModel.cols;

    // Row labels: up to 2 chars + 1 space → 3 chars prefix
    const labelPrefixChars = 3;
    // Col labels: 1 header line
    const labelHeaderLines = 1;

    // Total text width = prefix + cols*2 chars
    const totalTextW = (labelPrefixChars + cols * 2) * CHAR_HALF_W;
    // Total text height = header + rows lines
    const totalTextH = (labelHeaderLines + rows) * CELL_PX_H;

    // Center in left panel
    const panelCX = LEFT_PANEL_W / 2;
    const panelCY = 70 + (730 - 70) / 2; // vertically between y=70 and y=730

    const textX = panelCX - totalTextW / 2;
    const textY = panelCY - totalTextH / 2;

    this.gridText.setPosition(textX, textY);

    // The data cells start after the label prefix and header
    this.gridOriginX = labelPrefixChars * CHAR_HALF_W;
    this.gridOriginY = labelHeaderLines * CELL_PX_H;
  }

  // ─── Pixel ↔ Cell mapping ─────────────────────────────────

  private pixelToCell(
    localX: number,
    localY: number,
  ): Position | null {
    const cx = localX - this.gridOriginX;
    const cy = localY - this.gridOriginY;

    if (cx < 0 || cy < 0) return null;

    const col = Math.floor(cx / CELL_PX_W);
    const row = Math.floor(cy / CELL_PX_H);

    if (row < 0 || row >= this.gridModel.rows) return null;
    if (col < 0 || col >= this.gridModel.cols) return null;

    return { row, col };
  }

  // ─── Grid rendering ───────────────────────────────────────

  private renderGrid(hoverRow?: number, hoverCol?: number): void {
    const rows = this.gridModel.rows;
    const cols = this.gridModel.cols;

    // Build a set of preview cells (if equipment is selected and hovering)
    const previewCells = new Map<string, boolean>(); // key → valid?
    if (
      this.selectedEquipmentId != null &&
      hoverRow !== undefined &&
      hoverCol !== undefined
    ) {
      const equipDef = EQUIPMENT[this.selectedEquipmentId];
      if (equipDef) {
        const rotated = rotateShape(equipDef.shape, this.currentRotation);
        const canPlace = this.gridModel.canPlace(
          equipDef,
          { row: hoverRow, col: hoverCol },
          this.currentRotation,
        );
        for (const cell of rotated) {
          const r = hoverRow + cell.row;
          const c = hoverCol + cell.col;
          previewCells.set(`${r},${c}`, canPlace);
        }
      }
    }

    // Build equipment-to-cell mapping for colouring occupied cells
    const cellOwner = new Map<string, string>(); // "r,c" → equipmentId
    for (const placed of this.gridModel.getPlacedEquipment()) {
      const cells = this.gridModel.getOccupiedCells(placed.equipmentId);
      if (cells) {
        for (const c of cells) {
          cellOwner.set(`${c.row},${c.col}`, placed.equipmentId);
        }
      }
    }

    const lines: string[] = [];

    // Column header
    let header = "   "; // 3-char prefix for row labels
    for (let c = 0; c < cols; c++) {
      const label = c.toString();
      header += label.length === 1 ? label + " " : label;
    }
    lines.push(header);

    // Grid rows
    for (let r = 0; r < rows; r++) {
      const rowLabel = r.toString().padStart(2, " ") + " ";
      let line = rowLabel;
      for (let c = 0; c < cols; c++) {
        const key = `${r},${c}`;
        const preview = previewCells.get(key);

        if (preview !== undefined) {
          line += preview ? CellChar.PREVIEW_OK : CellChar.PREVIEW_BAD;
        } else {
          const state = this.gridModel.getCell(r, c);
          switch (state) {
            case "EMPTY":
              line += CellChar.EMPTY;
              break;
            case "OCCUPIED":
              line += CellChar.OCCUPIED;
              break;
            case "BLOCKED":
              line += CellChar.BLOCKED;
              break;
          }
        }
      }
      lines.push(line);
    }

    this.gridText.setText(lines.join("\n"));

    // Colour the text using setStyle (monochrome) — we keep it simple green
    // but colour preview cells via word-wrap colour tags
    // Since Phaser text doesn't easily do per-character colour without
    // BitmapText, we rebuild with colour markup if there are previews.

    if (previewCells.size > 0 || cellOwner.size > 0) {
      this.renderGridColoured(lines, previewCells, cellOwner);
    }
  }

  /** Rebuild grid text with colour tags for preview and placed equipment. */
  private renderGridColoured(
    _lines: string[],
    previewCells: Map<string, boolean>,
    cellOwner: Map<string, string>,
  ): void {
    const rows = this.gridModel.rows;
    const cols = this.gridModel.cols;

    const parts: string[] = [];

    // Header line — dim
    let header = "   ";
    for (let c = 0; c < cols; c++) {
      const label = c.toString();
      header += label.length === 1 ? label + " " : label;
    }
    parts.push(`[color=${Color.DIM}]${header}[/color]`);

    for (let r = 0; r < rows; r++) {
      const rowLabel = r.toString().padStart(2, " ") + " ";
      let line = `[color=${Color.DIM}]${rowLabel}[/color]`;

      for (let c = 0; c < cols; c++) {
        const key = `${r},${c}`;
        const preview = previewCells.get(key);

        if (preview !== undefined) {
          const color = preview ? Color.GREEN : Color.RED;
          const ch = preview ? CellChar.PREVIEW_OK : CellChar.PREVIEW_BAD;
          line += `[color=${color}]${ch}[/color]`;
        } else {
          const state = this.gridModel.getCell(r, c);
          const owner = cellOwner.get(key);

          if (state === "OCCUPIED" && owner) {
            // Highlight the selected equipment's cells in yellow
            const color =
              owner === this.selectedEquipmentId ? Color.YELLOW : Color.CYAN;
            line += `[color=${color}]${CellChar.OCCUPIED}[/color]`;
          } else if (state === "BLOCKED") {
            line += `[color=${Color.DARK}]${CellChar.BLOCKED}[/color]`;
          } else {
            line += `[color=${Color.DIM}]${CellChar.EMPTY}[/color]`;
          }
        }
      }
      parts.push(line);
    }

    // Use Phaser's BBCode-like markup via the "style" richText or
    // simple approach: rebuild with color tags
    // Phaser.GameObjects.Text doesn't support inline colour tags natively.
    // We'll use a simpler approach: just set the whole text and accept mono colour.
    // For proper colouring, we'd need BitmapText or multiple text objects.
    // Instead, let's keep it monochrome but swap the entire text color
    // based on the primary state.

    // Simple fallback: just set the already-built _lines
    // The grid is readable without per-cell colours.
    this.gridText.setText(_lines.join("\n"));
  }

  // ─── Equipment list rendering ─────────────────────────────

  private renderEquipmentList(): void {
    const placed = new Set(
      this.gridModel.getPlacedEquipment().map((p) => p.equipmentId),
    );

    const panel = buildPanel(34, BOX_DOUBLE)
      .title("AVAILABLE EQUIPMENT")
      .separator();

    const lineH = 16; // approximate line height at 14px + 2 spacing
    let currentY = lineH * 3; // after the 3 header lines
    this.equipListZones = [];

    // Show all starting equipment
    for (const eqId of this.shipDef.startingEquipment) {
      const equipDef = EQUIPMENT[eqId];
      if (!equipDef) continue;

      const isPlaced = placed.has(eqId);
      const isSelected = eqId === this.selectedEquipmentId;

      const status = isPlaced ? "[PLACED]" : "        ";
      const marker = isSelected ? "►" : " ";
      const grade = equipDef.grade.toUpperCase().padEnd(9);

      const name = truncate(equipDef.name, 14);
      const shape = truncate(equipDef.shapeDescription, 8);

      panel.raw(`${marker} ${status} ${name} ${shape} ${grade}`);

      this.equipListZones.push({
        y: currentY,
        h: lineH,
        equipmentId: eqId,
      });
      currentY += lineH;
    }

    panel.separator();
    currentY += lineH;

    // Selected equipment details
    if (this.selectedEquipmentId) {
      const eq = EQUIPMENT[this.selectedEquipmentId];
      if (eq) {
        panel.left(`Selected: ${truncate(eq.name, 21)}`);
        panel.left(`Rotation: ${this.currentRotation}°`);
        panel.left(`Shape: ${eq.shapeDescription}`);

        // Show shape preview
        const rotated = rotateShape(eq.shape, this.currentRotation);
        const shapeLines = this.renderShapePreview(rotated);
        for (const sl of shapeLines) {
          panel.left(` ${sl}`);
        }

        // Show provided cards
        panel.left("Cards:");
        for (const pc of eq.providedCards) {
          const card = CARDS[pc.cardId];
          const cardName = card ? card.name : pc.cardId;
          panel.left(`  ${cardName} ×${pc.count}`);
        }
      }
    } else {
      panel.left("No equipment selected.");
    }

    panel.close();
    this.equipmentListText.setText(panel.toString());
  }

  /** Render a small ASCII preview of an equipment shape. */
  private renderShapePreview(cells: Position[]): string[] {
    if (cells.length === 0) return [];
    let maxR = 0;
    let maxC = 0;
    for (const c of cells) {
      if (c.row > maxR) maxR = c.row;
      if (c.col > maxC) maxC = c.col;
    }
    const cellSet = new Set(cells.map((c) => `${c.row},${c.col}`));
    const lines: string[] = [];
    for (let r = 0; r <= maxR; r++) {
      let line = "";
      for (let c = 0; c <= maxC; c++) {
        line += cellSet.has(`${r},${c}`) ? "██" : "  ";
      }
      lines.push(line);
    }
    return lines;
  }

  // ─── Deck preview rendering ───────────────────────────────

  private renderDeckPreview(): void {
    const placed = this.gridModel.getPlacedEquipment();

    const panel = buildPanel(34, BOX_DOUBLE)
      .title("DECK PREVIEW")
      .separator();

    if (placed.length === 0) {
      panel.left("(no equipment placed)");
    } else {
      // Aggregate cards from placed equipment
      const cardCounts = new Map<string, number>();
      for (const p of placed) {
        const eq = EQUIPMENT[p.equipmentId];
        if (!eq) continue;
        for (const pc of eq.providedCards) {
          cardCounts.set(
            pc.cardId,
            (cardCounts.get(pc.cardId) ?? 0) + pc.count,
          );
        }
      }

      let totalCards = 0;
      for (const [cardId, count] of cardCounts) {
        const card = CARDS[cardId];
        const name = card ? card.name : cardId;
        const ep = card ? `${card.epCost}EP` : "";
        panel.left(`${name} ×${count}  ${ep}`);
        totalCards += count;
      }

      panel.separator();
      panel.left(`Total: ${totalCards} cards`);
    }

    panel.close();
    this.deckPreviewText.setText(panel.toString());
  }

  // ─── Interaction handlers ─────────────────────────────────

  private handleGridClick(row: number, col: number): void {
    if (this.selectedEquipmentId) {
      const equipDef = EQUIPMENT[this.selectedEquipmentId];
      if (!equipDef) return;

      // Check if this equipment is already placed
      const placedIds = new Set(
        this.gridModel.getPlacedEquipment().map((p) => p.equipmentId),
      );
      if (placedIds.has(this.selectedEquipmentId)) {
        this.setInfo("Equipment already placed. Click it in the list to remove first.", Color.RED);
        return;
      }

      if (
        this.gridModel.canPlace(
          equipDef,
          { row, col },
          this.currentRotation,
        )
      ) {
        this.gridModel.place(equipDef, { row, col }, this.currentRotation);
        this.setInfo(`Placed ${equipDef.name} at (${row}, ${col})`, Color.GREEN);
        this.selectedEquipmentId = null;
        this.currentRotation = 0;
        this.refreshAll();
      } else {
        this.setInfo("Cannot place here — cells blocked or occupied.", Color.RED);
      }
    } else {
      // No equipment selected — check if clicking on an occupied cell
      const state = this.gridModel.getCell(row, col);
      if (state === "OCCUPIED") {
        // Find which equipment occupies this cell
        for (const p of this.gridModel.getPlacedEquipment()) {
          const cells = this.gridModel.getOccupiedCells(p.equipmentId);
          if (cells?.some((c) => c.row === row && c.col === col)) {
            const eq = EQUIPMENT[p.equipmentId];
            if (eq) {
              this.setInfo(
                `${eq.name} (${eq.grade}) — ${eq.shapeDescription}  |  ${eq.description}`,
                Color.CYAN,
              );
            }
            break;
          }
        }
      }
    }
  }

  private handleEquipmentListClick(equipmentId: string): void {
    const placed = new Set(
      this.gridModel.getPlacedEquipment().map((p) => p.equipmentId),
    );

    if (placed.has(equipmentId)) {
      // Remove it
      this.gridModel.remove(equipmentId);
      const eq = EQUIPMENT[equipmentId];
      this.setInfo(`Removed ${eq?.name ?? equipmentId}`, Color.YELLOW);
      if (this.selectedEquipmentId === equipmentId) {
        this.selectedEquipmentId = null;
      }
      this.refreshAll();
    } else {
      // Select for placement
      this.selectEquipment(equipmentId);
    }
  }

  private selectEquipment(equipmentId: string): void {
    if (this.selectedEquipmentId === equipmentId) {
      // Deselect
      this.selectedEquipmentId = null;
      this.currentRotation = 0;
      this.setInfo("Equipment deselected.", Color.DIM);
    } else {
      this.selectedEquipmentId = equipmentId;
      this.currentRotation = 0;
      const eq = EQUIPMENT[equipmentId];
      this.setInfo(
        `Selected ${eq?.name ?? equipmentId}. Click on grid to place. R to rotate.`,
        Color.YELLOW,
      );
    }
    this.renderEquipmentList();
    this.renderGrid();
  }

  private rotateEquipment(): void {
    if (!this.selectedEquipmentId) return;
    const rotations: Rotation[] = [0, 90, 180, 270];
    const idx = rotations.indexOf(this.currentRotation);
    this.currentRotation = rotations[(idx + 1) % 4]!;
    this.setInfo(`Rotation: ${this.currentRotation}°`, Color.YELLOW);
    this.renderEquipmentList();
    this.renderGrid();
  }

  private deploy(): void {
    const placed = this.gridModel.getPlacedEquipment();
    if (placed.length === 0) {
      this.setInfo("Place at least one equipment before deploying!", Color.RED);
      return;
    }

    // Pick a random non-boss, non-elite enemy from zone 1
    const zone1Enemies = ENEMIES.filter(
      (e) => e.zoneIds.includes(1) && !e.isBoss && !e.isElite,
    );
    if (zone1Enemies.length === 0) {
      this.setInfo("No enemies available for zone 1!", Color.RED);
      return;
    }
    const enemy = zone1Enemies[Math.floor(Math.random() * zone1Enemies.length)]!;

    this.scene.start("BattleScene", {
      shipId: this.shipDef.id,
      placedEquipment: placed,
      enemyId: enemy.id,
    });
  }

  // ─── Helpers ──────────────────────────────────────────────

  private refreshAll(): void {
    this.renderGrid();
    this.renderEquipmentList();
    this.renderDeckPreview();
  }

  private setInfo(message: string, color: string): void {
    this.infoText.setText(message);
    this.infoText.setColor(color);
  }
}
