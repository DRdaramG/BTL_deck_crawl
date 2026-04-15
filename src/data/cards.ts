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

  // ============================================================
  // 무기 — 레이저 캐논 (소형/중형/대형)
  // ============================================================

  laser_shot_sm: {
    id: "laser_shot_sm",
    name: "소형 레이저 사격",
    type: "attack",
    apCost: 1,
    description: "적에게 5 피해",
    effects: [{ type: "damage", value: 5 }],
  },
  laser_shot_md: {
    id: "laser_shot_md",
    name: "중형 레이저 사격",
    type: "attack",
    apCost: 1,
    description: "적에게 8 피해",
    effects: [{ type: "damage", value: 8 }],
  },
  laser_shot_lg: {
    id: "laser_shot_lg",
    name: "대형 레이저 사격",
    type: "attack",
    apCost: 2,
    description: "적에게 12 피해",
    effects: [{ type: "damage", value: 12 }],
  },

  laser_overcharge_sm: {
    id: "laser_overcharge_sm",
    name: "소형 레이저 과충전",
    type: "attack",
    apCost: 2,
    description: "적에게 10 피해 + 화상 1 부여",
    effects: [
      { type: "damage", value: 10 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 1 },
    ],
  },
  laser_overcharge_md: {
    id: "laser_overcharge_md",
    name: "중형 레이저 과충전",
    type: "attack",
    apCost: 2,
    description: "적에게 15 피해 + 화상 2 부여",
    effects: [
      { type: "damage", value: 15 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 2 },
    ],
  },
  laser_overcharge_lg: {
    id: "laser_overcharge_lg",
    name: "대형 레이저 과충전",
    type: "attack",
    apCost: 3,
    description: "적에게 22 피해 + 화상 2 부여",
    effects: [
      { type: "damage", value: 22 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 2 },
    ],
  },

  laser_barrage_sm: {
    id: "laser_barrage_sm",
    name: "소형 레이저 연사",
    type: "attack",
    apCost: 2,
    description: "적에게 3 피해 3회",
    effects: [{ type: "multi_hit", value: 3, hitCount: 3 }],
  },
  laser_barrage_md: {
    id: "laser_barrage_md",
    name: "중형 레이저 연사",
    type: "attack",
    apCost: 2,
    description: "적에게 5 피해 3회",
    effects: [{ type: "multi_hit", value: 5, hitCount: 3 }],
  },
  laser_barrage_lg: {
    id: "laser_barrage_lg",
    name: "대형 레이저 연사",
    type: "attack",
    apCost: 3,
    description: "적에게 7 피해 4회",
    effects: [{ type: "multi_hit", value: 7, hitCount: 4 }],
  },

  laser_beam_sm: {
    id: "laser_beam_sm",
    name: "소형 레이저 빔",
    type: "attack",
    apCost: 2,
    description: "모든 적에게 8 피해",
    effects: [{ type: "damage_all", value: 8 }],
  },
  laser_beam_md: {
    id: "laser_beam_md",
    name: "중형 레이저 빔",
    type: "attack",
    apCost: 3,
    description: "모든 적에게 12 피해",
    effects: [{ type: "damage_all", value: 12 }],
  },
  laser_beam_lg: {
    id: "laser_beam_lg",
    name: "대형 레이저 빔",
    type: "attack",
    apCost: 3,
    description: "모든 적에게 18 피해",
    effects: [{ type: "damage_all", value: 18 }],
  },

  // ============================================================
  // 무기 — 레일건 (소형/중형/대형)
  // ============================================================

  railgun_shot_sm: {
    id: "railgun_shot_sm",
    name: "소형 레일건 사격",
    type: "attack",
    apCost: 2,
    description: "적에게 10 피해 + 장갑 파괴 1 부여",
    effects: [
      { type: "damage", value: 10 },
      { type: "apply_status", statusEffect: "armor_break", statusStacks: 1 },
    ],
  },
  railgun_shot_md: {
    id: "railgun_shot_md",
    name: "중형 레일건 사격",
    type: "attack",
    apCost: 2,
    description: "적에게 15 피해 + 장갑 파괴 1 부여",
    effects: [
      { type: "damage", value: 15 },
      { type: "apply_status", statusEffect: "armor_break", statusStacks: 1 },
    ],
  },
  railgun_shot_lg: {
    id: "railgun_shot_lg",
    name: "대형 레일건 사격",
    type: "attack",
    apCost: 3,
    description: "적에게 22 피해 + 장갑 파괴 2 부여",
    effects: [
      { type: "damage", value: 22 },
      { type: "apply_status", statusEffect: "armor_break", statusStacks: 2 },
    ],
  },

  railgun_pierce_sm: {
    id: "railgun_pierce_sm",
    name: "소형 레일건 관통",
    type: "attack",
    apCost: 2,
    description: "모든 적에게 8 피해",
    effects: [{ type: "damage_all", value: 8 }],
  },
  railgun_pierce_md: {
    id: "railgun_pierce_md",
    name: "중형 레일건 관통",
    type: "attack",
    apCost: 3,
    description: "모든 적에게 12 피해",
    effects: [{ type: "damage_all", value: 12 }],
  },
  railgun_pierce_lg: {
    id: "railgun_pierce_lg",
    name: "대형 레일건 관통",
    type: "attack",
    apCost: 3,
    description: "모든 적에게 18 피해",
    effects: [{ type: "damage_all", value: 18 }],
  },

  railgun_overload_sm: {
    id: "railgun_overload_sm",
    name: "소형 레일건 과부하",
    type: "attack",
    apCost: 3,
    description: "적에게 20 피해, 자신에게 3 피해",
    effects: [
      { type: "damage", value: 20 },
      { type: "self_damage", value: 3 },
    ],
  },
  railgun_overload_md: {
    id: "railgun_overload_md",
    name: "중형 레일건 과부하",
    type: "attack",
    apCost: 3,
    description: "적에게 30 피해, 자신에게 5 피해",
    effects: [
      { type: "damage", value: 30 },
      { type: "self_damage", value: 5 },
    ],
  },
  railgun_overload_lg: {
    id: "railgun_overload_lg",
    name: "대형 레일건 과부하",
    type: "attack",
    apCost: 4,
    description: "적에게 45 피해, 자신에게 8 피해",
    effects: [
      { type: "damage", value: 45 },
      { type: "self_damage", value: 8 },
    ],
  },

  // ============================================================
  // 무기 — 이온 캐논 (소형/중형/대형)
  // ============================================================

  ion_shot_sm: {
    id: "ion_shot_sm",
    name: "소형 이온 사격",
    type: "attack",
    apCost: 1,
    description: "적에게 4 피해 + 이온 1 부여",
    effects: [
      { type: "damage", value: 4 },
      { type: "apply_status", statusEffect: "ion", statusStacks: 1 },
    ],
  },
  ion_shot_md: {
    id: "ion_shot_md",
    name: "중형 이온 사격",
    type: "attack",
    apCost: 1,
    description: "적에게 6 피해 + 이온 2 부여",
    effects: [
      { type: "damage", value: 6 },
      { type: "apply_status", statusEffect: "ion", statusStacks: 2 },
    ],
  },
  ion_shot_lg: {
    id: "ion_shot_lg",
    name: "대형 이온 사격",
    type: "attack",
    apCost: 2,
    description: "적에게 9 피해 + 이온 3 부여",
    effects: [
      { type: "damage", value: 9 },
      { type: "apply_status", statusEffect: "ion", statusStacks: 3 },
    ],
  },

  ion_burst_sm: {
    id: "ion_burst_sm",
    name: "소형 이온 폭발",
    type: "attack",
    apCost: 2,
    description: "모든 적에게 3 피해 + 이온 1 부여",
    effects: [
      { type: "damage_all", value: 3 },
      { type: "apply_status", statusEffect: "ion", statusStacks: 1 },
    ],
  },
  ion_burst_md: {
    id: "ion_burst_md",
    name: "중형 이온 폭발",
    type: "attack",
    apCost: 2,
    description: "모든 적에게 5 피해 + 이온 2 부여",
    effects: [
      { type: "damage_all", value: 5 },
      { type: "apply_status", statusEffect: "ion", statusStacks: 2 },
    ],
  },
  ion_burst_lg: {
    id: "ion_burst_lg",
    name: "대형 이온 폭발",
    type: "attack",
    apCost: 3,
    description: "모든 적에게 8 피해 + 이온 3 부여",
    effects: [
      { type: "damage_all", value: 8 },
      { type: "apply_status", statusEffect: "ion", statusStacks: 3 },
    ],
  },

  ion_overload_sm: {
    id: "ion_overload_sm",
    name: "소형 이온 과부하",
    type: "attack",
    apCost: 2,
    description: "적에게 2 피해 + EMP 1 부여",
    effects: [
      { type: "damage", value: 2 },
      { type: "apply_status", statusEffect: "emp", statusStacks: 1 },
    ],
  },
  ion_overload_md: {
    id: "ion_overload_md",
    name: "중형 이온 과부하",
    type: "attack",
    apCost: 2,
    description: "적에게 4 피해 + EMP 1 부여",
    effects: [
      { type: "damage", value: 4 },
      { type: "apply_status", statusEffect: "emp", statusStacks: 1 },
    ],
  },
  ion_overload_lg: {
    id: "ion_overload_lg",
    name: "대형 이온 과부하",
    type: "attack",
    apCost: 3,
    description: "적에게 6 피해 + EMP 1 + 이온 2 부여",
    effects: [
      { type: "damage", value: 6 },
      { type: "apply_status", statusEffect: "emp", statusStacks: 1 },
      { type: "apply_status", statusEffect: "ion", statusStacks: 2 },
    ],
  },

  // ============================================================
  // 무기 — 플라즈마 건 (소형/중형/대형)
  // ============================================================

  plasma_shot_sm: {
    id: "plasma_shot_sm",
    name: "소형 플라즈마 사격",
    type: "attack",
    apCost: 1,
    description: "적에게 7 피해 + 화상 1 부여",
    effects: [
      { type: "damage", value: 7 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 1 },
    ],
  },
  plasma_shot_md: {
    id: "plasma_shot_md",
    name: "중형 플라즈마 사격",
    type: "attack",
    apCost: 2,
    description: "적에게 10 피해 + 화상 1 부여",
    effects: [
      { type: "damage", value: 10 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 1 },
    ],
  },
  plasma_shot_lg: {
    id: "plasma_shot_lg",
    name: "대형 플라즈마 사격",
    type: "attack",
    apCost: 2,
    description: "적에게 15 피해 + 화상 2 부여",
    effects: [
      { type: "damage", value: 15 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 2 },
    ],
  },

  plasma_nova_sm: {
    id: "plasma_nova_sm",
    name: "소형 플라즈마 노바",
    type: "attack",
    apCost: 2,
    description: "모든 적에게 5 피해 + 화상 1 부여",
    effects: [
      { type: "damage_all", value: 5 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 1 },
    ],
  },
  plasma_nova_md: {
    id: "plasma_nova_md",
    name: "중형 플라즈마 노바",
    type: "attack",
    apCost: 3,
    description: "모든 적에게 8 피해 + 화상 2 부여",
    effects: [
      { type: "damage_all", value: 8 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 2 },
    ],
  },
  plasma_nova_lg: {
    id: "plasma_nova_lg",
    name: "대형 플라즈마 노바",
    type: "attack",
    apCost: 3,
    description: "모든 적에게 12 피해 + 화상 3 부여",
    effects: [
      { type: "damage_all", value: 12 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 3 },
    ],
  },

  plasma_lance_sm: {
    id: "plasma_lance_sm",
    name: "소형 플라즈마 랜스",
    type: "attack",
    apCost: 2,
    description: "적에게 12 피해 + 화상 2 부여",
    effects: [
      { type: "damage", value: 12 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 2 },
    ],
  },
  plasma_lance_md: {
    id: "plasma_lance_md",
    name: "중형 플라즈마 랜스",
    type: "attack",
    apCost: 3,
    description: "적에게 18 피해 + 화상 3 부여",
    effects: [
      { type: "damage", value: 18 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 3 },
    ],
  },
  plasma_lance_lg: {
    id: "plasma_lance_lg",
    name: "대형 플라즈마 랜스",
    type: "attack",
    apCost: 3,
    description: "적에게 25 피해 + 화상 4 부여",
    effects: [
      { type: "damage", value: 25 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 4 },
    ],
  },

  // ============================================================
  // 무기 — 펄스 캐논 (소형/중형/대형)
  // ============================================================

  pulse_shot_sm: {
    id: "pulse_shot_sm",
    name: "소형 펄스 사격",
    type: "attack",
    apCost: 1,
    description: "적에게 3 피해 2회",
    effects: [{ type: "multi_hit", value: 3, hitCount: 2 }],
  },
  pulse_shot_md: {
    id: "pulse_shot_md",
    name: "중형 펄스 사격",
    type: "attack",
    apCost: 2,
    description: "적에게 4 피해 3회",
    effects: [{ type: "multi_hit", value: 4, hitCount: 3 }],
  },
  pulse_shot_lg: {
    id: "pulse_shot_lg",
    name: "대형 펄스 사격",
    type: "attack",
    apCost: 2,
    description: "적에게 5 피해 4회",
    effects: [{ type: "multi_hit", value: 5, hitCount: 4 }],
  },

  pulse_storm_sm: {
    id: "pulse_storm_sm",
    name: "소형 펄스 폭풍",
    type: "attack",
    apCost: 2,
    description: "적에게 2 피해 4회",
    effects: [{ type: "multi_hit", value: 2, hitCount: 4 }],
  },
  pulse_storm_md: {
    id: "pulse_storm_md",
    name: "중형 펄스 폭풍",
    type: "attack",
    apCost: 2,
    description: "적에게 3 피해 5회",
    effects: [{ type: "multi_hit", value: 3, hitCount: 5 }],
  },
  pulse_storm_lg: {
    id: "pulse_storm_lg",
    name: "대형 펄스 폭풍",
    type: "attack",
    apCost: 3,
    description: "적에게 4 피해 6회",
    effects: [{ type: "multi_hit", value: 4, hitCount: 6 }],
  },

  pulse_overcharge_sm: {
    id: "pulse_overcharge_sm",
    name: "소형 펄스 과충전",
    type: "attack",
    apCost: 2,
    description: "적에게 6 피해 2회 + 과부하 1 부여",
    effects: [
      { type: "multi_hit", value: 6, hitCount: 2 },
      { type: "apply_status", statusEffect: "overload", statusStacks: 1 },
    ],
  },
  pulse_overcharge_md: {
    id: "pulse_overcharge_md",
    name: "중형 펄스 과충전",
    type: "attack",
    apCost: 3,
    description: "적에게 8 피해 3회 + 과부하 1 부여",
    effects: [
      { type: "multi_hit", value: 8, hitCount: 3 },
      { type: "apply_status", statusEffect: "overload", statusStacks: 1 },
    ],
  },
  pulse_overcharge_lg: {
    id: "pulse_overcharge_lg",
    name: "대형 펄스 과충전",
    type: "attack",
    apCost: 3,
    description: "적에게 10 피해 4회 + 과부하 1 부여",
    effects: [
      { type: "multi_hit", value: 10, hitCount: 4 },
      { type: "apply_status", statusEffect: "overload", statusStacks: 1 },
    ],
  },

  // ============================================================
  // 무기 — 미사일 (소형/중형/대형)
  // ============================================================

  missile_sm: {
    id: "missile_sm",
    name: "소형 미사일 발사",
    type: "attack",
    apCost: 1,
    description: "모든 적에게 3 피해 + 화상 1 부여",
    effects: [
      { type: "damage_all", value: 3 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 1 },
    ],
  },
  missile_md: {
    id: "missile_md",
    name: "중형 미사일 발사",
    type: "attack",
    apCost: 2,
    description: "모든 적에게 5 피해 + 화상 1 부여",
    effects: [
      { type: "damage_all", value: 5 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 1 },
    ],
  },
  missile_lg: {
    id: "missile_lg",
    name: "대형 미사일 발사",
    type: "attack",
    apCost: 2,
    description: "모든 적에게 8 피해 + 화상 2 부여",
    effects: [
      { type: "damage_all", value: 8 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 2 },
    ],
  },

  missile_swarm_sm: {
    id: "missile_swarm_sm",
    name: "소형 미사일 집중사격",
    type: "attack",
    apCost: 2,
    description: "적에게 2 피해 4회",
    effects: [{ type: "multi_hit", value: 2, hitCount: 4 }],
  },
  missile_swarm_md: {
    id: "missile_swarm_md",
    name: "중형 미사일 집중사격",
    type: "attack",
    apCost: 2,
    description: "적에게 3 피해 5회",
    effects: [{ type: "multi_hit", value: 3, hitCount: 5 }],
  },
  missile_swarm_lg: {
    id: "missile_swarm_lg",
    name: "대형 미사일 집중사격",
    type: "attack",
    apCost: 3,
    description: "적에게 4 피해 6회",
    effects: [{ type: "multi_hit", value: 4, hitCount: 6 }],
  },

  missile_heavy_sm: {
    id: "missile_heavy_sm",
    name: "소형 중미사일",
    type: "attack",
    apCost: 2,
    description: "적에게 12 피해 + 화상 2 부여",
    effects: [
      { type: "damage", value: 12 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 2 },
    ],
  },
  missile_heavy_md: {
    id: "missile_heavy_md",
    name: "중형 중미사일",
    type: "attack",
    apCost: 3,
    description: "적에게 18 피해 + 화상 3 부여",
    effects: [
      { type: "damage", value: 18 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 3 },
    ],
  },
  missile_heavy_lg: {
    id: "missile_heavy_lg",
    name: "대형 중미사일",
    type: "attack",
    apCost: 3,
    description: "적에게 25 피해 + 화상 4 부여",
    effects: [
      { type: "damage", value: 25 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 4 },
    ],
  },

  // ============================================================
  // 드론 베이 카드
  // ============================================================

  drone_repair: {
    id: "drone_repair",
    name: "수리 드론",
    type: "skill",
    apCost: 1,
    description: "HP 5 회복",
    effects: [{ type: "heal", value: 5 }],
  },
  drone_repair_adv: {
    id: "drone_repair_adv",
    name: "고급 수리 드론",
    type: "skill",
    apCost: 2,
    description: "HP 10 회복",
    effects: [{ type: "heal", value: 10 }],
  },
  drone_repair_elite: {
    id: "drone_repair_elite",
    name: "정밀 수리 드론",
    type: "skill",
    apCost: 2,
    description: "HP 15 회복 + 수리 2 부여",
    effects: [
      { type: "heal", value: 15 },
      { type: "apply_status", statusEffect: "repair", statusStacks: 2 },
    ],
  },
  drone_repair_legendary: {
    id: "drone_repair_legendary",
    name: "나노봇 수리 드론",
    type: "skill",
    apCost: 2,
    description: "HP 20 회복 + 수리 3 부여",
    effects: [
      { type: "heal", value: 20 },
      { type: "apply_status", statusEffect: "repair", statusStacks: 3 },
    ],
  },

  drone_salvage: {
    id: "drone_salvage",
    name: "고철 수거 드론",
    type: "skill",
    apCost: 1,
    description: "고철 5 수거",
    effects: [{ type: "salvage", value: 5 }],
  },
  drone_salvage_adv: {
    id: "drone_salvage_adv",
    name: "고급 수거 드론",
    type: "skill",
    apCost: 1,
    description: "고철 10 수거",
    effects: [{ type: "salvage", value: 10 }],
  },
  drone_salvage_elite: {
    id: "drone_salvage_elite",
    name: "정밀 수거 드론",
    type: "skill",
    apCost: 1,
    description: "고철 15 수거",
    effects: [{ type: "salvage", value: 15 }],
  },
  drone_salvage_legendary: {
    id: "drone_salvage_legendary",
    name: "양자 수거 드론",
    type: "skill",
    apCost: 1,
    description: "고철 25 수거",
    effects: [{ type: "salvage", value: 25 }],
  },

  drone_beam: {
    id: "drone_beam",
    name: "빔 공격 드론",
    type: "attack",
    apCost: 1,
    description: "적에게 6 피해",
    effects: [{ type: "damage", value: 6 }],
  },
  drone_beam_adv: {
    id: "drone_beam_adv",
    name: "고급 빔 드론",
    type: "attack",
    apCost: 1,
    description: "적에게 10 피해",
    effects: [{ type: "damage", value: 10 }],
  },
  drone_beam_elite: {
    id: "drone_beam_elite",
    name: "정밀 빔 드론",
    type: "attack",
    apCost: 2,
    description: "적에게 14 피해 + 화상 1 부여",
    effects: [
      { type: "damage", value: 14 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 1 },
    ],
  },
  drone_beam_legendary: {
    id: "drone_beam_legendary",
    name: "양자 빔 드론",
    type: "attack",
    apCost: 2,
    description: "적에게 18 피해 + 화상 2 부여",
    effects: [
      { type: "damage", value: 18 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 2 },
    ],
  },

  drone_missile: {
    id: "drone_missile",
    name: "미사일 드론",
    type: "attack",
    apCost: 2,
    description: "모든 적에게 4 피해",
    effects: [{ type: "damage_all", value: 4 }],
  },
  drone_missile_adv: {
    id: "drone_missile_adv",
    name: "고급 미사일 드론",
    type: "attack",
    apCost: 2,
    description: "모든 적에게 6 피해",
    effects: [{ type: "damage_all", value: 6 }],
  },
  drone_missile_elite: {
    id: "drone_missile_elite",
    name: "정밀 미사일 드론",
    type: "attack",
    apCost: 2,
    description: "모든 적에게 8 피해 + 화상 1 부여",
    effects: [
      { type: "damage_all", value: 8 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 1 },
    ],
  },
  drone_missile_legendary: {
    id: "drone_missile_legendary",
    name: "양자 미사일 드론",
    type: "attack",
    apCost: 2,
    description: "모든 적에게 12 피해 + 화상 2 부여",
    effects: [
      { type: "damage_all", value: 12 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 2 },
    ],
  },

  drone_kamikaze: {
    id: "drone_kamikaze",
    name: "자폭 드론",
    type: "attack",
    apCost: 1,
    description: "적에게 15 피해, 자신에게 5 피해",
    effects: [
      { type: "damage", value: 15 },
      { type: "self_damage", value: 5 },
    ],
  },
  drone_kamikaze_adv: {
    id: "drone_kamikaze_adv",
    name: "고급 자폭 드론",
    type: "attack",
    apCost: 1,
    description: "적에게 22 피해, 자신에게 5 피해",
    effects: [
      { type: "damage", value: 22 },
      { type: "self_damage", value: 5 },
    ],
  },
  drone_kamikaze_elite: {
    id: "drone_kamikaze_elite",
    name: "정밀 자폭 드론",
    type: "attack",
    apCost: 2,
    description: "적에게 30 피해, 자신에게 3 피해",
    effects: [
      { type: "damage", value: 30 },
      { type: "self_damage", value: 3 },
    ],
  },
  drone_kamikaze_legendary: {
    id: "drone_kamikaze_legendary",
    name: "양자 자폭 드론",
    type: "attack",
    apCost: 2,
    description: "적에게 40 피해, 자신에게 2 피해",
    effects: [
      { type: "damage", value: 40 },
      { type: "self_damage", value: 2 },
    ],
  },

  // ============================================================
  // 전자전 카드
  // ============================================================

  ecm_scramble: {
    id: "ecm_scramble",
    name: "ECM 교란",
    type: "skill",
    apCost: 1,
    description: "적에게 교란 1 부여",
    effects: [
      { type: "apply_status", statusEffect: "scramble", statusStacks: 1 },
    ],
  },
  ecm_scramble_adv: {
    id: "ecm_scramble_adv",
    name: "고급 ECM 교란",
    type: "skill",
    apCost: 1,
    description: "적에게 교란 2 부여",
    effects: [
      { type: "apply_status", statusEffect: "scramble", statusStacks: 2 },
    ],
  },
  ecm_scramble_elite: {
    id: "ecm_scramble_elite",
    name: "정밀 ECM 교란",
    type: "skill",
    apCost: 2,
    description: "적에게 교란 2 부여 + 블록 5 획득",
    effects: [
      { type: "apply_status", statusEffect: "scramble", statusStacks: 2 },
      { type: "block", value: 5 },
    ],
  },
  ecm_scramble_legendary: {
    id: "ecm_scramble_legendary",
    name: "양자 ECM 교란",
    type: "skill",
    apCost: 2,
    description: "적에게 교란 3 부여 + 블록 8 획득",
    effects: [
      { type: "apply_status", statusEffect: "scramble", statusStacks: 3 },
      { type: "block", value: 8 },
    ],
  },

  sensor_jam: {
    id: "sensor_jam",
    name: "센서 교란",
    type: "skill",
    apCost: 1,
    description: "적에게 센서 교란 1 부여",
    effects: [
      { type: "apply_status", statusEffect: "sensor_jam", statusStacks: 1 },
    ],
  },
  sensor_jam_adv: {
    id: "sensor_jam_adv",
    name: "고급 센서 교란",
    type: "skill",
    apCost: 1,
    description: "적에게 센서 교란 1 부여 + 회피 1턴",
    effects: [
      { type: "apply_status", statusEffect: "sensor_jam", statusStacks: 1 },
      { type: "evade", duration: 1 },
    ],
  },
  sensor_jam_elite: {
    id: "sensor_jam_elite",
    name: "정밀 센서 교란",
    type: "skill",
    apCost: 2,
    description: "센서 교란 1 + 회피 1턴 + 블록 5",
    effects: [
      { type: "apply_status", statusEffect: "sensor_jam", statusStacks: 1 },
      { type: "evade", duration: 1 },
      { type: "block", value: 5 },
    ],
  },
  sensor_jam_legendary: {
    id: "sensor_jam_legendary",
    name: "양자 센서 교란",
    type: "skill",
    apCost: 2,
    description: "센서 교란 1 + 회피 2턴 + 블록 8",
    effects: [
      { type: "apply_status", statusEffect: "sensor_jam", statusStacks: 1 },
      { type: "evade", duration: 2 },
      { type: "block", value: 8 },
    ],
  },

  hack_system: {
    id: "hack_system",
    name: "시스템 해킹",
    type: "skill",
    apCost: 2,
    description: "적에게 EMP 1 부여",
    effects: [
      { type: "apply_status", statusEffect: "emp", statusStacks: 1 },
    ],
  },
  hack_system_adv: {
    id: "hack_system_adv",
    name: "고급 시스템 해킹",
    type: "skill",
    apCost: 2,
    description: "적에게 EMP 1 + 이온 2 부여",
    effects: [
      { type: "apply_status", statusEffect: "emp", statusStacks: 1 },
      { type: "apply_status", statusEffect: "ion", statusStacks: 2 },
    ],
  },
  hack_system_elite: {
    id: "hack_system_elite",
    name: "정밀 시스템 해킹",
    type: "skill",
    apCost: 2,
    description: "적에게 EMP 1 + 교란 2 부여",
    effects: [
      { type: "apply_status", statusEffect: "emp", statusStacks: 1 },
      { type: "apply_status", statusEffect: "scramble", statusStacks: 2 },
    ],
  },
  hack_system_legendary: {
    id: "hack_system_legendary",
    name: "양자 시스템 해킹",
    type: "attack",
    apCost: 2,
    description: "적에게 8 피해 + EMP 1 + 교란 2 부여",
    effects: [
      { type: "damage", value: 8 },
      { type: "apply_status", statusEffect: "emp", statusStacks: 1 },
      { type: "apply_status", statusEffect: "scramble", statusStacks: 2 },
    ],
  },

  // ============================================================
  // 격납고 카드
  // ============================================================

  fighter_launch: {
    id: "fighter_launch",
    name: "전투기 출격",
    type: "attack",
    apCost: 1,
    description: "적에게 8 피해",
    effects: [{ type: "damage", value: 8 }],
  },
  fighter_launch_adv: {
    id: "fighter_launch_adv",
    name: "고급 전투기 출격",
    type: "attack",
    apCost: 1,
    description: "적에게 12 피해",
    effects: [{ type: "damage", value: 12 }],
  },
  fighter_launch_elite: {
    id: "fighter_launch_elite",
    name: "정예 전투기 출격",
    type: "attack",
    apCost: 2,
    description: "적에게 16 피해",
    effects: [{ type: "damage", value: 16 }],
  },
  fighter_launch_legendary: {
    id: "fighter_launch_legendary",
    name: "에이스 전투기 출격",
    type: "attack",
    apCost: 2,
    description: "적에게 22 피해",
    effects: [{ type: "damage", value: 22 }],
  },

  fighter_escort: {
    id: "fighter_escort",
    name: "전투기 호위",
    type: "defense",
    apCost: 1,
    description: "블록 6 획득 + 회피 1턴",
    effects: [
      { type: "block", value: 6 },
      { type: "evade", duration: 1 },
    ],
  },
  fighter_escort_adv: {
    id: "fighter_escort_adv",
    name: "고급 전투기 호위",
    type: "defense",
    apCost: 2,
    description: "블록 10 획득 + 회피 1턴",
    effects: [
      { type: "block", value: 10 },
      { type: "evade", duration: 1 },
    ],
  },

  bomber_run: {
    id: "bomber_run",
    name: "폭격기 출격",
    type: "attack",
    apCost: 2,
    description: "모든 적에게 6 피해",
    effects: [{ type: "damage_all", value: 6 }],
  },
  bomber_run_adv: {
    id: "bomber_run_adv",
    name: "고급 폭격기 출격",
    type: "attack",
    apCost: 2,
    description: "모든 적에게 9 피해",
    effects: [{ type: "damage_all", value: 9 }],
  },
  bomber_run_elite: {
    id: "bomber_run_elite",
    name: "정예 폭격기 출격",
    type: "attack",
    apCost: 3,
    description: "모든 적에게 12 피해 + 화상 1 부여",
    effects: [
      { type: "damage_all", value: 12 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 1 },
    ],
  },
  bomber_run_legendary: {
    id: "bomber_run_legendary",
    name: "전략 폭격기 출격",
    type: "attack",
    apCost: 3,
    description: "모든 적에게 16 피해 + 화상 2 부여",
    effects: [
      { type: "damage_all", value: 16 },
      { type: "apply_status", statusEffect: "burn", statusStacks: 2 },
    ],
  },

  eva_repair: {
    id: "eva_repair",
    name: "EVA 외부 수리",
    type: "skill",
    apCost: 1,
    description: "HP 8 회복",
    effects: [{ type: "heal", value: 8 }],
  },
  eva_repair_adv: {
    id: "eva_repair_adv",
    name: "고급 EVA 수리",
    type: "skill",
    apCost: 1,
    description: "HP 12 회복 + 수리 1 부여",
    effects: [
      { type: "heal", value: 12 },
      { type: "apply_status", statusEffect: "repair", statusStacks: 1 },
    ],
  },
  eva_repair_elite: {
    id: "eva_repair_elite",
    name: "정밀 EVA 수리",
    type: "skill",
    apCost: 2,
    description: "HP 16 회복 + 수리 2 부여",
    effects: [
      { type: "heal", value: 16 },
      { type: "apply_status", statusEffect: "repair", statusStacks: 2 },
    ],
  },
  eva_repair_legendary: {
    id: "eva_repair_legendary",
    name: "양자 EVA 수리",
    type: "skill",
    apCost: 2,
    description: "HP 22 회복 + 수리 3 부여",
    effects: [
      { type: "heal", value: 22 },
      { type: "apply_status", statusEffect: "repair", statusStacks: 3 },
    ],
  },

  eva_salvage: {
    id: "eva_salvage",
    name: "EVA 수거 작업",
    type: "skill",
    apCost: 1,
    description: "고철 8 수거",
    effects: [{ type: "salvage", value: 8 }],
  },
  eva_salvage_adv: {
    id: "eva_salvage_adv",
    name: "고급 EVA 수거",
    type: "skill",
    apCost: 1,
    description: "고철 15 수거",
    effects: [{ type: "salvage", value: 15 }],
  },

  // ============================================================
  // 방어 카드 — 강화 버전
  // ============================================================

  energy_shield_adv: {
    id: "energy_shield_adv",
    name: "강화 에너지 실드",
    type: "defense",
    apCost: 1,
    description: "블록 12 획득",
    effects: [{ type: "block", value: 12 }],
  },
  energy_shield_elite: {
    id: "energy_shield_elite",
    name: "고급 에너지 실드",
    type: "defense",
    apCost: 2,
    description: "블록 16 획득 + 피해 감소 1턴",
    effects: [
      { type: "block", value: 16 },
      { type: "damage_reduction", value: 1, duration: 1 },
    ],
  },
  energy_shield_legendary: {
    id: "energy_shield_legendary",
    name: "양자 에너지 실드",
    type: "defense",
    apCost: 2,
    description: "블록 22 획득 + 피해 감소 2 (1턴)",
    effects: [
      { type: "block", value: 22 },
      { type: "damage_reduction", value: 2, duration: 1 },
    ],
  },

  reinforced_hull_adv: {
    id: "reinforced_hull_adv",
    name: "중장갑 선체",
    type: "defense",
    apCost: 2,
    description: "블록 20 획득 + 피해 감소 1 (2턴)",
    effects: [
      { type: "block", value: 20 },
      { type: "damage_reduction", value: 1, duration: 2 },
    ],
  },
  reinforced_hull_elite: {
    id: "reinforced_hull_elite",
    name: "초중장갑 선체",
    type: "defense",
    apCost: 3,
    description: "블록 28 획득 + 피해 감소 2 (2턴)",
    effects: [
      { type: "block", value: 28 },
      { type: "damage_reduction", value: 2, duration: 2 },
    ],
  },

  reflect_shield_adv: {
    id: "reflect_shield_adv",
    name: "고급 반사 실드",
    type: "defense",
    apCost: 2,
    description: "블록 10 + 피해 반사",
    effects: [
      { type: "block", value: 10 },
      { type: "damage_reflect" },
    ],
  },
  reflect_shield_elite: {
    id: "reflect_shield_elite",
    name: "정밀 반사 실드",
    type: "defense",
    apCost: 3,
    description: "블록 16 + 피해 반사",
    effects: [
      { type: "block", value: 16 },
      { type: "damage_reflect" },
    ],
  },

  // ============================================================
  // 엔진 카드 — 강화 버전
  // ============================================================

  emergency_evade_adv: {
    id: "emergency_evade_adv",
    name: "고급 긴급 회피",
    type: "skill",
    apCost: 1,
    description: "2턴 동안 공격 회피",
    effects: [{ type: "evade", duration: 2 }],
  },
  emergency_evade_elite: {
    id: "emergency_evade_elite",
    name: "정밀 긴급 회피",
    type: "skill",
    apCost: 2,
    description: "2턴 회피 + 블록 5 획득",
    effects: [
      { type: "evade", duration: 2 },
      { type: "block", value: 5 },
    ],
  },

  phase_shift_adv: {
    id: "phase_shift_adv",
    name: "고급 위상 이동",
    type: "skill",
    apCost: 3,
    description: "4턴 동안 모든 공격 회피",
    effects: [{ type: "evade", duration: 4 }],
  },

  // ============================================================
  // 지원 카드 — 강화 버전
  // ============================================================

  morale_boost_adv: {
    id: "morale_boost_adv",
    name: "고급 사기 진작",
    type: "skill",
    apCost: 0,
    description: "다음 카드 AP 비용 –2",
    effects: [{ type: "reduce_ap", value: 2 }],
  },

  first_aid_adv: {
    id: "first_aid_adv",
    name: "고급 응급 처치",
    type: "skill",
    apCost: 1,
    description: "HP 10 회복",
    effects: [{ type: "heal", value: 10 }],
  },
  first_aid_elite: {
    id: "first_aid_elite",
    name: "정밀 응급 처치",
    type: "skill",
    apCost: 2,
    description: "HP 15 회복 + 수리 1 부여",
    effects: [
      { type: "heal", value: 15 },
      { type: "apply_status", statusEffect: "repair", statusStacks: 1 },
    ],
  },

  life_support_adv: {
    id: "life_support_adv",
    name: "고급 생명 유지",
    type: "passive",
    apCost: 0,
    description: "매 턴 시작 HP +3",
    effects: [{ type: "passive_heal", value: 3 }],
  },
  life_support_elite: {
    id: "life_support_elite",
    name: "정밀 생명 유지",
    type: "passive",
    apCost: 0,
    description: "매 턴 시작 HP +5",
    effects: [{ type: "passive_heal", value: 5 }],
  },

  // ============================================================
  // 개조 카드
  // ============================================================

  mod_rapid_fire: {
    id: "mod_rapid_fire",
    name: "속사형 개조",
    type: "skill",
    apCost: 0,
    description: "다음 공격의 타격 횟수 +2",
    effects: [{ type: "boost_multi_hit", value: 2 }],
  },
  mod_power: {
    id: "mod_power",
    name: "위력형 개조",
    type: "skill",
    apCost: 0,
    description: "다음 공격의 피해량 +5",
    effects: [{ type: "boost_damage", value: 5 }],
  },
  mod_ew: {
    id: "mod_ew",
    name: "전자전 개조",
    type: "skill",
    apCost: 0,
    description: "적에게 교란 1 부여",
    effects: [
      { type: "apply_status", statusEffect: "scramble", statusStacks: 1 },
    ],
  },
  mod_precision: {
    id: "mod_precision",
    name: "정밀 개조",
    type: "attack",
    apCost: 1,
    description: "적에게 8 피해",
    effects: [{ type: "damage", value: 8 }],
  },
  mod_aoe: {
    id: "mod_aoe",
    name: "광역 개조",
    type: "attack",
    apCost: 1,
    description: "모든 적에게 5 피해",
    effects: [{ type: "damage_all", value: 5 }],
  },
  mod_incendiary: {
    id: "mod_incendiary",
    name: "연소 개조",
    type: "skill",
    apCost: 0,
    description: "적에게 화상 2 부여",
    effects: [
      { type: "apply_status", statusEffect: "burn", statusStacks: 2 },
    ],
  },
  mod_ion: {
    id: "mod_ion",
    name: "이온 개조",
    type: "skill",
    apCost: 0,
    description: "적에게 이온 2 부여",
    effects: [
      { type: "apply_status", statusEffect: "ion", statusStacks: 2 },
    ],
  },
  mod_armor_break: {
    id: "mod_armor_break",
    name: "장갑 파괴 개조",
    type: "skill",
    apCost: 0,
    description: "적에게 장갑 파괴 2 부여",
    effects: [
      { type: "apply_status", statusEffect: "armor_break", statusStacks: 2 },
    ],
  },
  mod_overload: {
    id: "mod_overload",
    name: "과부하 개조",
    type: "skill",
    apCost: 1,
    description: "다음 공격의 피해량 +10, 자신에게 3 피해",
    effects: [
      { type: "boost_damage", value: 10 },
      { type: "self_damage", value: 3 },
    ],
  },
  mod_shield_boost: {
    id: "mod_shield_boost",
    name: "방어 강화 개조",
    type: "skill",
    apCost: 0,
    description: "블록 10 획득",
    effects: [{ type: "block", value: 10 }],
  },

  // ============================================================
  // 장갑 카드
  // ============================================================

  armor_plate_sm: {
    id: "armor_plate_sm",
    name: "소형 장갑판",
    type: "defense",
    apCost: 1,
    description: "블록 6 획득",
    effects: [{ type: "block", value: 6 }],
  },
  armor_plate_md: {
    id: "armor_plate_md",
    name: "중형 장갑판",
    type: "defense",
    apCost: 1,
    description: "블록 10 획득",
    effects: [{ type: "block", value: 10 }],
  },
  armor_plate_lg: {
    id: "armor_plate_lg",
    name: "대형 장갑판",
    type: "defense",
    apCost: 2,
    description: "블록 15 획득",
    effects: [{ type: "block", value: 15 }],
  },

  armor_reinforce_sm: {
    id: "armor_reinforce_sm",
    name: "소형 보강 장갑",
    type: "defense",
    apCost: 2,
    description: "블록 8 획득 + 피해 감소 1 (1턴)",
    effects: [
      { type: "block", value: 8 },
      { type: "damage_reduction", value: 1, duration: 1 },
    ],
  },
  armor_reinforce_md: {
    id: "armor_reinforce_md",
    name: "중형 보강 장갑",
    type: "defense",
    apCost: 2,
    description: "블록 12 획득 + 피해 감소 1 (2턴)",
    effects: [
      { type: "block", value: 12 },
      { type: "damage_reduction", value: 1, duration: 2 },
    ],
  },
  armor_reinforce_lg: {
    id: "armor_reinforce_lg",
    name: "대형 보강 장갑",
    type: "defense",
    apCost: 3,
    description: "블록 18 획득 + 피해 감소 2 (2턴)",
    effects: [
      { type: "block", value: 18 },
      { type: "damage_reduction", value: 2, duration: 2 },
    ],
  },

  armor_reactive_sm: {
    id: "armor_reactive_sm",
    name: "소형 반응 장갑",
    type: "defense",
    apCost: 2,
    description: "블록 6 + 피해 반사",
    effects: [
      { type: "block", value: 6 },
      { type: "damage_reflect" },
    ],
  },
  armor_reactive_md: {
    id: "armor_reactive_md",
    name: "중형 반응 장갑",
    type: "defense",
    apCost: 2,
    description: "블록 10 + 피해 반사",
    effects: [
      { type: "block", value: 10 },
      { type: "damage_reflect" },
    ],
  },
  armor_reactive_lg: {
    id: "armor_reactive_lg",
    name: "대형 반응 장갑",
    type: "defense",
    apCost: 3,
    description: "블록 15 + 피해 반사",
    effects: [
      { type: "block", value: 15 },
      { type: "damage_reflect" },
    ],
  },

  armor_nanite_sm: {
    id: "armor_nanite_sm",
    name: "소형 나노 장갑",
    type: "defense",
    apCost: 2,
    description: "블록 8 획득 + HP 5 회복",
    effects: [
      { type: "block", value: 8 },
      { type: "heal", value: 5 },
    ],
  },
  armor_nanite_md: {
    id: "armor_nanite_md",
    name: "중형 나노 장갑",
    type: "defense",
    apCost: 2,
    description: "블록 12 획득 + HP 8 회복",
    effects: [
      { type: "block", value: 12 },
      { type: "heal", value: 8 },
    ],
  },
  armor_nanite_lg: {
    id: "armor_nanite_lg",
    name: "대형 나노 장갑",
    type: "defense",
    apCost: 3,
    description: "블록 18 획득 + HP 12 회복",
    effects: [
      { type: "block", value: 18 },
      { type: "heal", value: 12 },
    ],
  },

  // ============================================================
  // 배리어 카드
  // ============================================================

  barrier_sm: {
    id: "barrier_sm",
    name: "소형 에너지 배리어",
    type: "defense",
    apCost: 1,
    description: "블록 7 획득",
    effects: [{ type: "block", value: 7 }],
  },
  barrier_md: {
    id: "barrier_md",
    name: "중형 에너지 배리어",
    type: "defense",
    apCost: 1,
    description: "블록 11 획득",
    effects: [{ type: "block", value: 11 }],
  },
  barrier_lg: {
    id: "barrier_lg",
    name: "대형 에너지 배리어",
    type: "defense",
    apCost: 2,
    description: "블록 16 획득",
    effects: [{ type: "block", value: 16 }],
  },

  barrier_overcharge_sm: {
    id: "barrier_overcharge_sm",
    name: "소형 과충전 배리어",
    type: "defense",
    apCost: 2,
    description: "블록 10 획득 + 회피 1턴",
    effects: [
      { type: "block", value: 10 },
      { type: "evade", duration: 1 },
    ],
  },
  barrier_overcharge_md: {
    id: "barrier_overcharge_md",
    name: "중형 과충전 배리어",
    type: "defense",
    apCost: 2,
    description: "블록 14 획득 + 회피 1턴",
    effects: [
      { type: "block", value: 14 },
      { type: "evade", duration: 1 },
    ],
  },
  barrier_overcharge_lg: {
    id: "barrier_overcharge_lg",
    name: "대형 과충전 배리어",
    type: "defense",
    apCost: 3,
    description: "블록 20 획득 + 회피 1턴",
    effects: [
      { type: "block", value: 20 },
      { type: "evade", duration: 1 },
    ],
  },

  barrier_fortress_sm: {
    id: "barrier_fortress_sm",
    name: "소형 요새 배리어",
    type: "defense",
    apCost: 2,
    description: "블록 12 획득 + 피해 감소 1 (1턴)",
    effects: [
      { type: "block", value: 12 },
      { type: "damage_reduction", value: 1, duration: 1 },
    ],
  },
  barrier_fortress_md: {
    id: "barrier_fortress_md",
    name: "중형 요새 배리어",
    type: "defense",
    apCost: 2,
    description: "블록 16 획득 + 피해 감소 2 (1턴)",
    effects: [
      { type: "block", value: 16 },
      { type: "damage_reduction", value: 2, duration: 1 },
    ],
  },
  barrier_fortress_lg: {
    id: "barrier_fortress_lg",
    name: "대형 요새 배리어",
    type: "defense",
    apCost: 3,
    description: "블록 22 획득 + 피해 감소 2 (2턴)",
    effects: [
      { type: "block", value: 22 },
      { type: "damage_reduction", value: 2, duration: 2 },
    ],
  },

  barrier_absorption_sm: {
    id: "barrier_absorption_sm",
    name: "소형 흡수 배리어",
    type: "defense",
    apCost: 2,
    description: "블록 8 획득 + HP 4 회복",
    effects: [
      { type: "block", value: 8 },
      { type: "heal", value: 4 },
    ],
  },
  barrier_absorption_md: {
    id: "barrier_absorption_md",
    name: "중형 흡수 배리어",
    type: "defense",
    apCost: 2,
    description: "블록 12 획득 + HP 6 회복",
    effects: [
      { type: "block", value: 12 },
      { type: "heal", value: 6 },
    ],
  },
  barrier_absorption_lg: {
    id: "barrier_absorption_lg",
    name: "대형 흡수 배리어",
    type: "defense",
    apCost: 3,
    description: "블록 16 획득 + HP 10 회복",
    effects: [
      { type: "block", value: 16 },
      { type: "heal", value: 10 },
    ],
  },

  // ============================================================
  // 제너레이터 카드
  // ============================================================

  power_cell_sm: {
    id: "power_cell_sm",
    name: "소형 파워 셀",
    type: "skill",
    apCost: 0,
    description: "AP 1 회복",
    effects: [{ type: "restore_ap", value: 1 }],
  },
  power_cell_md: {
    id: "power_cell_md",
    name: "중형 파워 셀",
    type: "skill",
    apCost: 0,
    description: "AP 2 회복",
    effects: [{ type: "restore_ap", value: 2 }],
  },
  power_cell_lg: {
    id: "power_cell_lg",
    name: "대형 파워 셀",
    type: "skill",
    apCost: 0,
    description: "AP 3 회복",
    effects: [{ type: "restore_ap", value: 3 }],
  },

  reactor_boost_sm: {
    id: "reactor_boost_sm",
    name: "소형 리액터 부스트",
    type: "skill",
    apCost: 0,
    description: "AP 1 회복 + 블록 5 획득",
    effects: [
      { type: "restore_ap", value: 1 },
      { type: "block", value: 5 },
    ],
  },
  reactor_boost_md: {
    id: "reactor_boost_md",
    name: "중형 리액터 부스트",
    type: "skill",
    apCost: 0,
    description: "AP 2 회복 + 블록 5 획득",
    effects: [
      { type: "restore_ap", value: 2 },
      { type: "block", value: 5 },
    ],
  },
  reactor_boost_lg: {
    id: "reactor_boost_lg",
    name: "대형 리액터 부스트",
    type: "skill",
    apCost: 0,
    description: "AP 2 회복 + 블록 8 획득",
    effects: [
      { type: "restore_ap", value: 2 },
      { type: "block", value: 8 },
    ],
  },

  emergency_power_sm: {
    id: "emergency_power_sm",
    name: "소형 비상 전력",
    type: "skill",
    apCost: 0,
    description: "AP 2 회복, 자신에게 3 피해",
    effects: [
      { type: "restore_ap", value: 2 },
      { type: "self_damage", value: 3 },
    ],
  },
  emergency_power_md: {
    id: "emergency_power_md",
    name: "중형 비상 전력",
    type: "skill",
    apCost: 0,
    description: "AP 3 회복, 자신에게 4 피해",
    effects: [
      { type: "restore_ap", value: 3 },
      { type: "self_damage", value: 4 },
    ],
  },
  emergency_power_lg: {
    id: "emergency_power_lg",
    name: "대형 비상 전력",
    type: "skill",
    apCost: 0,
    description: "AP 4 회복, 자신에게 5 피해",
    effects: [
      { type: "restore_ap", value: 4 },
      { type: "self_damage", value: 5 },
    ],
  },

  capacitor_sm: {
    id: "capacitor_sm",
    name: "소형 커패시터",
    type: "skill",
    apCost: 0,
    description: "AP 1 회복 + 카드 1장 드로우",
    effects: [
      { type: "restore_ap", value: 1 },
      { type: "draw_card", value: 1 },
    ],
  },
  capacitor_md: {
    id: "capacitor_md",
    name: "중형 커패시터",
    type: "skill",
    apCost: 0,
    description: "AP 1 회복 + 카드 2장 드로우",
    effects: [
      { type: "restore_ap", value: 1 },
      { type: "draw_card", value: 2 },
    ],
  },
  capacitor_lg: {
    id: "capacitor_lg",
    name: "대형 커패시터",
    type: "skill",
    apCost: 0,
    description: "AP 2 회복 + 카드 2장 드로우",
    effects: [
      { type: "restore_ap", value: 2 },
      { type: "draw_card", value: 2 },
    ],
  },

  // ============================================================
  // 전자전 유틸리티 카드
  // ============================================================

  tactical_scan_sm: {
    id: "tactical_scan_sm",
    name: "소형 전술 스캔",
    type: "skill",
    apCost: 1,
    description: "카드 1장 드로우",
    effects: [{ type: "draw_card", value: 1 }],
  },
  tactical_scan_md: {
    id: "tactical_scan_md",
    name: "중형 전술 스캔",
    type: "skill",
    apCost: 1,
    description: "카드 2장 드로우",
    effects: [{ type: "draw_card", value: 2 }],
  },
  tactical_scan_lg: {
    id: "tactical_scan_lg",
    name: "대형 전술 스캔",
    type: "skill",
    apCost: 2,
    description: "카드 3장 드로우",
    effects: [{ type: "draw_card", value: 3 }],
  },

  signal_intel_sm: {
    id: "signal_intel_sm",
    name: "소형 신호 정보",
    type: "skill",
    apCost: 1,
    description: "카드 1장 드로우 + 적에게 센서 교란 1 부여",
    effects: [
      { type: "draw_card", value: 1 },
      { type: "apply_status", statusEffect: "sensor_jam", statusStacks: 1 },
    ],
  },
  signal_intel_md: {
    id: "signal_intel_md",
    name: "중형 신호 정보",
    type: "skill",
    apCost: 1,
    description: "카드 2장 드로우 + 적에게 교란 1 부여",
    effects: [
      { type: "draw_card", value: 2 },
      { type: "apply_status", statusEffect: "scramble", statusStacks: 1 },
    ],
  },
  signal_intel_lg: {
    id: "signal_intel_lg",
    name: "대형 신호 정보",
    type: "skill",
    apCost: 2,
    description: "카드 2장 드로우 + 적에게 EMP 1 부여",
    effects: [
      { type: "draw_card", value: 2 },
      { type: "apply_status", statusEffect: "emp", statusStacks: 1 },
    ],
  },

  countermeasure_sm: {
    id: "countermeasure_sm",
    name: "소형 대응책",
    type: "skill",
    apCost: 1,
    description: "카드 1장 제외 + 블록 5 획득",
    effects: [
      { type: "exhaust_card", value: 1 },
      { type: "block", value: 5 },
    ],
  },
  countermeasure_md: {
    id: "countermeasure_md",
    name: "중형 대응책",
    type: "skill",
    apCost: 1,
    description: "카드 1장 제외 + 블록 8 획득",
    effects: [
      { type: "exhaust_card", value: 1 },
      { type: "block", value: 8 },
    ],
  },
  countermeasure_lg: {
    id: "countermeasure_lg",
    name: "대형 대응책",
    type: "skill",
    apCost: 2,
    description: "카드 2장 제외 + 블록 12 획득",
    effects: [
      { type: "exhaust_card", value: 2 },
      { type: "block", value: 12 },
    ],
  },

  cyber_attack_sm: {
    id: "cyber_attack_sm",
    name: "소형 사이버 공격",
    type: "attack",
    apCost: 1,
    description: "적에게 5 피해 + 카드 1장 드로우",
    effects: [
      { type: "damage", value: 5 },
      { type: "draw_card", value: 1 },
    ],
  },
  cyber_attack_md: {
    id: "cyber_attack_md",
    name: "중형 사이버 공격",
    type: "attack",
    apCost: 2,
    description: "적에게 8 피해 + 카드 1장 드로우",
    effects: [
      { type: "damage", value: 8 },
      { type: "draw_card", value: 1 },
    ],
  },
  cyber_attack_lg: {
    id: "cyber_attack_lg",
    name: "대형 사이버 공격",
    type: "attack",
    apCost: 2,
    description: "적에게 12 피해 + 카드 2장 드로우",
    effects: [
      { type: "damage", value: 12 },
      { type: "draw_card", value: 2 },
    ],
  },
};
