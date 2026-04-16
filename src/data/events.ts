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
];
