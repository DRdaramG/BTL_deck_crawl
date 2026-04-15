import type { ShipDefinition } from "./types.js";
import type { Position } from "./types.js";

// ============================================================
// 우주선 정의 데이터
// ============================================================

// ────────────────────────────────────────────────────────────
// 공통 헬퍼: 좌우 대칭 함선 형상 생성
// ────────────────────────────────────────────────────────────

/**
 * 좌우 대칭 함선 그리드 셀 생성.
 * @param cols     그리드 열 수 (홀수)
 * @param halfWidths 각 행별 중심으로부터의 반폭 배열 (행 수 = halfWidths.length)
 *
 * 예) cols=9, halfWidth=4 → 중심(col 4)에서 ±4 → cols 0‑8 (9칸)
 */
function symmetricCells(cols: number, halfWidths: number[]): Position[] {
  const mid = (cols - 1) / 2;
  const cells: Position[] = [];
  for (let r = 0; r < halfWidths.length; r++) {
    const hw = halfWidths[r];
    if (hw === undefined) continue;
    for (let c = 0; c < cols; c++) {
      if (Math.abs(c - mid) <= hw) {
        cells.push({ row: r, col: c });
      }
    }
  }
  return cells;
}

// ────────────────────────────────────────────────────────────
// 각 함선별 유효 셀 정의
// ────────────────────────────────────────────────────────────

/**
 * 초계함 (Corvette) — 10×9 다이아몬드형 (유효 셀 50개)
 *
 *   . . . . X . . . .
 *   . . . X X X . . .
 *   . . X X X X X . .
 *   . X X X X X X X .
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   . X X X X X X X .
 *   . . X X X X X . .
 *   . . . X X X . . .
 *   . . . . X . . . .
 */
function corvetteValidCells(): Position[] {
  //       row: 0  1  2  3  4  5  6  7  8  9
  return symmetricCells(9, [0, 1, 2, 3, 4, 4, 3, 2, 1, 0]);
  // tiles: 1+3+5+7+9+9+7+5+3+1 = 50
}

/**
 * 호위함 (Frigate) — 10×9 전방 확장형 (유효 셀 58개)
 *
 *   . . . X X X . . .
 *   . . X X X X X . .
 *   . X X X X X X X .
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   . X X X X X X X .
 *   . . X X X X X . .
 *   . . . X X X . . .
 *   . . . . X . . . .
 */
function frigateValidCells(): Position[] {
  return symmetricCells(9, [1, 2, 3, 4, 4, 4, 3, 2, 1, 0]);
  // tiles: 3+5+7+9+9+9+7+5+3+1 = 58
}

/**
 * 구축함 (Destroyer) — 12×7 세장형 (유효 셀 66개)
 *
 *   . . . X . . .
 *   . . X X X . .
 *   . X X X X X .
 *   X X X X X X X
 *   X X X X X X X
 *   X X X X X X X
 *   X X X X X X X
 *   X X X X X X X
 *   X X X X X X X
 *   X X X X X X X
 *   . X X X X X .
 *   . . X X X . .
 */
function destroyerValidCells(): Position[] {
  return symmetricCells(7, [0, 1, 2, 3, 3, 3, 3, 3, 3, 3, 2, 1]);
  // tiles: 1+3+5+(7×7)+5+3 = 66
}

/**
 * 순양함 (Cruiser) — 11×9 광폭 타원형 (유효 셀 75개)
 *
 *   . . . X X X . . .
 *   . . X X X X X . .
 *   . X X X X X X X .
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   . X X X X X X X .
 *   . . X X X X X . .
 *   . . . X X X . . .
 */
function cruiserValidCells(): Position[] {
  return symmetricCells(9, [1, 2, 3, 4, 4, 4, 4, 4, 3, 2, 1]);
  // tiles: 3+5+7+(9×5)+7+5+3 = 75
}

/**
 * 순양전함 (Battlecruiser) — 14×9 장방형 (유효 셀 90개)
 *
 *   . . . . X . . . .
 *   . . . X X X . . .
 *   . . X X X X X . .
 *   . X X X X X X X .
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   . X X X X X X X .
 *   . . X X X X X . .
 *   . . X X X X X . .
 *   . . . X X X . . .
 */
function battlecruiserValidCells(): Position[] {
  return symmetricCells(9, [0, 1, 2, 3, 4, 4, 4, 4, 4, 4, 3, 2, 2, 1]);
  // tiles: 1+3+5+7+(9×6)+7+5+5+3 = 90
}

/**
 * 전함 (Battleship) — 13×11 대형 (유효 셀 103개)
 *
 *   . . . . X X X . . . .
 *   . . . X X X X X . . .
 *   . . X X X X X X X . .
 *   . X X X X X X X X X .
 *   X X X X X X X X X X X
 *   X X X X X X X X X X X
 *   X X X X X X X X X X X
 *   X X X X X X X X X X X
 *   X X X X X X X X X X X
 *   . X X X X X X X X X .
 *   . . X X X X X X X . .
 *   . . . X X X X X . . .
 *   . . . . X X X . . . .
 */
function battleshipValidCells(): Position[] {
  return symmetricCells(11, [1, 2, 3, 4, 5, 5, 5, 5, 5, 4, 3, 2, 1]);
  // tiles: 3+5+7+9+(11×5)+9+7+5+3 = 103
}

/**
 * 화물선 (Cargo Ship) — 10×9 박스형 (유효 셀 72개)
 *
 *   . . X X X X X . .
 *   . X X X X X X X .
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   . X X X X X X X .
 *   . . . X X X . . .
 */
function cargoShipValidCells(): Position[] {
  return symmetricCells(9, [2, 3, 4, 4, 4, 4, 4, 4, 3, 1]);
  // tiles: 5+7+(9×6)+7+3 = 76
}

/**
 * 상륙강습함 (Assault Ship) — 10×11 광폭 갑판형 (유효 셀 84개)
 *
 *   . . X X X X X X X . .
 *   . X X X X X X X X X .
 *   X X X X X X X X X X X
 *   X X X X X X X X X X X
 *   X X X X X X X X X X X
 *   X X X X X X X X X X X
 *   . X X X X X X X X X .
 *   . . X X X X X X X . .
 *   . . . X X X X X . . .
 *   . . . . X X X . . . .
 */
function assaultShipValidCells(): Position[] {
  return symmetricCells(11, [3, 4, 5, 5, 5, 5, 4, 3, 2, 1]);
  // tiles: 7+9+(11×4)+9+7+5+3 = 84
}

/**
 * 드론항모 (Drone Carrier) — 11×9 복부 확장형 (유효 셀 79개)
 *
 *   . . X X X X X . .
 *   . X X X X X X X .
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   X X X X X X X X X
 *   . X X X X X X X .
 *   . X X X X X X X .
 *   . . X X X X X . .
 *   . . . . X . . . .
 */
function droneCarrierValidCells(): Position[] {
  return symmetricCells(9, [2, 3, 4, 4, 4, 4, 4, 3, 3, 2, 0]);
  // tiles: 5+7+(9×5)+7+7+5+1 = 77
}

/**
 * 항모 (Carrier) — 13×11 초대형 비행갑판 (유효 셀 97개)
 *
 *   . . . . X X X . . . .
 *   . . X X X X X X X . .
 *   . X X X X X X X X X .
 *   X X X X X X X X X X X
 *   X X X X X X X X X X X
 *   X X X X X X X X X X X
 *   X X X X X X X X X X X
 *   X X X X X X X X X X X
 *   . X X X X X X X X X .
 *   . X X X X X X X X X .
 *   . . X X X X X X X . .
 *   . . . X X X X X . . .
 *   . . . . X X X . . . .
 */
function carrierValidCells(): Position[] {
  return symmetricCells(11, [1, 3, 4, 5, 5, 5, 5, 5, 4, 4, 3, 2, 1]);
  // tiles: 3+7+9+(11×5)+9+9+7+5+3 = 107
}

// ────────────────────────────────────────────────────────────
// 함선 데이터
// ────────────────────────────────────────────────────────────

export const SHIPS: Record<string, ShipDefinition> = {
  /* ── 소형함 ── */

  corvette: {
    id: "corvette",
    name: "Corvette",
    nameKo: "초계함",
    grid: {
      rows: 10,
      cols: 9,
      validCells: corvetteValidCells(),
    },
    startingEquipment: ["booster_engine", "laser_cannon", "shield_generator"],
    passiveDescription: "회피 카드 사용 시 AP +1 복원",
    passive: {
      trigger: "on_evade_card",
      effectType: "restore_ap",
      value: 1,
    },
    maxHp: 60,
  },

  frigate: {
    id: "frigate",
    name: "Frigate",
    nameKo: "호위함",
    grid: {
      rows: 10,
      cols: 9,
      validCells: frigateValidCells(),
    },
    startingEquipment: ["plasma_gun", "shield_generator", "crew_quarter_a"],
    passiveDescription: "공격 카드 사용 시 피해 +2",
    passive: {
      trigger: "on_attack_card",
      effectType: "add_damage",
      value: 2,
    },
    maxHp: 70,
  },

  /* ── 중형함 ── */

  destroyer: {
    id: "destroyer",
    name: "Destroyer",
    nameKo: "구축함",
    grid: {
      rows: 12,
      cols: 7,
      validCells: destroyerValidCells(),
    },
    startingEquipment: ["railgun", "missile_launcher", "booster_engine"],
    passiveDescription: "공격 카드 사용 시 피해 +3",
    passive: {
      trigger: "on_attack_card",
      effectType: "add_damage",
      value: 3,
    },
    maxHp: 80,
  },

  cruiser: {
    id: "cruiser",
    name: "Cruiser",
    nameKo: "순양함",
    grid: {
      rows: 11,
      cols: 9,
      validCells: cruiserValidCells(),
    },
    startingEquipment: [
      "plasma_gun",
      "shield_generator",
      "crew_quarter_a",
      "med_bay",
    ],
    passiveDescription: "없음 (범용)",
    passive: null,
    maxHp: 90,
  },

  cargo_ship: {
    id: "cargo_ship",
    name: "Cargo Ship",
    nameKo: "화물선",
    grid: {
      rows: 10,
      cols: 9,
      validCells: cargoShipValidCells(),
    },
    startingEquipment: [
      "laser_cannon",
      "reinforced_hull",
      "life_support",
      "crew_quarter_a",
    ],
    passiveDescription: "턴 시작 시 HP 3 회복",
    passive: {
      trigger: "on_turn_start",
      effectType: "heal",
      value: 3,
    },
    maxHp: 75,
  },

  /* ── 대형함 ── */

  drone_carrier: {
    id: "drone_carrier",
    name: "Drone Carrier",
    nameKo: "드론항모",
    grid: {
      rows: 11,
      cols: 9,
      validCells: droneCarrierValidCells(),
    },
    startingEquipment: [
      "drone_bay_beam_common",
      "drone_bay_repair_common",
      "shield_generator",
    ],
    passiveDescription: "드론 카드 사용 시 효과 +3",
    passive: {
      trigger: "on_drone_card",
      effectType: "add_damage",
      value: 3,
    },
    maxHp: 85,
  },

  assault_ship: {
    id: "assault_ship",
    name: "Assault Ship",
    nameKo: "상륙강습함",
    grid: {
      rows: 10,
      cols: 11,
      validCells: assaultShipValidCells(),
    },
    startingEquipment: [
      "plasma_gun",
      "missile_launcher",
      "shield_generator",
      "crew_quarter_a",
    ],
    passiveDescription: "공격 카드 사용 시 피해량 경감 2 획득",
    passive: {
      trigger: "on_attack_card",
      effectType: "damage_reduction",
      value: 2,
    },
    maxHp: 100,
  },

  battlecruiser: {
    id: "battlecruiser",
    name: "Battlecruiser",
    nameKo: "순양전함",
    grid: {
      rows: 14,
      cols: 9,
      validCells: battlecruiserValidCells(),
    },
    startingEquipment: [
      "railgun",
      "plasma_gun",
      "booster_engine",
      "shield_generator",
    ],
    passiveDescription: "적 처치 시 카드 1장 드로우",
    passive: {
      trigger: "on_kill",
      effectType: "draw_card",
      value: 1,
    },
    maxHp: 120,
  },

  carrier: {
    id: "carrier",
    name: "Carrier",
    nameKo: "항모",
    grid: {
      rows: 13,
      cols: 11,
      validCells: carrierValidCells(),
    },
    startingEquipment: [
      "fighter_hangar_common",
      "bomber_hangar_common",
      "shield_generator",
      "life_support",
    ],
    passiveDescription: "턴 시작 시 AP +1 복원",
    passive: {
      trigger: "on_turn_start",
      effectType: "restore_ap",
      value: 1,
    },
    maxHp: 110,
  },

  battleship: {
    id: "battleship",
    name: "Battleship",
    nameKo: "전함",
    grid: {
      rows: 13,
      cols: 11,
      validCells: battleshipValidCells(),
    },
    startingEquipment: [
      "railgun",
      "reinforced_hull",
      "life_support",
      "shield_generator",
    ],
    passiveDescription: "블록 카드 효과 +5",
    passive: {
      trigger: "on_block_card",
      effectType: "add_block",
      value: 5,
    },
    maxHp: 150,
  },
};
