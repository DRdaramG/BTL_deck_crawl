// ============================================================
// BTL Deck Crawl — 데이터 모듈 진입점
// ============================================================

export { CARDS } from "./cards";
export { EQUIPMENT } from "./equipment";
export { SHIPS } from "./ships";
export { STATUS_EFFECTS } from "./statusEffects";
export { ZONES, ENEMIES } from "./zones";
export { EVENTS } from "./events";

export type {
  // 공통 타입
  CellState,
  EquipmentGrade,
  EquipmentCategory,
  CardType,
  StatusEffectId,
  NodeType,
  ShipId,
  Rotation,
  CurrencyType,
  Position,
  PolyominoShape,
  GridDefinition,
  // 카드
  CardDefinition,
  CardEffect,
  // 장비
  EquipmentDefinition,
  EquipmentCard,
  // 우주선
  ShipDefinition,
  ShipPassive,
  // 상태이상
  StatusEffectDefinition,
  // 구역/적
  ZoneDefinition,
  EnemyDefinition,
  EnemyIntent,
  // 이벤트
  EventDefinition,
  EventChoice,
  EventOutcome,
  EventEffect,
  // 런타임
  RunState,
  GridState,
  PlacedEquipment,
} from "./types";
