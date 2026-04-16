# BTL Deck Crawl — 데이터베이스 설계 문서 (db_info.md)

> **최종 수정일**: 2026-04-16  
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
**총 등록 수**: 191종

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `string` | 카드 고유 ID |
| `name` | `string` | 카드 이름 (한글) |
| `type` | `CardType` | `"attack"` / `"defense"` / `"skill"` / `"passive"` |
| `epCost` | `number` | 에너지 포인트 비용 |
| `description` | `string` | 효과 설명 |
| `effects` | `CardEffect[]` | 효과 상세 목록 |

#### CardEffect 구조

| 필드 | 타입 | 설명 |
|------|------|------|
| `type` | `CardEffectType` | 효과 종류 (아래 표 참조) |
| `value` | `number?` | 수치 값 |
| `hitCount` | `number?` | 멀티히트 횟수 |
| `statusEffect` | `StatusEffectId?` | 부여할 상태이상 |
| `statusStacks` | `number?` | 상태이상 스택 수 |
| `duration` | `number?` | 지속 턴 수 |

#### CardEffect 효과 종류

| 타입 | 설명 |
|------|------|
| `damage` | 단일 대상 피해 |
| `damage_all` | 전체 대상 피해 |
| `multi_hit` | 다중 타격 (value × hitCount) |
| `block` | 블록(방어) 수치 획득 |
| `heal` | HP 회복 |
| `passive_heal` | 패시브 턴 시작 HP 회복 |
| `evade` | 공격 회피 (duration 턴 동안) |
| `apply_status` | 상태이상 부여 |
| `reduce_ap` | 다음 카드 AP 비용 감소 |
| `restore_ap` | AP 복원 |
| `damage_reduction` | 피해 감소 |
| `damage_reflect` | 피해 반사 |
| `draw_card` | 카드 드로우 |
| `exhaust_card` | 카드 소진 |
| `salvage` | 스크랩 획득 |
| `self_damage` | 자해 피해 (페널티) |
| `boost_damage` | 피해량 증가 (패시브) |
| `boost_multi_hit` | 다중 타격 횟수 증가 (패시브) |

#### 카드 타입별 분포

| 타입 | 수량 | 대표 예시 |
|------|------|-----------|
| `attack` | 88종 | 레이저 사격, 플라즈마 버스트, 레일건 관통, 미사일 발사 |
| `skill` | 64종 | 긴급 회피, 사기 진작, 응급 처치, ECM 교란, 커패시터 |
| `defense` | 36종 | 에너지 실드, 강화 선체, 반사 실드, 요새 배리어 |
| `passive` | 3종 | 생명 유지, 정밀 생명 유지, 고급 생명 유지 |

#### 기본 카드 목록 (대표 13종)

| ID | 이름 | 타입 | EP | 효과 |
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

> **참고**: 나머지 178종의 카드는 장비 등급(common/rare/epic/legendary) 및 크기(소형/중형/대형) 변형이며, 기본 카드의 수치를 스케일링한 형태이다.

---

### 3-2. 장비 (EquipmentDefinition)

**파일**: `src/data/equipment.ts`  
**키**: `EQUIPMENT` (Record<string, EquipmentDefinition>)  
**총 등록 수**: 233종

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

#### 장비 카테고리 (EquipmentCategory) — 13종

| 값 | 설명 | 수량 |
|----|------|------|
| `weapon` | 공격 카드 생성 (레이저, 레일건, 이온, 플라즈마, 펄스) | 64 |
| `modification` | 장비 개조 (속사, 파워, 정밀, 소이, 과부하, 이온, AOE, EW, 실드, 장갑파괴) | 40 |
| `electronic_warfare` | 전자전 장비 (ECM, 센서 교란, 해킹, 전술 스캐너) | 24 |
| `shield` | 방어/블록 카드 (실드 발생기, 강화 선체, 반사 실드, 배리어) | 21 |
| `drone_bay` | 드론 격납고 (수리/회수/빔/미사일/자폭 드론) | 20 |
| `missile` | 미사일 장비 (소형/중형/대형) | 13 |
| `hangar` | 함재기 격납고 (전투기/폭격기/EVA) | 12 |
| `armor` | 장갑 장비 (소형/중형/대형) | 12 |
| `generator` | 동력원/제너레이터 (소형/중형/대형) | 12 |
| `engine` | 이동/회피 카드 (부스터, 워프) | 5 |
| `life_support` | 지속 HP 회복 패시브 | 4 |
| `crew_quarter` | 버프/회복 카드 (거주 구역) | 3 |
| `med_bay` | 치유/상태이상 제거 | 3 |

#### 장비 등급별 분포

| 등급 | 색상 | 수량 |
|------|------|------|
| `common` | 회색 | 58 |
| `rare` | 파랑 | 60 |
| `epic` | 보라 | 61 |
| `legendary` | 황금 | 54 |

#### 카테고리 × 등급 분포표

| 카테고리 | Common | Rare | Epic | Legendary | 합계 |
|----------|--------|------|------|-----------|------|
| weapon | 16 | 17 | 16 | 15 | 64 |
| modification | 10 | 10 | 10 | 10 | 40 |
| electronic_warfare | 6 | 6 | 6 | 6 | 24 |
| shield | 4 | 5 | 7 | 5 | 21 |
| drone_bay | 5 | 5 | 5 | 5 | 20 |
| missile | 4 | 3 | 3 | 3 | 13 |
| hangar | 3 | 3 | 3 | 3 | 12 |
| armor | 3 | 3 | 3 | 3 | 12 |
| generator | 3 | 3 | 3 | 3 | 12 |
| engine | 1 | 2 | 2 | 0 | 5 |
| life_support | 1 | 1 | 1 | 1 | 4 |
| crew_quarter | 1 | 1 | 1 | 0 | 3 |
| med_bay | 1 | 1 | 1 | 0 | 3 |

#### 기본 장비 목록 (대표 13종)

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

> **참고**: 나머지 220종의 장비는 크기(소형/중형/대형) × 등급(common/rare/epic/legendary) 변형이며, 기본 장비의 수치를 스케일링한 형태이다.

---

### 3-3. 우주선 (ShipDefinition)

**파일**: `src/data/ships.ts`  
**키**: `SHIPS` (Record<string, ShipDefinition>)  
**총 등록 수**: 10종

| 필드 | 타입 | 설명 |
|------|------|------|
| `id` | `ShipId` | 우주선 고유 ID |
| `name` | `string` | 영문 이름 |
| `nameKo` | `string` | 한글 이름 |
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

#### 현재 등록 우주선 (10종)

| ID | 한글명 | 그리드 | 유효 셀 | 최대 HP | 시작 장비 | 패시브 |
|----|--------|--------|---------|---------|-----------|--------|
| `corvette` | 초계함 | 10×9 | 50 | 60 | 부스터 엔진 + 레이저 캐논 + 실드 발생기 | 회피 카드 사용 시 AP +1 복원 |
| `frigate` | 호위함 | 10×9 | 58 | 70 | 플라즈마 건 + 실드 발생기 + 선원실 A | 공격 카드 사용 시 피해 +2 |
| `destroyer` | 구축함 | 12×7 | 66 | 80 | 레일건 + 미사일 런처 + 부스터 엔진 | 공격 카드 사용 시 피해 +3 |
| `cruiser` | 순양함 | 11×9 | 75 | 90 | 플라즈마 건 + 실드 발생기 + 선원실 A + 의무실 | 없음 (범용) |
| `cargo_ship` | 화물선 | 10×9 | 72 | 75 | 레이저 캐논 + 강화 선체 + 생명유지 + 선원실 A | 턴 시작 시 HP 3 회복 |
| `drone_carrier` | 드론항모 | 11×9 | 79 | 85 | 빔 드론 + 수리 드론 + 실드 발생기 | 드론 카드 사용 시 효과 +3 |
| `assault_ship` | 상륙강습함 | 10×11 | 84 | 100 | 플라즈마 건 + 미사일 런처 + 실드 발생기 + 선원실 A | 공격 카드 사용 시 피해량 경감 2 획득 |
| `battlecruiser` | 순양전함 | 14×9 | 90 | 120 | 레일건 + 플라즈마 건 + 부스터 엔진 + 실드 발생기 | 적 처치 시 카드 1장 드로우 |
| `carrier` | 항모 | 13×11 | 97 | 110 | 전투기 행거 + 폭격기 행거 + 실드 발생기 + 생명유지 | 턴 시작 시 AP +1 복원 |
| `battleship` | 전함 | 13×11 | 103 | 150 | 레일건 + 강화 선체 + 생명유지 + 실드 발생기 | 블록 카드 효과 +5 |

#### 함선 급 분류 (battle_info.md 참조)

| 급 | 행동 순서 | 해당 함선 |
|----|-----------|-----------|
| 소형 기체 | 1 (가장 빠름) | 초계함 (corvette) |
| 중형 기체 | 2 | 호위함 (frigate) |
| 상업용 기체 | 3 | 화물선 (cargo_ship) |
| 구축함 | 4 | 구축함 (destroyer) |
| 순양함 | 5 | 순양함 (cruiser) |
| 중순양함 | 6 | 드론항모 (drone_carrier) |
| 경전함 | 7 | 상륙강습함 (assault_ship) |
| 순양전함 | 8 | 순양전함 (battlecruiser) |
| 전함 | 9 | 전함 (battleship) |
| 거대전함 | 10 (가장 느림) | 항모 (carrier) |

---

### 3-4. 상태이상 (StatusEffectDefinition)

**파일**: `src/data/statusEffects.ts`  
**키**: `STATUS_EFFECTS` (Record<string, StatusEffectDefinition>)  
**총 등록 수**: 8종

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

#### 현재 등록 상태이상 (8종)

| ID | 이름 | 효과 | 발동 시점 | 스택당 수치 | 행동 불가 |
|----|------|------|-----------|-------------|-----------|
| `burn` | 화상 | 매 턴 스택 당 1 피해 | 턴 종료 | -1 | 아니오 |
| `overload` | 과부하 | 다음 공격 2배 + 1턴 불가 | — | 2 (배율) | 예 |
| `emp` | EMP | 1턴 카드 사용 불가 | 턴 시작 | 0 | 예 |
| `repair` | 수리중 | 매 턴 스택 당 1 회복 | 턴 시작 | 1 | 아니오 |
| `ion` | 이온화 | 매 턴 스택 당 1 피해, 3스택 시 EMP | 턴 종료 | -1 | 아니오 |
| `scramble` | 스크램블 | 카드 AP 비용 +1 증가 | 턴 시작 | 1 | 아니오 |
| `armor_break` | 장갑 파괴 | 받는 피해 스택 당 1 증가 | — | 1 | 아니오 |
| `sensor_jam` | 센서 교란 | 공격 적중률 50% 감소 | 턴 시작 | 0 | 아니오 |

#### 상태이상 분류

| 분류 | 해당 상태이상 |
|------|---------------|
| 유해 효과 | burn, overload, emp, ion, scramble, armor_break, sensor_jam |
| 유익 효과 | repair |
| 턴 종료 발동 | burn, ion |
| 턴 시작 발동 | emp, repair, scramble, sensor_jam |
| 즉발/조건부 | overload, armor_break |
| 행동 불가 | overload, emp |

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

#### 현재 등록 적 (15종)

| 구역 | 일반 적 | 엘리트 | 보스 |
|------|---------|--------|------|
| 1 | 해적 정찰기 (20HP), 해적 전투기 (30HP), 해적 약탈선 (25HP) | 해적 간부선 (50HP) | 해적 모선 (100HP) |
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
| `zoneIds` | `number[]?` | 등장 가능한 구역 ID 목록 (생략 시 모든 구역에서 등장) |
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

#### 현재 등록 이벤트 (7종)

| ID | 이름 | 구역 | 선택지 A | 선택지 B |
|----|------|------|----------|----------|
| `drifting_wreckage` | 표류하는 잔해 | 공통 | 60% 랜덤 장비 / 40% HP-5 | 무시 |
| `injured_crew` | 부상당한 선원 | 공통 | 선원실 획득 + HP-3 | 무시 |
| `mysterious_station` | 신비로운 공간 기지 | 공통 | 50% 최대HP+10 / 50% 저주 장비 | 지나침 |
| `broken_arms_dealer` | 고장난 무기 거래상 | 공통 | 스크랩-50 + 장비 구매 | 희귀 장비 + 적 강화 |
| `asteroid_mining` | 소행성 채굴 현장 | 1 | 50% 스크랩+30 / 30% 데이터코어+1 / 20% HP-8 | 무시 |
| `pirate_ambush` | 해적 매복 | 1 | 스크랩-25 안전 통과 | 60% 장비+스크랩 / 40% HP-10 |
| `abandoned_outpost` | 버려진 전초기지 | 1 | 40% 희귀장비 / 30% 스크랩+40 / 30% HP-6+적강화 | 무시 |

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
| `EquipmentCategory` | `"weapon"` \| `"missile"` \| `"armor"` \| `"shield"` \| `"generator"` \| `"engine"` \| `"crew_quarter"` \| `"med_bay"` \| `"life_support"` \| `"drone_bay"` \| `"electronic_warfare"` \| `"hangar"` \| `"modification"` |
| `CardType` | `"attack"` \| `"defense"` \| `"skill"` \| `"passive"` |
| `StatusEffectId` | `"burn"` \| `"overload"` \| `"emp"` \| `"repair"` \| `"ion"` \| `"scramble"` \| `"armor_break"` \| `"sensor_jam"` |
| `NodeType` | `"battle"` \| `"elite"` \| `"boss"` \| `"shop"` \| `"event"` \| `"repair"` |
| `ShipId` | `"corvette"` \| `"frigate"` \| `"destroyer"` \| `"cruiser"` \| `"battlecruiser"` \| `"battleship"` \| `"cargo_ship"` \| `"assault_ship"` \| `"drone_carrier"` \| `"carrier"` |
| `Rotation` | `0` \| `90` \| `180` \| `270` |
| `CurrencyType` | `"scrap"` \| `"data_core"` |

### ShipPassive 타입

| 필드 | 가능한 값 |
|------|-----------|
| `trigger` | `"on_evade_card"` \| `"on_block_card"` \| `"on_attack_card"` \| `"on_drone_card"` \| `"on_turn_start"` \| `"on_kill"` \| `"none"` |
| `effectType` | `"restore_ap"` \| `"add_block"` \| `"add_damage"` \| `"heal"` \| `"gain_currency"` \| `"damage_reduction"` \| `"draw_card"` \| `"none"` |

---

## 6. 파일 구조

```
src/
├── main.ts                # Phaser Game 초기화 (씬 등록, 스케일 설정)
├── scenes/                # Phaser 씬
│   ├── BootScene.ts       # 부팅 애니메이션 (터미널 스타일)
│   ├── ShipSelectScene.ts # 함선 선택 (10종 카드형 UI)
│   ├── ShipSetupScene.ts  # 장비 배치 (그리드 + 드래그&드롭)
│   ├── StageMapScene.ts   # 스테이지 맵 (구역별 노드 맵 UI)
│   ├── BattleScene.ts     # 전투 (구현 완료)
│   ├── RewardScene.ts     # 보상 (구현 완료)
│   ├── ShopScene.ts       # 상점 (장비 구매, 카드 업그레이드, 장비 제거)
│   ├── EventScene.ts      # 이벤트 (선택지 기반 랜덤 이벤트, 효과 처리)
│   └── RepairScene.ts     # 수리 기지 (HP 회복)
├── systems/               # 게임 시스템 로직
│   ├── grid/
│   │   ├── GridModel.ts   # 그리드 모델 (셀 상태, 배치/제거, 충돌 감지)
│   │   └── Polyomino.ts   # 폴리오미노 회전/정규화 유틸
│   ├── deck/
│   │   └── Deck.ts        # 덱 관리 (Queue/Hand/Exhaust/Exclude)
│   ├── combat/
│   │   ├── CardEffectEngine.ts  # 카드 효과 실행 (17종 효과, 상태이상 처리)
│   │   └── CombatState.ts      # 전투 상태 머신 (턴 진행, EP, 적 AI)
│   └── stage/
│       └── StageMapGenerator.ts # 맵 노드 생성 (분기 경로, 노드 타입 배치)
└── data/
    ├── index.ts           # 데이터 모듈 진입점 (모든 export 집합)
    ├── types.ts           # 전체 타입/인터페이스 정의
    ├── cards.ts           # 카드 정의 데이터 (191종)
    ├── equipment.ts       # 장비 정의 데이터 (233종)
    ├── ships.ts           # 우주선 정의 데이터 (10종)
    ├── statusEffects.ts   # 상태이상 정의 데이터 (8종)
    ├── zones.ts           # 구역 정의 (4개) + 적 정의 (15종)
    └── events.ts          # 이벤트 정의 데이터 (7종: 공통 4 + 구역 1 전용 3)
```

---

## 7. 데이터 관계도 (ER Diagram)

```
┌──────────────┐     provides      ┌──────────────┐
│  Equipment   │──────────────────▶│     Card     │
│              │   (1:N cards)     │              │
│  - id        │                   │  - id        │
│  - category  │                   │  - type      │
│  - grade     │                   │  - epCost    │
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

## 8. 미결 질문 / 추후 보완 필요 사항

> 아래 항목들은 M1 (프로토타입) 구현 전에 확인이 필요한 사항입니다.  
> 인간 개발자가 내용을 보강하면 이 섹션에서 해당 항목을 삭제합니다.

### Q1. 함선 컴퓨터 장비 카테고리

`battle_info.md` 2-1절에서 "함선 컴퓨터의 성능에 따라 드로우 수가 결정된다"고 명시하고 있으나, 현재 `EquipmentCategory`에 `computer` 카테고리가 없다.

- 드로우 수는 어떤 장비/속성으로 결정되는가?
- `electronic_warfare` 카테고리의 일부가 컴퓨터 역할을 하는가?
- 별도의 `computer` 카테고리를 추가해야 하는가?

### Q2. 레이더 탐지 범위 데이터

`battle_info.md` 1-1절에서 전투 시작 거리가 "레이더 탐지 범위"에 의해 결정된다고 명시하고 있으나, 현재 장비 데이터에 `radarRange` 같은 수치 필드가 없다.

- 레이더 범위는 `electronic_warfare` 카테고리 장비의 속성으로 추가되는가?
- `EquipmentDefinition`에 `radarRange?: number` 필드를 추가해야 하는가?
- 기본 함선별 레이더 범위가 있는가?

### Q3. EP(Energy Point)와 AP(Action Point) 관계

`battle_info.md`에서는 EP와 AP를 복합적으로 관리한다고 되어 있고, `generator` 카테고리 장비가 EP를 생성한다. 그런데 `CardDefinition`에는 `epCost`만 있고 `apCost`는 별도로 없다.

- EP와 AP는 같은 자원인가, 별도 자원인가?
- 별도 자원이라면, 카드에 `apCost` 필드를 추가하고 장비에 `epGeneration` 필드를 추가해야 하는가?
- `generator` 카테고리 장비가 현재 `draw_card`와 `restore_ap` 카드 효과를 제공하는데, 이것이 EP 수급 역할을 대체하는 것인가?

### Q4. 브릿지 / 함장실 데이터

`battle_info.md` 3-3절에서 게임오버 조건으로 "브릿지 + 함장실 + 선원실이 모두 파괴"를 명시하고 있으나, 현재 데이터에는 `crew_quarter` 카테고리만 존재한다.

- 브릿지(Bridge)와 함장실(Captain's Quarters)은 별도 장비 카테고리로 추가되는가?
- 그리드의 특정 셀에 고정 배치되는 구역인가?
- 파괴 불가능한 핵심 구역인가, 아니면 장비처럼 피탄 시 파괴 가능한가?

### Q5. 엔진 출력 수치

`battle_info.md` 1-3절에서 동일 급 함선의 턴 순서를 "엔진 총 출력"으로 결정한다고 되어 있으나, 현재 `EquipmentDefinition`에 `enginePower` 같은 수치 필드가 없다.

- 엔진 출력은 장비 데이터에 추가할 필드인가?
- 엔진 카테고리 장비의 `shape.cells.length` (크기)로 출력을 대체하는가?

### Q6. Planning.md와 현재 데이터의 차이

`Planning.md`는 현재 데이터에 맞게 10종 함선으로 업데이트되었다. 추가적인 변경이 있을 때 해당 문서를 함께 업데이트해야 한다.

---

*이 문서는 Planning.md의 게임 설계를 기반으로 작성되었으며, 개발 진행에 따라 업데이트됩니다.*
