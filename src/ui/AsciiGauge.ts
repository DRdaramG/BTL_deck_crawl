// ============================================================
// BTL Deck Crawl — AsciiGauge (ASCII 게이지 바)
// ============================================================
// HP, 실드, EP 등의 수치를 ASCII 텍스트 바로 표현한다.

/**
 * 수치를 ASCII 게이지 바 문자열로 변환한다.
 *
 * @param current 현재 값
 * @param max     최대 값
 * @param width   바 전체 칸 수 (괄호 포함)
 * @param fillChar 채움 문자 (기본: "█")
 * @param emptyChar 빈 문자 (기본: "░")
 * @returns 예시: `[████████░░░░] 80/100`
 */
export function gauge(
  current: number,
  max: number,
  width: number = 20,
  fillChar: string = "█",
  emptyChar: string = "░",
): string {
  const ratio = max > 0 ? Math.max(0, Math.min(1, current / max)) : 0;
  const filled = Math.round(ratio * width);
  const empty = width - filled;
  return `[${fillChar.repeat(filled)}${emptyChar.repeat(empty)}] ${current}/${max}`;
}

/**
 * 간단한 숫자 표시 (라벨 + 값).
 *
 * @example stat("HP", 60) → "HP: 60"
 */
export function stat(label: string, value: number | string): string {
  return `${label}: ${value}`;
}

/**
 * EP(에너지 포인트)를 채워진 원/빈 원으로 표시한다.
 *
 * @example epDots(3, 5) → "●●●○○"
 */
export function epDots(
  current: number,
  max: number,
  filledChar: string = "●",
  emptyChar: string = "○",
): string {
  const filled = Math.max(0, Math.min(max, current));
  return filledChar.repeat(filled) + emptyChar.repeat(max - filled);
}
