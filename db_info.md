# BTL Deck Crawl — 데이터베이스 설계 문서 (db_info.md)

> **최종 수정일**: 2026-04-14  
> **관련 파일**: `src/data/` 디렉토리

---

## 목차

1. [개요](#1-개요)
2. [데이터 저장 전략](#2-데이터-저장-전략)
3. [정적 데이터 (Static Data)](#3-정적-데이터-static-data)
   - 3-1. 카드 (CardDefinition)
   - 3-2. 장비 (EquipmentDefinition)
   - 3-3. 우주선 (ShipDefinition)
   - 3-4. 상태이상 (StatusEffectDefinition)
   - 3-5. 구역 / 적 (ZoneDefinition / EnemyDefinition)
   - 3-6. 이벤트 (EventDefinition)
4. [런타임 데이터 (Runtime State)](#4-런타임-데이터-runtime-state)
5. [타입 정의 요약](#5-타입-정의-요약)
6. [파일 구조](#6-파일-구조)
7. [데이터 관계도 (ER Diagram)](#7-데이터-관계도-er-diagram)

---

## 1. 개요

BTL Deck Crawl은 웹 기반 덱빌딩 로그라이크 게임으로, 데이터를 두 가지 계층으로 관리한다:

| 계층 | 설명 | 저장소 |
|------|------|--------|
| **정적 데이터** | 게임 규칙을 구성하는 불변 데이터 (카드, 장비, 우주선 등) | TypeScript 상수 (`src/data/`) |
| **런타임 데이터** | 플레이 중 변경되는 상태 (HP, 덱, 그리드 배치 등) | LocalStorage / IndexedDB |

---

## 2. 데이터 저장 전략

### 정적 데이터
- TypeScript 상수 객체로 정의하여 **빌드 시 번들에 포함**
- 별도 DB 서버 불필요 (클라이언트 사이드 전용)
- `src/data/index.ts`를 통해 모든 데이터에 일괄 접근 가능

### 런타임 데이터
- 싱글 플레이: `LocalStorage` 또는 `IndexedDB`에 JSON 직렬화하여 저장
- 리더보드(추후): Node.js + Express + SQLite 또는 Firebase 도입 예정

### 저장 키 구조 (LocalStorage)
```
btl_run_save      → RunState JSON (현재 런 진행 상황)
btl_settings      → 사용자 설정 (볼륨, 언어 등)
btl_leaderboard   → 로컬 최고 기록 (추후 서버 연동 시 대체)
```

---

## 3. 정적 데이터 (Static Data)

### 3-1. 카드 (CardDefinition)

**파일**: `src/data/cards.ts`  
**키**: `CARDS` (Record<string, CardDefinition>)

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `string` | 카드 고유 ID |
| `name` | `string` | 카드 이름 (한글) |
| `type` | `CardType` | `"attack"` / `"defense"` / `"skill"` / `"passive"` |
| `apCost` | `number` | 액션 포인트 비용 |
| `description` | `string` | 효과 설명 |
| `effects` | `CardEffect[]` | 효과 상세 목록 |

#### CardEffect 구조

| 필드 | 타입 | 설명 |
|------|------|------|
| `type` | `string` | 효과 종류 (`damage`, `block`, `heal`, `evade`, `apply_status` 등) |
| `value` | `number?` | 수치 값 |
| `hitCount` | `number?` | 멀티히트 횟수 |
| `statusEffect` | `StatusEffectId?` | 부여할 상태이상 |
| `statusStacks` | `number?` | 상태이상 스택 수 |
| `duration` | `number?` | 지속 턴 수 |

#### 현재 등록 카드 목록

| ID | 이름 | 타입 | AP | 효과 |
|----|------|------|----|------|
| `laser_shot` | 레이저 사격 | attack | 1 | 단일 6 피해 |
| `plasma_burst` | 플라즈마 버스트 | attack | 2 | 단일 9 피해 + 화상 1 |
| `railgun_pierce` | 레일건 관통 | attack | 3 | 전체 12 피해 |
| `pulse_barrage` | 펄스 연사 | attack | 2 | 단일 4 피해 × 3회 |
| `missile_launch` | 미사일 발사 | attack | 2 | 전체 4 피해 + 화상 1 |
| `energy_shield` | 에너지 실드 | defense | 1 | 블록 8 |
| `reinforced_hull` | 강화 선체 | defense | 2 | 블록 15 + 피해 감소 1턴 |
| `reflect_shield` | 반사 | defense | 2 | 블록 6 + 피해 반사 |
| `emergency_evade` | 긴급 회피 | skill | 1 | 다음 공격 회피 |
| `phase_shift` | 위상 이동 | skill | 3 | 3턴 공격 회피 |
| `morale_boost` | 사기 진작 | skill | 0 | 다음 카드 AP -1 |
| `first_aid` | 응급 처치 | skill | 1 | HP 6 회복 |
| `life_support_passive` | 생명 유지 | passive | 0 | 매 턴 HP +2 |

---

### 3-2. 장비 (EquipmentDefinition)

**파일**: `src/data/equipment.ts`  
**키**: `EQUIPMENT` (Record<string, EquipmentDefinition>)

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `string` | 장비 고유 ID |
| `name` | `string` | 장비 이름 (한글) |
| `category` | `EquipmentCategory` | 장비 카테고리 |
| `grade` | `EquipmentGrade` | 등급 (`common` / `rare` / `epic` / `legendary`) |
| `shape` | `PolyominoShape` | 폴리오미노 모양 (셀 좌표 배열) |
| `shapeDescription` | `string` | 모양 설명 |
| `providedCards` | `EquipmentCard[]` | 제공하는 카드 목록 (카드 ID + 장수) |
| `description` | `string` | 장비 설명 |

#### 장비 카테고리 (EquipmentCategory)

| 값 | 아이콘 | 설명 |
|----|--------|------|
| `weapon` | 🔫 | 공격 카드 생성 |
| `missile` | 🚀 | 광역/상태이상 공격 |
| `shield` | 🛡️ | 방어/블록 카드 |
| `engine` | ⚙️ | 이동/회피 카드 |
| `crew_quarter` | 🧑‍🚀 | 버프/회복 카드 |
| `med_bay` | 🏥 | 치유/상태이상 제거 |
| `life_support` | 💚 | 지속 HP 회복 패시브 |

#### 장비 등급 (EquipmentGrade)

| 값 | 색상 | 크기 범위 |
|----|------|-----------|
| `common` | 회색 | 1–2칸 |
| `rare` | 파랑 | 2–4칸 |
| `epic` | 보라 | 3–5칸 |
| `legendary` | 황금 | 3–5칸 |

#### 현재 등록 장비 목록

| ID | 이름 | 카테고리 | 등급 | 모양 | 제공 카드 |
|----|------|----------|------|------|-----------|
| `laser_cannon` | 레이저 캐논 | weapon | common | 1×3 직선 | 레이저 사격 ×2 |
| `plasma_gun` | 플라즈마 건 | weapon | rare | L자 3칸 | 플라즈마 버스트 ×2 |
| `railgun` | 레일건 | weapon | epic | 1×4 직선 | 레일건 관통 ×1 |
| `pulse_cannon` | 펄스 캐논 | weapon | rare | T자 4칸 | 펄스 연사 ×3 |
| `missile_launcher` | 미사일 런처 | missile | rare | 2×2 정사각 | 미사일 발사 ×2 |
| `shield_generator` | 실드 제너레이터 | shield | common | L자 3칸 | 에너지 실드 ×2 |
| `reinforced_hull` | 강화 선체 | shield | rare | 2×2 정사각 | 강화 선체 ×1 |
| `reflect_shield` | 반사 실드 | shield | epic | Z자 4칸 | 반사 ×1 |
| `booster_engine` | 부스터 엔진 | engine | common | 1×2 수직 | 긴급 회피 ×2 |
| `warp_drive` | 워프 드라이브 | engine | legendary | S자 4칸 | 위상 이동 ×1 |
| `crew_quarter_a` | 선원실 A | crew_quarter | common | 2×1 수평 | 사기 진작 ×2 |
| `med_bay` | 의무실 | med_bay | rare | T자 4칸 | 응급 처치 ×2 |
| `life_support` | 생명유지장치 | life_support | rare | 2×2 정사각 | 생명 유지 ×1 |

---

### 3-3. 우주선 (ShipDefinition)

**파일**: `src/data/ships.ts`  
**키**: `SHIPS` (Record<string, ShipDefinition>)

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `ShipId` | 우주선 고유 ID |
| `name` | `string` | 영문 이름 |
| `nameKo` | `string` | 한글 이름 |
| `icon` | `string` | 이모지 아이콘 |
| `grid` | `GridDefinition` | 그리드 정의 (행, 열, 유효 셀) |
| `startingEquipment` | `string[]` | 시작 장비 ID 목록 |
| `passiveDescription` | `string` | 패시브 설명 |
| `passive` | `ShipPassive \| null` | 패시브 효과 |
| `maxHp` | `number` | 기본 최대 HP |

#### GridDefinition 구조

| 필드 | 타입 | 설명 |
|------|------|------|
| `rows` | `number` | 그리드 행 수 |
| `cols` | `number` | 그리드 열 수 |
| `validCells` | `Position[]` | 유효 셀(EMPTY) 위치 목록 |

#### 현재 등록 우주선

| ID | 이름 | 그리드 | 유효 셀 | 시작 장비 | 패시브 | 최대 HP |
|----|------|--------|---------|-----------|--------|---------|
| `scout` | 🛸 정찰선 | 5×5 다이아몬드 | 18칸 | 레이저 캐논 + 부스터 엔진 | 회피 카드 사용 시 AP +1 복원 | 50 |
| `cruiser` | 🚀 순양함 | 7×7 사각 | 35칸 | 플라즈마 건 + 실드 제너레이터 + 선원실 A | 없음 | 70 |
| `battleship` | 🏰 전함 | 9×7 직사각 | 59칸 | 레일건 + 강화 선체 + 생명유지장치 | 블록 카드 효과 +3 | 90 |

---

### 3-4. 상태이상 (StatusEffectDefinition)

**파일**: `src/data/statusEffects.ts`  
**키**: `STATUS_EFFECTS` (Record<string, StatusEffectDefinition>)

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `StatusEffectId` | 상태이상 고유 ID |
| `name` | `string` | 영문 이름 |
| `nameKo` | `string` | 한글 이름 |
| `description` | `string` | 효과 설명 |
| `triggersOnTurnEnd` | `boolean` | 턴 종료 시 발동 여부 |
| `triggersOnTurnStart` | `boolean` | 턴 시작 시 발동 여부 |
| `valuePerStack` | `number` | 스택당 수치 (음수=피해, 양수=회복) |
| `disablesActions` | `boolean` | 행동 불가 효과 여부 |

#### 현재 등록 상태이상

| ID | 이름 | 효과 | 발동 시점 | 행동 불가 |
|----|------|------|-----------|-----------|
| `burn` | 화상 | 매 턴 스택 당 1 피해 | 턴 종료 | ❌ |
| `overload` | 과부하 | 다음 공격 2배 + 1턴 불가 | — | ✅ |
| `emp` | EMP | 1턴 카드 사용 불가 | 턴 시작 | ✅ |
| `repair` | 수리중 | 매 턴 스택 당 1 회복 | 턴 시작 | ❌ |

---

### 3-5. 구역 / 적 (ZoneDefinition / EnemyDefinition)

**파일**: `src/data/zones.ts`  
**키**: `ZONES` (ZoneDefinition[]), `ENEMIES` (EnemyDefinition[])

#### ZoneDefinition

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `number` | 구역 번호 |
| `name` | `string` | 구역 이름 |
| `enemyTheme` | `string` | 적 테마 |
| `bossName` | `string` | 구역 보스 이름 |
| `layerCount` | `number` | 노드 레이어 수 |

#### EnemyDefinition

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `string` | 적 고유 ID |
| `name` | `string` | 적 이름 |
| `zoneIds` | `number[]` | 등장 구역 ID 목록 |
| `hp` | `number` | HP |
| `intentPatterns` | `EnemyIntent[]` | 행동 패턴 (순환) |
| `isBoss` | `boolean` | 보스 여부 |
| `isElite` | `boolean` | 엘리트 여부 |

#### 현재 등록 구역

| 구역 | 이름 | 적 테마 | 보스 | 레이어 수 |
|------|------|---------|------|-----------|
| 1 | 외곽 소행성대 | 해적단 | 해적 모선 | 4 |
| 2 | 성운 지대 | 기계 군단 | 기계 요새 | 5 |
| 3 | 적 본거지 | 정예 함대 | 제독 기함 | 5 |
| 4 | 어둠의 심연 | 최종 | 보이드 리바이어던 | 1 |

#### 현재 등록 적 (14종)

| 구역 | 일반 적 | 엘리트 | 보스 |
|------|---------|--------|------|
| 1 | 해적 정찰기 (20HP), 해적 전투기 (30HP) | 해적 간부선 (50HP) | 해적 모선 (100HP) |
| 2 | 기계 드론 (25HP), 기계 수호자 (40HP) | 기계 사령관 (65HP) | 기계 요새 (150HP) |
| 3 | 함대 초계함 (35HP), 함대 구축함 (50HP) | 정예 함장선 (80HP) | 제독 기함 (200HP) |
| 4 | — | — | 보이드 리바이어던 (300HP) |

---

### 3-6. 이벤트 (EventDefinition)

**파일**: `src/data/events.ts`  
**키**: `EVENTS` (EventDefinition[])

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `string` | 이벤트 고유 ID |
| `name` | `string` | 이벤트 이름 |
| `description` | `string` | 이벤트 설명 텍스트 |
| `choices` | `EventChoice[]` | 선택지 목록 |

#### EventChoice / EventOutcome / EventEffect

```
EventChoice
├── label: string          (선택지 라벨)
└── outcomes: EventOutcome[]
    ├── probability: number  (발생 확률, 합 = 1)
    ├── description: string  (결과 설명)
    └── effects: EventEffect[]
        ├── type: string     (효과 종류)
        ├── value?: number   (수치)
        ├── targetId?: string (장비/아이템 ID)
        └── currencyType?: CurrencyType (재화 종류)
```

#### 현재 등록 이벤트 (4종)

| ID | 이름 | 선택지 A | 선택지 B |
|----|------|----------|----------|
| `drifting_wreckage` | 표류하는 잔해 | 60% 랜덤 장비 / 40% HP-5 | 무시 |
| `injured_crew` | 부상당한 선원 | 선원실 획득 + HP-3 | 무시 |
| `mysterious_station` | 신비로운 공간 기지 | 50% 최대HP+10 / 50% 저주 장비 | 지나침 |
| `broken_arms_dealer` | 고장난 무기 거래상 | 스크랩-50 + 장비 구매 | 희귀 장비 + 적 강화 |

---

## 4. 런타임 데이터 (Runtime State)

### RunState — 런 세이브 데이터

게임 진행 중 실시간으로 변경되는 상태. LocalStorage에 JSON으로 직렬화하여 저장한다.

| 필드 | 타입 | 설명 |
|------|------|------|
| `saveId` | `string` | 세이브 고유 ID |
| `shipId` | `ShipId` | 선택한 우주선 ID |
| `currentHp` | `number` | 현재 HP |
| `maxHp` | `number` | 최대 HP |
| `gridState` | `GridState` | 현재 그리드 상태 (장비 배치) |
| `currencies` | `Record<CurrencyType, number>` | 보유 재화 (`scrap`, `data_core`) |
| `currentZoneIndex` | `number` | 현재 구역 인덱스 |
| `currentLayerIndex` | `number` | 현재 노드 레이어 인덱스 |
| `visitedNodes` | `string[]` | 방문한 노드 경로 |
| `updatedAt` | `number` | 저장 타임스탬프 |

### GridState — 그리드 런타임 상태

| 필드 | 타입 | 설명 |
|------|------|------|
| `rows` | `number` | 그리드 행 수 |
| `cols` | `number` | 그리드 열 수 |
| `cells` | `CellState[][]` | 2D 셀 상태 배열 |
| `placedEquipment` | `PlacedEquipment[]` | 배치된 장비 인스턴스 목록 |

### PlacedEquipment — 배치된 장비

| 필드 | 타입 | 설명 |
|------|------|------|
| `equipmentId` | `string` | 장비 정의 ID |
| `position` | `Position` | 배치 기준점 (좌상단) |
| `rotation` | `Rotation` | 회전 각도 (0 / 90 / 180 / 270) |

---

## 5. 타입 정의 요약

모든 타입은 `src/data/types.ts`에 정의되어 있다.

### 공통 리터럴 타입

| 타입명 | 값 |
|--------|-----|
| `CellState` | `"EMPTY"` \| `"OCCUPIED"` \| `"BLOCKED"` |
| `EquipmentGrade` | `"common"` \| `"rare"` \| `"epic"` \| `"legendary"` |
| `EquipmentCategory` | `"weapon"` \| `"missile"` \| `"shield"` \| `"engine"` \| `"crew_quarter"` \| `"med_bay"` \| `"life_support"` |
| `CardType` | `"attack"` \| `"defense"` \| `"skill"` \| `"passive"` |
| `StatusEffectId` | `"burn"` \| `"overload"` \| `"emp"` \| `"repair"` |
| `NodeType` | `"battle"` \| `"elite"` \| `"boss"` \| `"shop"` \| `"event"` \| `"repair"` |
| `ShipId` | `"scout"` \| `"cruiser"` \| `"battleship"` |
| `Rotation` | `0` \| `90` \| `180` \| `270` |
| `CurrencyType` | `"scrap"` \| `"data_core"` |

---

## 6. 파일 구조

```
src/
└── data/
    ├── index.ts           # 데이터 모듈 진입점 (모든 export 집합)
    ├── types.ts           # 전체 타입/인터페이스 정의
    ├── cards.ts           # 카드 정의 데이터 (13종)
    ├── equipment.ts       # 장비 정의 데이터 (13종)
    ├── ships.ts           # 우주선 정의 데이터 (3종)
    ├── statusEffects.ts   # 상태이상 정의 데이터 (4종)
    ├── zones.ts           # 구역 정의 (4개) + 적 정의 (14종)
    └── events.ts          # 이벤트 정의 데이터 (4종)
```

---

## 7. 데이터 관계도 (ER Diagram)

```
┌──────────────┐     provides      ┌──────────────┐
│  Equipment   │──────────────────▶│     Card     │
│              │   (1:N cards)     │              │
│  - id        │                   │  - id        │
│  - category  │                   │  - type      │
│  - grade     │                   │  - apCost    │
│  - shape     │                   │  - effects[] │
└──────┬───────┘                   └──────┬───────┘
       │                                  │
       │ placed on                        │ applies
       ▼                                  ▼
┌──────────────┐                   ┌──────────────┐
│   Ship Grid  │                   │ StatusEffect │
│              │                   │              │
│  - rows/cols │                   │  - id        │
│  - validCells│                   │  - triggers  │
│  - cellState │                   │  - valuePerS │
└──────┬───────┘                   └──────────────┘
       │
       │ belongs to
       ▼
┌──────────────┐     encounters    ┌──────────────┐
│     Ship     │──────────────────▶│    Enemy     │
│              │                   │              │
│  - id        │                   │  - id        │
│  - maxHp     │                   │  - hp        │
│  - passive   │                   │  - intents[] │
│  - startEq[] │                   │  - zoneIds[] │
└──────────────┘                   └──────┬───────┘
                                          │
                                          │ appears in
                                          ▼
┌──────────────┐     contains      ┌──────────────┐
│    Event     │                   │     Zone     │
│              │                   │              │
│  - id        │                   │  - id        │
│  - choices[] │                   │  - bossName  │
│  - outcomes  │                   │  - layerCnt  │
└──────────────┘                   └──────────────┘

                ┌──────────────┐
                │   RunState   │  (LocalStorage)
                │              │
                │  - saveId    │
                │  - shipId    │
                │  - hp/maxHp  │
                │  - gridState │
                │  - currencies│
                │  - zoneIdx   │
                │  - visited[] │
                └──────────────┘
```

### 핵심 관계 설명

1. **Equipment → Card**: 장비가 카드를 제공 (1:N). `providedCards` 배열로 카드 ID와 장수를 지정
2. **Ship → Grid**: 우주선이 그리드를 소유 (1:1). `grid.validCells`로 배치 가능한 셀 결정
3. **Equipment → Grid**: 장비가 그리드에 배치 (N:1). `PlacedEquipment`로 위치/회전 추적
4. **Card → StatusEffect**: 카드가 상태이상을 부여 (N:N). `CardEffect.statusEffect`로 연결
5. **Enemy → Zone**: 적이 특정 구역에 등장 (N:N). `zoneIds` 배열로 매핑
6. **RunState → Ship**: 런 세이브가 선택된 우주선을 참조 (N:1)

---

*이 문서는 Planning.md의 게임 설계를 기반으로 작성되었으며, 개발 진행에 따라 업데이트됩니다.*
