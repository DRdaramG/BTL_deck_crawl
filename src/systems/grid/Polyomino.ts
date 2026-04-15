import type { Position, PolyominoShape, Rotation } from "../../data/types";

/** Get the bounding box of a set of cells. */
export function getShapeBounds(cells: Position[]): {
  minRow: number;
  maxRow: number;
  minCol: number;
  maxCol: number;
} {
  let minRow = Infinity;
  let maxRow = -Infinity;
  let minCol = Infinity;
  let maxCol = -Infinity;

  for (const { row, col } of cells) {
    if (row < minRow) minRow = row;
    if (row > maxRow) maxRow = row;
    if (col < minCol) minCol = col;
    if (col > maxCol) maxCol = col;
  }

  return { minRow, maxRow, minCol, maxCol };
}

/** Shift cells so the minimum row and column are both 0. */
export function normalizeCells(cells: Position[]): Position[] {
  const { minRow, minCol } = getShapeBounds(cells);
  return cells.map((c) => ({ row: c.row - minRow, col: c.col - minCol }));
}

/**
 * Rotate a polyomino shape by the given angle and return normalized cells.
 *
 * Rotation formulas (before normalization):
 *   90°:  (r, c) → (c,      maxR - r)
 *  180°:  (r, c) → (maxR - r, maxC - c)
 *  270°:  (r, c) → (maxC - c, r)
 */
export function rotateShape(
  shape: PolyominoShape,
  rotation: Rotation,
): Position[] {
  if (rotation === 0) {
    return normalizeCells(shape.cells);
  }

  const { maxRow, maxCol } = getShapeBounds(shape.cells);

  let rotated: Position[];

  switch (rotation) {
    case 90:
      rotated = shape.cells.map((c) => ({
        row: c.col,
        col: maxRow - c.row,
      }));
      break;
    case 180:
      rotated = shape.cells.map((c) => ({
        row: maxRow - c.row,
        col: maxCol - c.col,
      }));
      break;
    case 270:
      rotated = shape.cells.map((c) => ({
        row: maxCol - c.col,
        col: c.row,
      }));
      break;
    default: {
      const _exhaustive: never = rotation;
      throw new Error(`Unsupported rotation: ${_exhaustive}`);
    }
  }

  return normalizeCells(rotated);
}
