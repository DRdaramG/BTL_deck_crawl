# BTL Deck Crawl

> **장르**: 덱빌딩 로그라이크 + 우주선 관리 웹 게임  
> **콘셉트**: 우주선을 퍼즐처럼 꾸미고, 테트리스형 장비를 배치하며, 카드 덱으로 전투하는 웹 게임

## 기술 스택

| 역할 | 기술 |
|------|------|
| 게임 엔진 | [Phaser 4](https://phaser.io/) (Canvas/WebGL) |
| 언어 | TypeScript (strict mode) |
| 번들러 | [Vite 8](https://vite.dev/) |
| 폰트 | D2Coding (모노스페이스) |
| UI 스타일 | ASCII ART 기반 lowtech sci-fi 콘솔 |

## 프로젝트 구조

```
BTL_deck_crawl/
├── index.html              # 진입 HTML
├── package.json            # 프로젝트 설정
├── tsconfig.json           # TypeScript 설정
├── vite.config.ts          # Vite 번들러 설정
├── public/
│   └── fonts/              # D2Coding 폰트 파일
├── src/
│   ├── main.ts             # Phaser Game 초기화
│   ├── data/               # 정적 게임 데이터 (카드 191종, 장비 233종, 함선 10종 등)
│   │   ├── types.ts        # 타입/인터페이스 정의
│   │   ├── cards.ts        # 카드 데이터
│   │   ├── equipment.ts    # 장비 데이터
│   │   ├── ships.ts        # 우주선 데이터
│   │   ├── statusEffects.ts # 상태이상 데이터
│   │   ├── zones.ts        # 구역/적 데이터
│   │   ├── events.ts       # 이벤트 데이터
│   │   └── index.ts        # 데이터 모듈 진입점
│   ├── scenes/             # Phaser 씬
│   │   ├── BootScene.ts    # 부팅 애니메이션
│   │   ├── ShipSelectScene.ts # 함선 선택
│   │   ├── ShipSetupScene.ts  # 장비 배치
│   │   ├── BattleScene.ts  # 전투 (구현 중)
│   │   └── RewardScene.ts  # 보상 (구현 중)
│   └── systems/            # 게임 로직
│       ├── grid/           # 그리드 배치 (폴리오미노 회전, 충돌 감지)
│       ├── deck/           # 덱 관리 (셔플, 드로우, 버리기)
│       └── combat/         # 전투 (턴 관리, 카드 효과, 상태이상)
├── Planning.md             # 게임 기획서
├── ToDo.md                 # 개발 진척 관리
├── db_info.md              # 데이터베이스 설계 문서
└── battle_info.md          # 전투 흐름 문서
```

## 실행 방법

```bash
# 의존성 설치
npm install

# 개발 서버 실행 (localhost:3000)
npm run dev

# TypeScript 타입 검사
npm run typecheck

# 프로덕션 빌드
npm run build

# 빌드 결과물 미리보기
npm run preview
```

## 개발 현황

현재 **M1 (프로토타입)** 단계 진행 중입니다.

- ✅ M0 — 기획 완료 (기획서, 데이터 설계, 전투 흐름 문서, 정적 데이터)
- 🔧 M1 — 프로토타입 (프로젝트 세팅 완료, 그리드/덱/전투 시스템 구현, 전투 UI 구현 중)
- ⬜ M2 — 알파 (구역 1 완주 가능)
- ⬜ M3 — 베타 (풀 런 플레이 가능)
- ⬜ M4 — 정식 배포

자세한 진행 상황은 [ToDo.md](./ToDo.md)를 참고하세요.

## 참고 문서

- [Planning.md](./Planning.md) — 게임 기획서
- [db_info.md](./db_info.md) — 데이터베이스 설계 문서
- [battle_info.md](./battle_info.md) — 전투 흐름 문서

## 라이선스

ISC
