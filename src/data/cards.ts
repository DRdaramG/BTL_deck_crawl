import type { CardDefinition } from "./types.js";

// ============================================================
// 카드 정의 데이터
// ============================================================

export const CARDS: Record<string, CardDefinition> = {
  // ── 무기 계열 카드 ──────────────────────────────────────
  laser_shot: {
    id: "laser_shot",
    name: "레이저 사격",
    type: "attack",
    apCost: 1,
    description: "적에게 6 피해",
    effects: [{ type: "damage", value: 6 }],
  },

  plasma_burst: {
    id: "plasma_burst",
    name: "플라즈마 버스트",
    type: "attack",
    apCost: 2,
    description: "단일 적에게 9 피해 + 화상 1 부여",
    effects: [
      { type: "damage", value: 9 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 1 },
    ],
  },

  railgun_pierce: {
    id: "railgun_pierce",
    name: "레일건 관통",
    type: "attack",
    apCost: 3,
    description: "전체 열 관통 12 피해",
    effects: [{ type: "damage_all", value: 12 }],
  },

  pulse_barrage: {
    id: "pulse_barrage",
    name: "펄스 연사",
    type: "attack",
    apCost: 2,
    description: "단일 적에게 4 피해 3회",
    effects: [{ type: "multi_hit", value: 4, hitCount: 3 }],
  },

  // ── 미사일 계열 카드 ──────────────────────────────────────
  missile_launch: {
    id: "missile_launch",
    name: "미사일 발사",
    type: "attack",
    apCost: 2,
    description: "모든 적에게 4 피해, 화상 1 부여",
    effects: [
      { type: "damage_all", value: 4 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 1 },
    ],
  },

  // ── 방어 계열 카드 ──────────────────────────────────────
  energy_shield: {
    id: "energy_shield",
    name: "에너지 실드",
    type: "defense",
    apCost: 1,
    description: "블록 8 획득",
    effects: [{ type: "block", value: 8 }],
  },

  reinforced_hull: {
    id: "reinforced_hull",
    name: "강화 선체",
    type: "defense",
    apCost: 2,
    description: "블록 15 획득, 피해 감소 1턴",
    effects: [
      { type: "block", value: 15 },
      { type: "damage_reduction", value: 1, duration: 1 },
    ],
  },

  reflect_shield: {
    id: "reflect_shield",
    name: "반사",
    type: "defense",
    apCost: 2,
    description: "블록 6 + 피해 반사",
    effects: [
      { type: "block", value: 6 },
      { type: "damage_reflect" },
    ],
  },

  // ── 이동 계열 카드 ──────────────────────────────────────
  emergency_evade: {
    id: "emergency_evade",
    name: "긴급 회피",
    type: "skill",
    apCost: 1,
    description: "다음 공격 회피",
    effects: [{ type: "evade", duration: 1 }],
  },

  phase_shift: {
    id: "phase_shift",
    name: "위상 이동",
    type: "skill",
    apCost: 3,
    description: "3턴 동안 모든 공격 회피",
    effects: [{ type: "evade", duration: 3 }],
  },

  // ── 지원 계열 카드 ──────────────────────────────────────
  morale_boost: {
    id: "morale_boost",
    name: "사기 진작",
    type: "skill",
    apCost: 0,
    description: "다음 카드 AP 비용 –1",
    effects: [{ type: "reduce_ap", value: 1 }],
  },

  first_aid: {
    id: "first_aid",
    name: "응급 처치",
    type: "skill",
    apCost: 1,
    description: "HP 6 회복",
    effects: [{ type: "heal", value: 6 }],
  },

  life_support_passive: {
    id: "life_support_passive",
    name: "생명 유지",
    type: "passive",
    apCost: 0,
    description: "매 턴 시작 HP +2",
    effects: [{ type: "passive_heal", value: 2 }],
  },
};
