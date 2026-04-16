import type { EventDefinition } from "./types";

// ============================================================
// 이벤트 정의 데이터
// ============================================================

export const EVENTS: EventDefinition[] = [
  // ── 공통 이벤트 (모든 구역에서 등장) ─────────────────────────

  {
    id: "drifting_wreckage",
    name: "표류하는 잔해",
    description:
      "앞쪽에 난파된 우주선의 잔해가 떠다니고 있다. 쓸만한 부품이 남아 있을지도 모른다.",
    choices: [
      {
        label: "A: 탐색",
        outcomes: [
          {
            probability: 0.6,
            description: "랜덤 장비 획득",
            effects: [
              {
                type: "gain_equipment",
                targetId: "random_common",
              },
            ],
          },
          {
            probability: 0.4,
            description: "함정! HP -5",
            effects: [{ type: "hp_change", value: -5 }],
          },
        ],
      },
      {
        label: "B: 무시",
        outcomes: [
          {
            probability: 1,
            description: "아무 일도 일어나지 않는다.",
            effects: [{ type: "none" }],
          },
        ],
      },
    ],
  },

  {
    id: "injured_crew",
    name: "부상당한 선원",
    description:
      "구조 신호를 보내는 탈출 포드를 발견했다. 내부에 부상당한 선원이 있다.",
    choices: [
      {
        label: "A: 구조",
        outcomes: [
          {
            probability: 1,
            description: "선원실 장비 획득, HP -3",
            effects: [
              { type: "gain_equipment", targetId: "crew_quarter_a" },
              { type: "hp_change", value: -3 },
            ],
          },
        ],
      },
      {
        label: "B: 떠나기",
        outcomes: [
          {
            probability: 1,
            description: "아무 일도 일어나지 않는다.",
            effects: [{ type: "none" }],
          },
        ],
      },
    ],
  },

  {
    id: "mysterious_station",
    name: "신비로운 공간 기지",
    description:
      "미지의 기술로 만들어진 거대한 우주 정거장이 나타났다. 정박할 수 있을 것 같다.",
    choices: [
      {
        label: "A: 정박",
        outcomes: [
          {
            probability: 0.5,
            description: "최대 HP +10",
            effects: [{ type: "max_hp_change", value: 10 }],
          },
          {
            probability: 0.5,
            description: "저주 장비 강제 추가",
            effects: [{ type: "add_curse_equipment" }],
          },
        ],
      },
      {
        label: "B: 지나침",
        outcomes: [
          {
            probability: 1,
            description: "안전하게 지나간다.",
            effects: [{ type: "none" }],
          },
        ],
      },
    ],
  },

  {
    id: "broken_arms_dealer",
    name: "고장난 무기 거래상",
    description:
      "고장난 우주선에서 무기 거래상이 도움을 요청하고 있다. 수리를 도와주거나…",
    choices: [
      {
        label: "A: 수리 비용 지불",
        outcomes: [
          {
            probability: 1,
            description: "스크랩 50 소모, 장비 구매 가능",
            effects: [
              { type: "gain_currency", currencyType: "scrap", value: -50 },
            ],
          },
        ],
      },
      {
        label: "B: 강탈",
        outcomes: [
          {
            probability: 1,
            description: "희귀 장비 획득, 다음 전투 적 강화",
            effects: [
              { type: "gain_equipment", targetId: "random_rare" },
              { type: "buff_next_enemy" },
            ],
          },
        ],
      },
    ],
  },

  // ── 구역 1 전용 이벤트 (외곽 소행성대 — 해적단) ──────────────

  {
    id: "asteroid_mining",
    name: "소행성 채굴 현장",
    zoneIds: [1],
    description:
      "버려진 채굴 시설이 보인다. 아직 채굴 장비가 작동 중이며, 자원이 남아 있는 것 같다.",
    choices: [
      {
        label: "A: 채굴 시도",
        outcomes: [
          {
            probability: 0.5,
            description: "스크랩 30 획득",
            effects: [
              { type: "gain_currency", currencyType: "scrap", value: 30 },
            ],
          },
          {
            probability: 0.3,
            description: "데이터 코어 1 발견",
            effects: [
              { type: "gain_currency", currencyType: "data_core", value: 1 },
            ],
          },
          {
            probability: 0.2,
            description: "낙석! HP -8",
            effects: [{ type: "hp_change", value: -8 }],
          },
        ],
      },
      {
        label: "B: 지나침",
        outcomes: [
          {
            probability: 1,
            description: "안전하게 지나간다.",
            effects: [{ type: "none" }],
          },
        ],
      },
    ],
  },

  {
    id: "pirate_ambush",
    name: "해적 매복",
    zoneIds: [1],
    description:
      "소행성 뒤에 숨어 있던 해적 소형선이 통신을 보내왔다. 통행세를 내거나 싸울 수 있다.",
    choices: [
      {
        label: "A: 통행세 지불",
        outcomes: [
          {
            probability: 1,
            description: "스크랩 25 소모, 안전 통과",
            effects: [
              { type: "gain_currency", currencyType: "scrap", value: -25 },
            ],
          },
        ],
      },
      {
        label: "B: 선제 공격",
        outcomes: [
          {
            probability: 0.6,
            description: "승리! 장비 노획",
            effects: [
              { type: "gain_equipment", targetId: "random_common" },
              { type: "gain_currency", currencyType: "scrap", value: 15 },
            ],
          },
          {
            probability: 0.4,
            description: "반격! HP -10",
            effects: [{ type: "hp_change", value: -10 }],
          },
        ],
      },
    ],
  },

  {
    id: "abandoned_outpost",
    name: "버려진 전초기지",
    zoneIds: [1],
    description:
      "소행성대 깊숙이 버려진 전초기지가 있다. 해적들이 쓰던 곳 같지만 지금은 비어 있다.",
    choices: [
      {
        label: "A: 기지 탐색",
        outcomes: [
          {
            probability: 0.4,
            description: "장비 발견!",
            effects: [
              { type: "gain_equipment", targetId: "random_rare" },
            ],
          },
          {
            probability: 0.3,
            description: "스크랩 40 발견",
            effects: [
              { type: "gain_currency", currencyType: "scrap", value: 40 },
            ],
          },
          {
            probability: 0.3,
            description: "부비트랩! HP -6, 다음 전투 적 강화",
            effects: [
              { type: "hp_change", value: -6 },
              { type: "buff_next_enemy" },
            ],
          },
        ],
      },
      {
        label: "B: 무시",
        outcomes: [
          {
            probability: 1,
            description: "아무 일도 일어나지 않는다.",
            effects: [{ type: "none" }],
          },
        ],
      },
    ],
  },

  // ── 구역 2 전용 이벤트 (성운 지대 — 기계 군단) ──────────────

  {
    id: "nebula_interference",
    name: "성운 간섭 지대",
    zoneIds: [2],
    description:
      "짙은 성운 가스가 함선의 전자 장비에 간섭을 일으키고 있다. 강행 돌파하거나 우회할 수 있다.",
    choices: [
      {
        label: "A: 강행 돌파",
        outcomes: [
          {
            probability: 0.5,
            description: "성운 속 데이터 노드 발견! 데이터 코어 획득",
            effects: [
              { type: "gain_currency", currencyType: "data_core", value: 2 },
            ],
          },
          {
            probability: 0.5,
            description: "전자 장비 과부하! HP -10",
            effects: [{ type: "hp_change", value: -10 }],
          },
        ],
      },
      {
        label: "B: 우회",
        outcomes: [
          {
            probability: 1,
            description: "안전하게 우회한다.",
            effects: [{ type: "none" }],
          },
        ],
      },
    ],
  },

  {
    id: "derelict_factory",
    name: "버려진 기계 공장",
    zoneIds: [2],
    description:
      "기계 군단이 사용하던 자동화 공장이 정지 상태로 떠 있다. 재가동하면 유용한 부품을 얻을 수 있을 것 같다.",
    choices: [
      {
        label: "A: 공장 재가동",
        outcomes: [
          {
            probability: 0.4,
            description: "희귀 장비 제조 성공!",
            effects: [
              { type: "gain_equipment", targetId: "random_rare" },
            ],
          },
          {
            probability: 0.3,
            description: "스크랩 35 획득",
            effects: [
              { type: "gain_currency", currencyType: "scrap", value: 35 },
            ],
          },
          {
            probability: 0.3,
            description: "경비 드론 활성화! HP -8, 다음 전투 적 강화",
            effects: [
              { type: "hp_change", value: -8 },
              { type: "buff_next_enemy" },
            ],
          },
        ],
      },
      {
        label: "B: 무시",
        outcomes: [
          {
            probability: 1,
            description: "위험을 피해 지나간다.",
            effects: [{ type: "none" }],
          },
        ],
      },
    ],
  },

  {
    id: "rogue_ai_signal",
    name: "이탈 AI 신호",
    zoneIds: [2],
    description:
      "기계 군단에서 이탈한 AI가 통신을 보내왔다. 자신의 데이터를 넘기는 대가로 도움을 요청하고 있다.",
    choices: [
      {
        label: "A: 협력",
        outcomes: [
          {
            probability: 0.7,
            description: "AI 데이터 수신 완료! 최대 HP +5, 스크랩 +20",
            effects: [
              { type: "max_hp_change", value: 5 },
              { type: "gain_currency", currencyType: "scrap", value: 20 },
            ],
          },
          {
            probability: 0.3,
            description: "함정이었다! 저주 장비 강제 추가",
            effects: [{ type: "add_curse_equipment" }],
          },
        ],
      },
      {
        label: "B: 무시",
        outcomes: [
          {
            probability: 1,
            description: "신호를 무시한다.",
            effects: [{ type: "none" }],
          },
        ],
      },
    ],
  },

  // ── 구역 3 전용 이벤트 (적 본거지 — 정예 함대) ──────────────

  {
    id: "fleet_deserter",
    name: "탈영 함선",
    zoneIds: [3],
    description:
      "적 함대에서 이탈한 소형 함선이 투항 의사를 보내왔다. 보급품을 제공하겠다고 한다.",
    choices: [
      {
        label: "A: 투항 수락",
        outcomes: [
          {
            probability: 0.6,
            description: "보급품 수령! 스크랩 +45, HP +10",
            effects: [
              { type: "gain_currency", currencyType: "scrap", value: 45 },
              { type: "hp_change", value: 10 },
            ],
          },
          {
            probability: 0.4,
            description: "위장 공작이었다! HP -12",
            effects: [{ type: "hp_change", value: -12 }],
          },
        ],
      },
      {
        label: "B: 거부",
        outcomes: [
          {
            probability: 1,
            description: "위험을 감수하지 않는다.",
            effects: [{ type: "none" }],
          },
        ],
      },
    ],
  },

  {
    id: "enemy_supply_depot",
    name: "적 보급 기지",
    zoneIds: [3],
    description:
      "적 함대의 전방 보급 기지를 발견했다. 기습하면 물자를 노획할 수 있지만, 경비가 삼엄하다.",
    choices: [
      {
        label: "A: 기습 공격",
        outcomes: [
          {
            probability: 0.5,
            description: "기습 성공! 에픽 장비 노획!",
            effects: [
              { type: "gain_equipment", targetId: "random_rare" },
              { type: "gain_currency", currencyType: "scrap", value: 30 },
            ],
          },
          {
            probability: 0.5,
            description: "경비대에 발각! HP -15, 다음 전투 적 강화",
            effects: [
              { type: "hp_change", value: -15 },
              { type: "buff_next_enemy" },
            ],
          },
        ],
      },
      {
        label: "B: 우회",
        outcomes: [
          {
            probability: 1,
            description: "조용히 우회한다.",
            effects: [{ type: "none" }],
          },
        ],
      },
    ],
  },

  {
    id: "encrypted_transmission",
    name: "암호화된 통신",
    zoneIds: [3],
    description:
      "적 함대의 암호화된 통신을 수신했다. 해독하면 적의 약점을 파악할 수 있을지도 모른다.",
    choices: [
      {
        label: "A: 해독 시도",
        outcomes: [
          {
            probability: 0.5,
            description: "해독 성공! 데이터 코어 +2, 스크랩 +25",
            effects: [
              { type: "gain_currency", currencyType: "data_core", value: 2 },
              { type: "gain_currency", currencyType: "scrap", value: 25 },
            ],
          },
          {
            probability: 0.3,
            description: "부분 해독. 스크랩 +15",
            effects: [
              { type: "gain_currency", currencyType: "scrap", value: 15 },
            ],
          },
          {
            probability: 0.2,
            description: "역추적 당했다! HP -10, 다음 전투 적 강화",
            effects: [
              { type: "hp_change", value: -10 },
              { type: "buff_next_enemy" },
            ],
          },
        ],
      },
      {
        label: "B: 무시",
        outcomes: [
          {
            probability: 1,
            description: "통신을 무시한다.",
            effects: [{ type: "none" }],
          },
        ],
      },
    ],
  },
];
