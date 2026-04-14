import type { ShipDefinition } from "./types.js";

// ============================================================
// 우주선 정의 데이터
// ============================================================

/**
 * 정찰선 (Scout) 그리드 — 5×5 다이아몬드형 (유효 셀 13개)
 *
 *   . X X X .
 *   X X X X X
 *   X X X X X
 *   . X X X .
 *   . . X . .
 */
function scoutValidCells() {
  return [
    // row 0
    { row: 0, col: 1 },
    { row: 0, col: 2 },
    { row: 0, col: 3 },
    // row 1
    { row: 1, col: 0 },
    { row: 1, col: 1 },
    { row: 1, col: 2 },
    { row: 1, col: 3 },
    { row: 1, col: 4 },
    // row 2
    { row: 2, col: 0 },
    { row: 2, col: 1 },
    { row: 2, col: 2 },
    { row: 2, col: 3 },
    { row: 2, col: 4 },
    // row 3
    { row: 3, col: 1 },
    { row: 3, col: 2 },
    { row: 3, col: 3 },
    // row 4
    { row: 4, col: 2 },
  ];
}

/**
 * 순양함 (Cruiser) 그리드 — 7×7 사각형 (유효 셀 35개)
 * 중앙 십자형 확장 사각형
 */
function cruiserValidCells() {
  const cells = [];
  for (let r = 0; r < 7; r++) {
    for (let c = 0; c < 7; c++) {
      // 네 모서리를 제외한 영역
      const isCorner =
        (r < 2 && c < 2) ||
        (r < 2 && c > 4) ||
        (r > 4 && c < 2) ||
        (r > 4 && c > 4);
      if (!isCorner) {
        cells.push({ row: r, col: c });
      }
    }
  }
  return cells;
}

/**
 * 전함 (Battleship) 그리드 — 9×7 직사각형 (유효 셀 49개)
 * 넓은 직사각형
 */
function battleshipValidCells() {
  const cells = [];
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 7; c++) {
      // 상하 모서리 일부만 제외
      const isCorner =
        (r === 0 && (c === 0 || c === 6)) ||
        (r === 8 && (c === 0 || c === 6));
      if (!isCorner) {
        cells.push({ row: r, col: c });
      }
    }
  }
  return cells;
}

export const SHIPS: Record<string, ShipDefinition> = {
  scout: {
    id: "scout",
    name: "Scout",
    nameKo: "정찰선",
    icon: "🛸",
    grid: {
      rows: 5,
      cols: 5,
      validCells: scoutValidCells(),
    },
    startingEquipment: ["laser_cannon", "booster_engine"],
    passiveDescription: "회피 카드 사용 시 AP +1 복원",
    passive: {
      trigger: "on_evade_card",
      effectType: "restore_ap",
      value: 1,
    },
    maxHp: 50,
  },

  cruiser: {
    id: "cruiser",
    name: "Cruiser",
    nameKo: "순양함",
    icon: "🚀",
    grid: {
      rows: 7,
      cols: 7,
      validCells: cruiserValidCells(),
    },
    startingEquipment: ["plasma_gun", "shield_generator", "crew_quarter_a"],
    passiveDescription: "없음 (범용)",
    passive: null,
    maxHp: 70,
  },

  battleship: {
    id: "battleship",
    name: "Battleship",
    nameKo: "전함",
    icon: "🏰",
    grid: {
      rows: 9,
      cols: 7,
      validCells: battleshipValidCells(),
    },
    startingEquipment: ["railgun", "reinforced_hull", "life_support"],
    passiveDescription: "블록 카드 효과 +3",
    passive: {
      trigger: "on_block_card",
      effectType: "add_block",
      value: 3,
    },
    maxHp: 90,
  },
};
