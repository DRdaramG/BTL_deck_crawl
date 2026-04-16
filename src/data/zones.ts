import type { ZoneDefinition, EnemyDefinition } from "./types";

// ============================================================
// 구역 (Zone) 정의 데이터
// ============================================================

export const ZONES: ZoneDefinition[] = [
  {
    id: 1,
    name: "외곽 소행성대",
    enemyTheme: "해적단",
    bossName: "해적 모선",
    layerCount: 4,
  },
  {
    id: 2,
    name: "성운 지대",
    enemyTheme: "기계 군단",
    bossName: "기계 요새",
    layerCount: 5,
  },
  {
    id: 3,
    name: "적 본거지",
    enemyTheme: "정예 함대",
    bossName: "제독 기함",
    layerCount: 5,
  },
  {
    id: 4,
    name: "어둠의 심연",
    enemyTheme: "최종",
    bossName: "보이드 리바이어던",
    layerCount: 1,
  },
];

// ============================================================
// 적 정의 데이터
// ============================================================

export const ENEMIES: EnemyDefinition[] = [
  // ── 구역 1: 해적단 ────────────────────────────────────────
  {
    id: "pirate_scout",
    name: "해적 정찰기",
    zoneIds: [1],
    hp: 20,
    intentPatterns: [
      { type: "attack", value: 6, description: "레이저 공격" },
      { type: "defend", value: 4, description: "방어 태세" },
      { type: "attack", value: 8, description: "기습 공격" },
    ],
    isBoss: false,
    isElite: false,
  },
  {
    id: "pirate_fighter",
    name: "해적 전투기",
    zoneIds: [1],
    hp: 30,
    intentPatterns: [
      { type: "attack", value: 8, description: "캐논 사격" },
      { type: "attack", value: 5, description: "연속 사격" },
      { type: "buff", value: 3, description: "전투 준비" },
    ],
    isBoss: false,
    isElite: false,
  },
  {
    id: "pirate_raider",
    name: "해적 약탈선",
    zoneIds: [1],
    hp: 25,
    intentPatterns: [
      { type: "attack", value: 7, description: "약탈포 사격" },
      { type: "debuff", value: 1, description: "스크램블 재밍" },
      { type: "attack", value: 10, description: "돌격 공격" },
    ],
    isBoss: false,
    isElite: false,
  },
  {
    id: "pirate_elite",
    name: "해적 간부선",
    zoneIds: [1],
    hp: 50,
    intentPatterns: [
      { type: "attack", value: 12, description: "중화기 공격" },
      { type: "defend", value: 8, description: "실드 전개" },
      { type: "debuff", value: 1, description: "EMP 발사" },
      { type: "attack", value: 15, description: "집중 포화" },
    ],
    isBoss: false,
    isElite: true,
  },
  {
    id: "pirate_mothership",
    name: "해적 모선",
    zoneIds: [1],
    hp: 100,
    intentPatterns: [
      { type: "attack", value: 10, description: "함포 사격" },
      { type: "buff", value: 5, description: "함대 소환" },
      { type: "attack", value: 18, description: "전탄 발사" },
      { type: "defend", value: 12, description: "강화 실드" },
      { type: "debuff", value: 2, description: "광역 EMP" },
    ],
    isBoss: true,
    isElite: false,
  },

  // ── 구역 2: 기계 군단 ─────────────────────────────────────
  {
    id: "machine_drone",
    name: "기계 드론",
    zoneIds: [2],
    hp: 25,
    intentPatterns: [
      { type: "attack", value: 7, description: "레이저 빔" },
      { type: "attack", value: 7, description: "레이저 빔" },
      { type: "defend", value: 5, description: "자기 수리" },
    ],
    isBoss: false,
    isElite: false,
  },
  {
    id: "machine_interceptor",
    name: "기계 요격기",
    zoneIds: [2],
    hp: 30,
    intentPatterns: [
      { type: "attack", value: 9, description: "속사 레이저" },
      { type: "debuff", value: 1, description: "이온화 공격" },
      { type: "attack", value: 11, description: "집속 빔" },
    ],
    isBoss: false,
    isElite: false,
  },
  {
    id: "machine_guardian",
    name: "기계 수호자",
    zoneIds: [2],
    hp: 40,
    intentPatterns: [
      { type: "defend", value: 10, description: "에너지 배리어" },
      { type: "attack", value: 10, description: "빔 캐논" },
      { type: "debuff", value: 1, description: "과부하 유발" },
    ],
    isBoss: false,
    isElite: false,
  },
  {
    id: "machine_elite",
    name: "기계 사령관",
    zoneIds: [2],
    hp: 65,
    intentPatterns: [
      { type: "attack", value: 14, description: "플라즈마 포" },
      { type: "defend", value: 12, description: "리인포스 필드" },
      { type: "buff", value: 4, description: "시스템 업그레이드" },
      { type: "attack", value: 20, description: "궤도 폭격" },
    ],
    isBoss: false,
    isElite: true,
  },
  {
    id: "machine_fortress",
    name: "기계 요새",
    zoneIds: [2],
    hp: 150,
    intentPatterns: [
      { type: "defend", value: 15, description: "요새 방벽" },
      { type: "attack", value: 12, description: "포탑 사격" },
      { type: "debuff", value: 2, description: "시스템 해킹" },
      { type: "attack", value: 25, description: "메가 캐논" },
      { type: "buff", value: 8, description: "수리 프로토콜" },
    ],
    isBoss: true,
    isElite: false,
  },

  // ── 구역 3: 정예 함대 ─────────────────────────────────────
  {
    id: "fleet_corvette",
    name: "함대 초계함",
    zoneIds: [3],
    hp: 35,
    intentPatterns: [
      { type: "attack", value: 9, description: "속사포" },
      { type: "attack", value: 12, description: "미사일 공격" },
      { type: "defend", value: 6, description: "기동 회피" },
    ],
    isBoss: false,
    isElite: false,
  },
  {
    id: "fleet_destroyer",
    name: "함대 구축함",
    zoneIds: [3],
    hp: 50,
    intentPatterns: [
      { type: "attack", value: 15, description: "대함 미사일" },
      { type: "defend", value: 10, description: "전자전 방해" },
      { type: "debuff", value: 1, description: "화상 유발" },
    ],
    isBoss: false,
    isElite: false,
  },
  {
    id: "fleet_cruiser",
    name: "함대 순양함",
    zoneIds: [3],
    hp: 55,
    intentPatterns: [
      { type: "attack", value: 12, description: "주포 발사" },
      { type: "defend", value: 12, description: "강화 실드" },
      { type: "attack", value: 16, description: "어뢰 공격" },
      { type: "debuff", value: 1, description: "센서 교란" },
    ],
    isBoss: false,
    isElite: false,
  },
  {
    id: "fleet_elite",
    name: "정예 함장선",
    zoneIds: [3],
    hp: 80,
    intentPatterns: [
      { type: "attack", value: 18, description: "함대 지원 사격" },
      { type: "defend", value: 15, description: "전방위 방어" },
      { type: "buff", value: 5, description: "전투 지시" },
      { type: "attack", value: 22, description: "일제 사격" },
    ],
    isBoss: false,
    isElite: true,
  },
  {
    id: "admiral_flagship",
    name: "제독 기함",
    zoneIds: [3],
    hp: 200,
    intentPatterns: [
      { type: "attack", value: 15, description: "주포 사격" },
      { type: "buff", value: 10, description: "함대 증원" },
      { type: "defend", value: 20, description: "절대 방어" },
      { type: "attack", value: 30, description: "최종 공격" },
      { type: "debuff", value: 3, description: "전면 EMP" },
    ],
    isBoss: true,
    isElite: false,
  },

  // ── 최종 보스 ─────────────────────────────────────────────
  {
    id: "void_leviathan",
    name: "보이드 리바이어던",
    zoneIds: [4],
    hp: 300,
    intentPatterns: [
      { type: "attack", value: 20, description: "심연의 숨결" },
      { type: "debuff", value: 3, description: "차원 왜곡" },
      { type: "defend", value: 25, description: "공허 장막" },
      { type: "attack", value: 35, description: "절멸의 일격" },
      { type: "buff", value: 15, description: "심연 흡수" },
      { type: "attack", value: 50, description: "종말의 포효" },
    ],
    isBoss: true,
    isElite: false,
  },
];
