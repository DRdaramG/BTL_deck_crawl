// ============================================================
// BTL Deck Crawl — Theme (색상 팔레트 · 폰트 · 스타일 상수)
// ============================================================
// "Lowtech Sci-Fi 콘솔" 느낌의 시각 테마를 한 곳에서 관리한다.

import type * as Phaser from "phaser";

// ─── Color Palette ──────────────────────────────────────────

/** 주요 UI 색상. 모든 씬에서 동일한 색상을 사용한다. */
export const Color = {
  /** 기본 콘솔 녹색 (primary) */
  GREEN: "#00ff41",
  /** 정보·선택 강조 (cyan) */
  CYAN: "#00aaff",
  /** 경고·선택 중 (yellow / amber) */
  YELLOW: "#ffaa00",
  /** 오류·불가 (red) */
  RED: "#ff4444",
  /** 비활성·보조 텍스트 (dim grey) */
  DIM: "#888888",
  /** 에픽 등급 (purple) */
  PURPLE: "#cc66ff",
  /** 배경색 */
  BG: "#0a0a0a",
  /** 매우 어두운 회색 (blocked cell 등) */
  DARK: "#333333",
} as const;

/** 장비 등급별 색상 */
export const GradeColor: Record<string, string> = {
  common: Color.DIM,
  rare: Color.CYAN,
  epic: Color.PURPLE,
  legendary: Color.YELLOW,
} as const;

// ─── Font ───────────────────────────────────────────────────

/** 기본 모노스페이스 폰트 패밀리 */
export const FONT_FAMILY = "D2Coding";

/**
 * D2Coding 반각 문자 폭 (px) — fontSize 16px 기준.
 * 전각(CJK) 문자는 이 값의 2배이다.
 */
export const CHAR_HALF_W = 9.6;

// ─── Shared Text Styles ────────────────────────────────────

/** 씬 제목 스타일 (24 px, green) */
export const TITLE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: FONT_FAMILY,
  fontSize: "24px",
  color: Color.GREEN,
};

/** 부제목 / 보조 스타일 (14 px, dim) */
export const SUBTITLE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: FONT_FAMILY,
  fontSize: "14px",
  color: Color.DIM,
};

/** 기본 본문 스타일 (16 px, green) */
export const BODY_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: FONT_FAMILY,
  fontSize: "16px",
  color: Color.GREEN,
  lineSpacing: 0,
};

/** 도움말 / 힌트 스타일 (12 px, dim) */
export const HELP_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: FONT_FAMILY,
  fontSize: "12px",
  color: Color.DIM,
};

/** 부트 씬 콘솔 줄 스타일 (18 px, green) */
export const CONSOLE_LINE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: FONT_FAMILY,
  fontSize: "18px",
  color: Color.GREEN,
};

/**
 * 녹색 배경 + 검정 글자 버튼 스타일.
 * padding은 호출 시 override 가능.
 */
export const BUTTON_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: FONT_FAMILY,
  fontSize: "20px",
  color: Color.BG,
  backgroundColor: Color.GREEN,
  padding: { x: 24, y: 8 },
};

// ─── Grid Cell Characters ──────────────────────────────────

/** 그리드 셀 표현 문자 (각 2 char 폭) */
export const CellChar = {
  EMPTY: "··",
  OCCUPIED: "██",
  BLOCKED: "▒▒",
  PREVIEW_OK: "░░",
  PREVIEW_BAD: "▓▓",
} as const;
