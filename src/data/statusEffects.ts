import type { StatusEffectDefinition } from "./types.js";

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
};
