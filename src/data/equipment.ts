import type { EquipmentDefinition } from "./types.js";

// ============================================================
// 장비 정의 데이터
// ============================================================

export const EQUIPMENT: Record<string, EquipmentDefinition> = {
  // ── 무기 계열 ─────────────────────────────────────────────
  laser_cannon: {
    id: "laser_cannon",
    name: "레이저 캐논",
    category: "weapon",
    grade: "common",
    shape: {
      cells: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
      ],
    },
    shapeDescription: "1×3 직선",
    providedCards: [{ cardId: "laser_shot", count: 2 }],
    description: "기본적인 레이저 무기. 안정적인 단일 대상 공격 카드를 제공한다.",
  },

  plasma_gun: {
    id: "plasma_gun",
    name: "플라즈마 건",
    category: "weapon",
    grade: "rare",
    shape: {
      cells: [
        { row: 0, col: 0 },
        { row: 1, col: 0 },
        { row: 1, col: 1 },
      ],
    },
    shapeDescription: "L자 3칸",
    providedCards: [{ cardId: "plasma_burst", count: 2 }],
    description: "고열 플라즈마를 발사하여 화상을 부여하는 무기.",
  },

  railgun: {
    id: "railgun",
    name: "레일건",
    category: "weapon",
    grade: "epic",
    shape: {
      cells: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 0, col: 2 },
        { row: 0, col: 3 },
      ],
    },
    shapeDescription: "1×4 직선",
    providedCards: [{ cardId: "railgun_pierce", count: 1 }],
    description: "전자기 가속으로 발사하는 관통 무기. 모든 적을 관통한다.",
  },

  pulse_cannon: {
    id: "pulse_cannon",
    name: "펄스 캐논",
    category: "weapon",
    grade: "rare",
    shape: {
      cells: [
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: 1 },
        { row: 1, col: 2 },
      ],
    },
    shapeDescription: "T자 4칸",
    providedCards: [{ cardId: "pulse_barrage", count: 3 }],
    description: "빠른 연사가 가능한 펄스 무기.",
  },

  // ── 미사일 계열 ───────────────────────────────────────────
  missile_launcher: {
    id: "missile_launcher",
    name: "미사일 런처",
    category: "missile",
    grade: "rare",
    shape: {
      cells: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: 1 },
      ],
    },
    shapeDescription: "2×2 정사각",
    providedCards: [{ cardId: "missile_launch", count: 2 }],
    description: "광역 미사일을 발사하여 모든 적에게 피해와 화상을 부여한다.",
  },

  // ── 방어 계열 ─────────────────────────────────────────────
  shield_generator: {
    id: "shield_generator",
    name: "실드 제너레이터",
    category: "shield",
    grade: "common",
    shape: {
      cells: [
        { row: 0, col: 0 },
        { row: 1, col: 0 },
        { row: 1, col: 1 },
      ],
    },
    shapeDescription: "L자 3칸",
    providedCards: [{ cardId: "energy_shield", count: 2 }],
    description: "에너지 실드를 생성하여 블록을 부여한다.",
  },

  reinforced_hull: {
    id: "reinforced_hull",
    name: "강화 선체",
    category: "shield",
    grade: "rare",
    shape: {
      cells: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: 1 },
      ],
    },
    shapeDescription: "2×2 정사각",
    providedCards: [{ cardId: "reinforced_hull", count: 1 }],
    description: "선체를 강화하여 높은 블록과 피해 감소 효과를 부여한다.",
  },

  reflect_shield: {
    id: "reflect_shield",
    name: "반사 실드",
    category: "shield",
    grade: "epic",
    shape: {
      cells: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 1 },
        { row: 1, col: 2 },
      ],
    },
    shapeDescription: "Z자 4칸",
    providedCards: [{ cardId: "reflect_shield", count: 1 }],
    description: "받은 피해를 반사하는 고급 방어 장비.",
  },

  // ── 이동 계열 ─────────────────────────────────────────────
  booster_engine: {
    id: "booster_engine",
    name: "부스터 엔진",
    category: "engine",
    grade: "common",
    shape: {
      cells: [
        { row: 0, col: 0 },
        { row: 1, col: 0 },
      ],
    },
    shapeDescription: "1×2 수직",
    providedCards: [{ cardId: "emergency_evade", count: 2 }],
    description: "긴급 회피 기동이 가능한 부스터 엔진.",
  },

  warp_drive: {
    id: "warp_drive",
    name: "워프 드라이브",
    category: "engine",
    grade: "legendary",
    shape: {
      cells: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 1 },
        { row: 1, col: 2 },
      ],
    },
    shapeDescription: "S자 4칸",
    providedCards: [{ cardId: "phase_shift", count: 1 }],
    description: "공간 위상을 이동하여 장시간 공격을 회피하는 전설급 장비.",
  },

  // ── 지원 계열 ─────────────────────────────────────────────
  crew_quarter_a: {
    id: "crew_quarter_a",
    name: "선원실 A",
    category: "crew_quarter",
    grade: "common",
    shape: {
      cells: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
      ],
    },
    shapeDescription: "2×1 수평",
    providedCards: [{ cardId: "morale_boost", count: 2 }],
    description: "선원들의 사기를 올려 AP 비용을 절감한다.",
  },

  med_bay: {
    id: "med_bay",
    name: "의무실",
    category: "med_bay",
    grade: "rare",
    shape: {
      cells: [
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: 1 },
        { row: 1, col: 2 },
      ],
    },
    shapeDescription: "T자 4칸",
    providedCards: [{ cardId: "first_aid", count: 2 }],
    description: "부상을 치료하여 HP를 회복한다.",
  },

  life_support: {
    id: "life_support",
    name: "생명유지장치",
    category: "life_support",
    grade: "rare",
    shape: {
      cells: [
        { row: 0, col: 0 },
        { row: 0, col: 1 },
        { row: 1, col: 0 },
        { row: 1, col: 1 },
      ],
    },
    shapeDescription: "2×2 정사각",
    providedCards: [{ cardId: "life_support_passive", count: 1 }],
    description: "매 턴 자동으로 HP를 회복하는 패시브 장비.",
  },
};
