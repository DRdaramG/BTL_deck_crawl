// ============================================================
// BTL Deck Crawl — AsciiText (CJK-aware 문자열 유틸리티)
// ============================================================
// D2Coding 모노스페이스 환경에서 전각(CJK/한글)과 반각(ASCII)을
// 혼용할 때 정확한 폭 계산·정렬·자르기를 제공한다.

// ─── Character Width ────────────────────────────────────────

/**
 * 단일 문자의 콘솔 칸 수를 반환한다.
 * - 한글 음절, CJK 통합 한자, 전각 기호 등 → 2
 * - 나머지 (ASCII, 반각) → 1
 */
export function charWidth(ch: string): number {
  const cp = ch.codePointAt(0) ?? 0;
  return (
    (cp >= 0xac00 && cp <= 0xd7af) || // Hangul Syllables
    (cp >= 0x1100 && cp <= 0x11ff) || // Hangul Jamo
    (cp >= 0x3000 && cp <= 0x9fff) || // CJK Unified + Symbols
    (cp >= 0xf900 && cp <= 0xfaff) || // CJK Compatibility
    (cp >= 0xff01 && cp <= 0xff60) || // Fullwidth Forms
    (cp >= 0x2e80 && cp <= 0x2eff)    // CJK Radicals
  )
    ? 2
    : 1;
}

/**
 * 문자열의 콘솔 표시 폭(칸 수)을 반환한다.
 */
export function displayWidth(s: string): number {
  let w = 0;
  for (const ch of s) {
    w += charWidth(ch);
  }
  return w;
}

// ─── Padding / Alignment ────────────────────────────────────

/**
 * 문자열을 `width` 칸에 맞게 오른쪽을 공백으로 채운다.
 */
export function padEnd(s: string, width: number): string {
  const gap = Math.max(0, width - displayWidth(s));
  return s + " ".repeat(gap);
}

/**
 * 문자열을 `width` 칸에 맞게 왼쪽을 공백으로 채운다.
 */
export function padStart(s: string, width: number): string {
  const gap = Math.max(0, width - displayWidth(s));
  return " ".repeat(gap) + s;
}

/**
 * 문자열을 `innerWidth` 칸 내에서 가운데 정렬하고,
 * 양 옆에 `border` 문자를 붙인다.
 */
export function centerPad(
  content: string,
  innerWidth: number,
  border: string,
): string {
  const gap = Math.max(0, innerWidth - displayWidth(content));
  const pl = Math.floor(gap / 2);
  const pr = gap - pl;
  return `${border}${" ".repeat(pl)}${content}${" ".repeat(pr)}${border}`;
}

/**
 * 문자열을 1칸 들여쓰기 후 `innerWidth` 칸에 맞게 왼쪽 정렬하고,
 * 양 옆에 `border` 문자를 붙인다.
 */
export function leftPad(
  content: string,
  innerWidth: number,
  border: string,
): string {
  let text = content;
  const maxContent = innerWidth - 1; // 1-space left indent
  if (displayWidth(text) > maxContent) {
    text = truncate(text, maxContent);
  }
  const gap = Math.max(0, innerWidth - 1 - displayWidth(text));
  return `${border} ${text}${" ".repeat(gap)}${border}`;
}

// ─── Truncation ─────────────────────────────────────────────

/**
 * 문자열을 `maxWidth` 칸 이내로 자른다.
 * 잘린 경우 끝에 ".." 을 붙인다.
 * 잘리지 않으면 `maxWidth` 까지 공백 패딩한다.
 */
export function truncate(s: string, maxWidth: number): string {
  if (displayWidth(s) <= maxWidth) {
    return padEnd(s, maxWidth);
  }
  let result = "";
  let w = 0;
  for (const ch of s) {
    const cw = charWidth(ch);
    if (w + cw > maxWidth - 2) break;
    result += ch;
    w += cw;
  }
  return result + "..";
}
