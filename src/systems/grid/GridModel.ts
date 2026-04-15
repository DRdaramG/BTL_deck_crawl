import type {
  CellState,
  EquipmentDefinition,
  GridDefinition,
  GridState,
  PlacedEquipment,
  Position,
  Rotation,
} from "../../data/types";
import { rotateShape } from "./Polyomino";

/** Internal record that pairs a PlacedEquipment with its rotated relative cells. */
interface PlacementRecord {
  placement: PlacedEquipment;
  relativeCells: Position[];
}

export class GridModel {
  readonly rows: number;
  readonly cols: number;
  private cells: CellState[][];
  private placements: PlacementRecord[];

  constructor(gridDef: GridDefinition) {
    this.rows = gridDef.rows;
    this.cols = gridDef.cols;
    this.placements = [];

    // Initialize every cell as BLOCKED
    this.cells = Array.from({ length: this.rows }, () =>
      Array.from<CellState>({ length: this.cols }).fill("BLOCKED"),
    );

    // Mark valid cells as EMPTY
    for (const { row, col } of gridDef.validCells) {
      if (row >= 0 && row < this.rows && col >= 0 && col < this.cols) {
        this.cells[row]![col] = "EMPTY";
      }
    }
  }

  /** Get the state of a single cell. */
  getCell(row: number, col: number): CellState {
    if (row < 0 || row >= this.rows || col < 0 || col >= this.cols) {
      return "BLOCKED";
    }
    return this.cells[row]![col]!;
  }

  /** Check whether an equipment piece can be placed at the given position and rotation. */
  canPlace(
    equipment: EquipmentDefinition,
    position: Position,
    rotation: Rotation,
  ): boolean {
    const rotatedCells = rotateShape(equipment.shape, rotation);

    for (const cell of rotatedCells) {
      const targetRow = position.row + cell.row;
      const targetCol = position.col + cell.col;

      if (
        targetRow < 0 ||
        targetRow >= this.rows ||
        targetCol < 0 ||
        targetCol >= this.cols
      ) {
        return false;
      }

      if (this.cells[targetRow]![targetCol] !== "EMPTY") {
        return false;
      }
    }

    return true;
  }

  /** Place equipment on the grid. Returns true on success. */
  place(
    equipment: EquipmentDefinition,
    position: Position,
    rotation: Rotation,
  ): boolean {
    if (!this.canPlace(equipment, position, rotation)) {
      return false;
    }

    const rotatedCells = rotateShape(equipment.shape, rotation);

    for (const cell of rotatedCells) {
      this.cells[position.row + cell.row]![position.col + cell.col] =
        "OCCUPIED";
    }

    this.placements.push({
      placement: {
        equipmentId: equipment.id,
        position: { row: position.row, col: position.col },
        rotation,
      },
      relativeCells: rotatedCells,
    });

    return true;
  }

  /** Remove a placed equipment by its ID (first match). Returns true if found and removed. */
  remove(equipmentId: string): boolean {
    const index = this.placements.findIndex(
      (r) => r.placement.equipmentId === equipmentId,
    );

    if (index === -1) {
      return false;
    }

    const record = this.placements[index]!;
    const absCells = this.absoluteCells(record);

    for (const cell of absCells) {
      this.cells[cell.row]![cell.col] = "EMPTY";
    }

    this.placements.splice(index, 1);
    return true;
  }

  /** Get a shallow copy of the placed-equipment list. */
  getPlacedEquipment(): PlacedEquipment[] {
    return this.placements.map((r) => r.placement);
  }

  /** Return a deep copy of the current grid state. */
  getState(): GridState {
    return {
      rows: this.rows,
      cols: this.cols,
      cells: this.cells.map((row) => [...row]),
      placedEquipment: this.placements.map((r) => ({
        equipmentId: r.placement.equipmentId,
        position: { row: r.placement.position.row, col: r.placement.position.col },
        rotation: r.placement.rotation,
      })),
    };
  }

  /** Get the actual grid positions occupied by a placed equipment (first match). */
  getOccupiedCells(equipmentId: string): Position[] | null {
    const record = this.placements.find(
      (r) => r.placement.equipmentId === equipmentId,
    );

    if (!record) {
      return null;
    }

    return this.absoluteCells(record);
  }

  // ── private helpers ──────────────────────────────────────

  /** Convert relative cells of a placement record to absolute grid positions. */
  private absoluteCells(record: PlacementRecord): Position[] {
    const { position } = record.placement;
    return record.relativeCells.map((c) => ({
      row: position.row + c.row,
      col: position.col + c.col,
    }));
  }
}
