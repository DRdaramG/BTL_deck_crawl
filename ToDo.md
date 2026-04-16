# BTL Deck Crawl — 개발 진척 관리 (ToDo)

> **최종 수정일**: 2026-04-16  
> **관련 문서**: `Planning.md`, `battle_info.md`, `db_info.md`

---

## 디자인 원칙

- **Lowtech Sci-Fi**: 함선의 함장실에서 콘솔을 통해 함선을 컨트롤하는 느낌
- **UTF-8**: 한글 입출력이 용이하도록 UTF-8 환경에서 동작하도록 함.
- **ASCII ART** 기반 UI — 꼭 필요한 곳에만 이미지 사용 (현 시점에서는 blank image로 대체)
- **Docker** 기반 배포 — 원격 서버에 올려 웹 브라우저를 통해 접속·플레이
- **멀티플레이어**는 싱글 플레이가 완성된 이후 개발 착수

---

## M0 — 기획 단계

- [x] 게임 디자인 문서 작성 (`Planning.md`)
- [x] 데이터베이스 설계 문서 작성 (`db_info.md`)
- [x] 전투 흐름 문서 작성 (`battle_info.md`)
- [x] 정적 데이터 타입 정의 (`src/data/types.ts`)
- [x] 카드 데이터 정의 (`src/data/cards.ts` — 191종)
- [x] 장비 데이터 정의 (`src/data/equipment.ts` — 233종)
- [x] 우주선 데이터 정의 (`src/data/ships.ts` — 10종)
- [x] 상태이상 데이터 정의 (`src/data/statusEffects.ts` — 8종)
- [x] 구역/적 데이터 정의 (`src/data/zones.ts` — 구역 4개, 적 14종)
- [x] 이벤트 데이터 정의 (`src/data/events.ts` — 4종)
- [x] ToDo 체크리스트 작성 (`ToDo.md`)

---

## M1 — 프로토타입 (싱글 플레이 핵심 루프)

### 프로젝트 세팅

- [x] TypeScript + 번들러(Vite) 프로젝트 초기 세팅
- [x] Phaser 4 도입 및 기본 씬 구성 (`BootScene`, `ShipSelectScene`, `ShipSetupScene`, `BattleScene`, `RewardScene`)
- [x] 개발 서버(dev server) 구성 — `npm run dev` (Vite dev server, port 3000)
- [x] ASCII ART 렌더링 파이프라인 구축 (lowtech scifi 콘솔 느낌)
- [x] 폰트 선정 — D2Coding 모노스페이스 폰트 적용

### 그리드 시스템

- [x] 그리드 데이터 모델 구현 (`src/systems/grid/GridModel.ts` — 2D 배열, 셀 상태: EMPTY / OCCUPIED / BLOCKED)
- [x] 폴리오미노 배치 로직 구현 (`src/systems/grid/Polyomino.ts` — 회전 0°/90°/180°/270°)
- [x] 충돌 감지 로직 구현 (`GridModel.canPlace()` — 겹침 방지)
- [x] 장비 배치/탈착 시 덱 자동 업데이트
- [x] ASCII ART 기반 그리드 렌더링 (`ShipSetupScene`)

### 장비 배치 UI

- [x] 드래그 앤 드롭 장비 배치 인터페이스 (`ShipSetupScene`)
- [x] 배치 가능/불가 피드백 (하이라이트)
- [x] 장비 회전 조작 (우클릭 or 버튼)
- [x] 현재 덱 미리보기 패널 (실시간 업데이트)

### 덱 / 카드 시스템

- [x] 덱 클래스 구현 (`src/systems/deck/Deck.ts` — 대기열 Queue, 손패 Hand, 소진 Exhaust, 제외 Exclude)
- [x] 셔플, 드로우, 버리기 기능
- [x] 덱 리로드 로직 (대기열 소진 시 Exhaust → Queue)
- [x] 카드 효과 실행 엔진 (`src/systems/combat/CardEffectEngine.ts` — damage, block, heal, evade, apply_status 등 17종)

### 전투 시스템

- [x] 전투 시작 세팅 (`src/systems/combat/CombatState.ts` — 턴 순서 결정)
- [x] EP(Energy Point) 자원 관리
- [x] 턴(프레임) 진행 루프 (드로우 → EP 수급 → 패시브 → 카드 플레이 → 소진)
- [x] 피해 판정 순서 구현 (쉴드 → 장갑 → HP, sensor_jam/armor_break 적용)
- [x] 장비 파손 처리 (피탄 시 해당 장비 카드 사용불가)
- [x] 게임오버 조건 (선원실 전멸)
- [x] 적 AI — 의도(intent) 패턴 기반 행동
- [x] 상태이상 처리 (burn, overload, EMP, repair, ion, scramble, armor_break, sensor_jam)
- [x] 단일 전투 씬 완성 (BattleScene UI — 플레이어 vs 적 1체)

### 전투 UI (ASCII ART 콘솔 스타일)

- [x] 적 HP / 의도 표시 (ASCII 기반)
- [x] 내 HP / 쉴드 / 장갑 / EP 게이지 표시
- [x] 핸드 카드 표시 (최대 7장) — ASCII 카드 프레임
- [x] 드로우 덱/소진 덱 잔여 수 표시
- [x] 카드 상세 효과 툴팁
- [x] 전투 로그 콘솔 (터미널 스크롤 느낌)

### 전투 후 보상

- [x] 전투 승리 시 보상 화면 (장비 3개 중 1개 선택)
- [x] 스크랩/데이터 코어 획득 표시

---

## M2 — 알파 (구역 1 완주 가능)

### 스테이지 맵

- [x] 맵 노드 생성 로직 (분기 경로)
- [x] 노드 타입 배치 (전투, 엘리트, 보스, 상점, 이벤트, 수리 기지)
- [x] 스테이지 맵 UI (ASCII ART 맵)
- [x] 노드 선택 및 진행 처리

### 함선 선택

- [x] 함선 선택 화면 (`ShipSelectScene` — 10종 함선 카드형 UI)
- [x] 함선별 스탯/패시브/시작 장비 표시
- [x] ASCII ART 함선 외형 표시 (그리드 프리뷰)

### 상점

- [x] 상점 UI (장비 3–5개 진열)
- [x] 장비 구매 (스크랩 소모)
- [x] 카드 업그레이드 서비스
- [x] 장비 제거(덱 압축) 서비스

### 이벤트

- [x] 이벤트 화면 UI (선택지 표시)
- [x] 이벤트 효과 처리 (HP 변동, 장비 획득, 재화 변동 등)
- [x] 랜덤 결과 처리 (확률 기반)

### 수리 기지

- [x] 수리 기지 UI (HP 회복 + 장비 재배치)
- [x] 함선 내구도 회복 로직

### 데이터 확장

- [x] 10종 이상 장비 밸런스 조정 및 확정 (233종 등록 완료)
- [ ] 구역 1 적 데이터 (일반, 엘리트, 보스) 확정
- [ ] 구역 1 이벤트 세트 완성

---

## M3 — 베타 (풀 런 플레이 가능)

### 콘텐츠 확장

- [ ] 구역 2 (성운 지대) 적/이벤트 완성
- [ ] 구역 3 (적 본거지) 적/이벤트 완성
- [ ] 최종 보스 (보이드 리바이어던) 구현
- [ ] 전체 장비 목록 밸런스 완료
- [ ] 전체 카드 밸런스 완료

### 저장/불러오기

- [ ] LocalStorage 기반 런 세이브 구현 (`RunState` 직렬화)
- [ ] 자동 저장 (노드 이동 시)
- [ ] 저장 불러오기 UI

### UI 메뉴

- [ ] 메인 메뉴 화면 (ASCII ART 타이틀)
- [ ] 설정 화면 (볼륨, 언어 등)
- [ ] 런 종료 결과 화면 (통계 표시)

---

## M4 — 정식 배포

### Docker 배포

- [ ] Dockerfile 작성 (프론트엔드 빌드 + 웹 서버)
- [ ] docker-compose.yml 작성 (서비스 구성)
- [ ] 정적 파일 서빙용 웹 서버 설정 (Nginx 등)
- [ ] 환경 변수 및 설정 파일 구성
- [ ] Docker 이미지 빌드 및 테스트
- [ ] 원격 서버 배포 스크립트 / CI·CD 파이프라인 구성
- [ ] HTTPS 설정 (Let's Encrypt 등)
- [ ] 헬스체크 및 모니터링 설정

### 폴리싱

- [ ] UI 전반 폴리싱 (ASCII ART 정교화, 애니메이션)
- [ ] 이미지가 필요한 부분 식별 → blank image 적용 (추후 실제 이미지 교체)
- [ ] 사운드/BGM 도입 (Howler.js 등)
- [ ] 밸런스 최종 조정
- [ ] 모바일 터치 대응 검토

### 리더보드 (선택)

- [ ] 백엔드 서버 구성 (Node.js + Express + SQLite or Firebase)
- [ ] 리더보드 API 구현
- [ ] 리더보드 UI

---

## M5 — 멀티플레이어 (싱글 플레이 완성 후 착수)

> **보류**: 싱글 플레이가 안정적으로 동작할 때까지 개발을 보류한다.

- [ ] 멀티플레이어 아키텍처 설계 (WebSocket 등)
- [ ] 서버 사이드 게임 상태 관리
- [ ] PvP 전투 로직 구현
- [ ] 매칭 시스템
- [ ] 동기화 및 지연 보상 처리
- [ ] 멀티플레이어 전용 UI
- [ ] 멀티플레이어 밸런스 조정
- [ ] Docker 구성 업데이트 (게임 서버 컨테이너 추가)

---

*이 문서는 개발 진행에 따라 지속적으로 업데이트합니다.*
