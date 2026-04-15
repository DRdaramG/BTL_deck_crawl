import type { StatusEffectDefinition } from "./types";

// ============================================================
// 상태이상 정의 데이터
// ============================================================

export const STATUS_EFFECTS: Record<string, StatusEffectDefinition> = {
  burn: {
    id: "burn",
    name: "Burn",
    nameKo: "화상",
    description: "매 턴 종료 시 n 피해",
    triggersOnTurnEnd: true,
    triggersOnTurnStart: false,
    valuePerStack: -1, // 스택당 1 피해 (음수 = 피해)
    disablesActions: false,
  },

  overload: {
    id: "overload",
    name: "Overload",
    nameKo: "과부하",
    description: "다음 공격 피해 2배, 이후 1턴 행동 불가",
    triggersOnTurnEnd: false,
    triggersOnTurnStart: false,
    valuePerStack: 2, // 피해 배율
    disablesActions: true,
  },

  emp: {
    id: "emp",
    name: "EMP",
    nameKo: "EMP",
    description: "1턴 동안 카드 사용 불가",
    triggersOnTurnEnd: false,
    triggersOnTurnStart: true,
    valuePerStack: 0,
    disablesActions: true,
  },

  repair: {
    id: "repair",
    name: "Repair",
    nameKo: "수리중",
    description: "매 턴 n HP 회복",
    triggersOnTurnEnd: false,
    triggersOnTurnStart: true,
    valuePerStack: 1, // 스택당 1 회복 (양수 = 회복)
    disablesActions: false,
  },

  ion: {
    id: "ion",
    name: "Ion",
    nameKo: "이온화",
    description: "매 턴 종료 시 n 피해, 3스택 시 EMP 발동",
    triggersOnTurnEnd: true,
    triggersOnTurnStart: false,
    valuePerStack: -1,
    disablesActions: false,
  },

  scramble: {
    id: "scramble",
    name: "Scramble",
    nameKo: "스크램블",
    description: "카드 AP 비용 +1 증가",
    triggersOnTurnEnd: false,
    triggersOnTurnStart: true,
    valuePerStack: 1,
    disablesActions: false,
  },

  armor_break: {
    id: "armor_break",
    name: "Armor Break",
    nameKo: "장갑 파괴",
    description: "받는 피해 n 증가",
    triggersOnTurnEnd: false,
    triggersOnTurnStart: false,
    valuePerStack: 1,
    disablesActions: false,
  },

  sensor_jam: {
    id: "sensor_jam",
    name: "Sensor Jam",
    nameKo: "센서 교란",
    description: "공격 적중률 50% 감소",
    triggersOnTurnEnd: false,
    triggersOnTurnStart: true,
    valuePerStack: 0,
    disablesActions: false,
  },
};
