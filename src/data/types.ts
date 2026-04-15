// ============================================================
// BTL Deck Crawl — 게임 데이터 모델 타입 정의
// ============================================================

// ────────────────────────────────────────────────────────────
// 1. 공통 Enum / 리터럴 타입
// ────────────────────────────────────────────────────────────

/** 그리드 셀 상태 */
export type CellState = "EMPTY" | "OCCUPIED" | "BLOCKED";

/** 장비 등급 */
export type EquipmentGrade = "common" | "rare" | "epic" | "legendary";

/** 장비 카테고리 */
export type EquipmentCategory =
  | "weapon"
  | "missile"
  | "armor"
  | "shield"
  | "generator"
  | "engine"
  | "crew_quarter"
  | "med_bay"
  | "life_support"
  | "drone_bay"
  | "electronic_warfare"
  | "hangar"
  | "modification";

/** 카드 타입 */
export type CardType = "attack" | "defense" | "skill" | "passive";

/** 상태이상 ID */
export type StatusEffectId =
  | "burn"
  | "overload"
  | "emp"
  | "repair"
  | "ion"
  | "scramble"
  | "armor_break"
  | "sensor_jam";

/** 스테이지 노드 타입 */
export type NodeType =
  | "battle"
  | "elite"
  | "boss"
  | "shop"
  | "event"
  | "repair";

/** 우주선 종류 ID */
export type ShipId =
  | "corvette"
  | "frigate"
  | "destroyer"
  | "cruiser"
  | "battlecruiser"
  | "battleship"
  | "cargo_ship"
  | "assault_ship"
  | "drone_carrier"
  | "carrier";

/** 장비 회전 각도 */
export type Rotation = 0 | 90 | 180 | 270;

/** 재화 종류 */
export type CurrencyType = "scrap" | "data_core";

// ────────────────────────────────────────────────────────────
// 2. 그리드 / 폴리오미노
// ────────────────────────────────────────────────────────────

/** 2D 좌표 */
export interface Position {
  row: number;
  col: number;
}

/**
 * 폴리오미노 모양 정의
 * - cells: 좌상단(0,0) 기준 상대 좌표 배열
 */
export interface PolyominoShape {
  cells: Position[];
}

/**
 * 그리드 정의 — 우주선 내부 배치 공간
 * - rows × cols 크기의 2D 배열
 * - 각 셀은 CellState 값을 가짐
 */
export interface GridDefinition {
  rows: number;
  cols: number;
  /** 유효 셀(EMPTY) 위치 목록. 여기에 없는 셀은 BLOCKED. */
  validCells: Position[];
}

// ────────────────────────────────────────────────────────────
// 3. 카드
// ────────────────────────────────────────────────────────────

export interface CardDefinition {
  id: string;
  name: string;
  type: CardType;
  /** 액션 포인트 비용 (패시브의 경우 0) */
  apCost: number;
  /** 카드 효과 설명 */
  description: string;
  /** 효과 상세 (수치 파라미터) */
  effects: CardEffect[];
}

export interface CardEffect {
  /** 효과 종류 */
  type:
    | "damage"
    | "damage_all"
    | "block"
    | "heal"
    | "evade"
    | "apply_status"
    | "reduce_ap"
    | "damage_reduction"
    | "damage_reflect"
    | "passive_heal"
    | "multi_hit"
    | "salvage"
    | "self_damage"
    | "boost_damage"
    | "boost_multi_hit"
    | "draw_card"
    | "exhaust_card"
    | "restore_ap";
  /** 수치 값 (피해량, 블록량, 회복량 등) */
  value?: number;
  /** 멀티히트 횟수 */
  hitCount?: number;
  /** 부여할 상태이상 ID */
  statusEffect?: StatusEffectId;
  /** 상태이상 스택 수 */
  statusStacks?: number;
  /** 지속 턴 수 */
  duration?: number;
}

// ────────────────────────────────────────────────────────────
// 4. 장비
// ────────────────────────────────────────────────────────────

export interface EquipmentDefinition {
  id: string;
  name: string;
  category: EquipmentCategory;
  grade: EquipmentGrade;
  /** 폴리오미노 모양 */
  shape: PolyominoShape;
  /** 모양 설명 (예: "1×3 직선", "L자 3칸") */
  shapeDescription: string;
  /** 이 장비가 덱에 추가하는 카드 목록 */
  providedCards: EquipmentCard[];
  /** 장비 설명 */
  description: string;
}

/** 장비가 제공하는 카드 정보 */
export interface EquipmentCard {
  cardId: string;
  /** 추가되는 카드 장수 */
  count: number;
}

// ────────────────────────────────────────────────────────────
// 5. 우주선
// ────────────────────────────────────────────────────────────

export interface ShipDefinition {
  id: ShipId;
  name: string;
  /** 한글 이름 */
  nameKo: string;
  /** 이모지 아이콘 */
  icon: string;
  /** 그리드 정의 */
  grid: GridDefinition;
  /** 시작 장비 ID 목록 */
  startingEquipment: string[];
  /** 패시브 능력 설명 */
  passiveDescription: string;
  /** 패시브 효과 (구현용) */
  passive: ShipPassive | null;
  /** 기본 최대 HP */
  maxHp: number;
}

export interface ShipPassive {
  /** 패시브 트리거 조건 */
  trigger:
    | "on_evade_card"
    | "on_block_card"
    | "on_attack_card"
    | "on_drone_card"
    | "on_turn_start"
    | "on_kill"
    | "none";
  /** 효과 종류 */
  effectType:
    | "restore_ap"
    | "add_block"
    | "add_damage"
    | "heal"
    | "gain_currency"
    | "damage_reduction"
    | "draw_card"
    | "none";
  /** 수치 */
  value: number;
}

// ────────────────────────────────────────────────────────────
// 6. 상태이상
// ────────────────────────────────────────────────────────────

export interface StatusEffectDefinition {
  id: StatusEffectId;
  name: string;
  /** 한글 이름 */
  nameKo: string;
  /** 효과 설명 */
  description: string;
  /** 턴 종료 시 발동 여부 */
  triggersOnTurnEnd: boolean;
  /** 턴 시작 시 발동 여부 */
  triggersOnTurnStart: boolean;
  /** 양수 = 회복, 음수 = 피해 */
  valuePerStack: number;
  /** 행동 불가 효과 여부 */
  disablesActions: boolean;
}

// ────────────────────────────────────────────────────────────
// 7. 구역 / 스테이지 / 적
// ────────────────────────────────────────────────────────────

export interface ZoneDefinition {
  id: number;
  name: string;
  /** 적 테마 */
  enemyTheme: string;
  /** 구역 보스 이름 */
  bossName: string;
  /** 노드 레이어 수 */
  layerCount: number;
}

export interface EnemyDefinition {
  id: string;
  name: string;
  /** 등장 구역 ID 목록 */
  zoneIds: number[];
  /** HP */
  hp: number;
  /** 적 행동 패턴 */
  intentPatterns: EnemyIntent[];
  /** 보스 여부 */
  isBoss: boolean;
  /** 엘리트 여부 */
  isElite: boolean;
}

export interface EnemyIntent {
  type: "attack" | "defend" | "buff" | "debuff";
  value: number;
  description: string;
}

// ────────────────────────────────────────────────────────────
// 8. 이벤트
// ────────────────────────────────────────────────────────────

export interface EventDefinition {
  id: string;
  name: string;
  description: string;
  choices: EventChoice[];
}

export interface EventChoice {
  label: string;
  outcomes: EventOutcome[];
}

export interface EventOutcome {
  /** 발생 확률 (0-1). 합이 1 */
  probability: number;
  description: string;
  effects: EventEffect[];
}

export interface EventEffect {
  type:
    | "hp_change"
    | "max_hp_change"
    | "gain_equipment"
    | "gain_currency"
    | "buff_next_enemy"
    | "add_curse_equipment"
    | "none";
  value?: number;
  /** 관련 장비/아이템 ID */
  targetId?: string;
  currencyType?: CurrencyType;
}

// ────────────────────────────────────────────────────────────
// 9. 런타임 상태 (게임 진행 중 저장용)
// ────────────────────────────────────────────────────────────

/** 플레이어 런 세이브 데이터 */
export interface RunState {
  /** 세이브 고유 ID */
  saveId: string;
  /** 선택한 우주선 ID */
  shipId: ShipId;
  /** 현재 HP */
  currentHp: number;
  /** 최대 HP */
  maxHp: number;
  /** 현재 그리드 상태 (장비 배치 포함) */
  gridState: GridState;
  /** 보유 재화 */
  currencies: Record<CurrencyType, number>;
  /** 현재 구역 인덱스 */
  currentZoneIndex: number;
  /** 현재 노드 레이어 인덱스 */
  currentLayerIndex: number;
  /** 방문한 노드 경로 */
  visitedNodes: string[];
  /** 타임스탬프 */
  updatedAt: number;
}

/** 그리드 런타임 상태 */
export interface GridState {
  rows: number;
  cols: number;
  cells: CellState[][];
  /** 배치된 장비 목록 */
  placedEquipment: PlacedEquipment[];
}

/** 그리드에 배치된 장비 인스턴스 */
export interface PlacedEquipment {
  equipmentId: string;
  /** 배치 기준점 (좌상단) */
  position: Position;
  /** 현재 회전 */
  rotation: Rotation;
}
