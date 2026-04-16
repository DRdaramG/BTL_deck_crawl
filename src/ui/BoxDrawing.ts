// ============================================================
// BTL Deck Crawl — BoxDrawing (박스 프레임 빌더)
// ============================================================
// 단선(single) / 이중선(double) 유니코드 박스 문자로
// 패널·카드·팝업 프레임을 생성한다.

import { centerPad, leftPad, displayWidth } from "./AsciiText";

// ─── Box Character Sets ─────────────────────────────────────

export interface BoxChars {
  tl: string; // top-left corner
  t: string;  // top border
  tr: string; // top-right corner
  ml: string; // middle-left (T-junction)
  m: string;  // middle border (horizontal rule)
  mr: string; // middle-right (T-junction)
  bl: string; // bottom-left corner
  b: string;  // bottom border
  br: string; // bottom-right corner
  v: string;  // vertical border
}

/** 단선 박스 문자 세트 */
export const BOX_SINGLE: BoxChars = {
  tl: "┌", t: "─", tr: "┐",
  ml: "├", m: "─", mr: "┤",
  bl: "└", b: "─", br: "┘",
  v: "│",
};

/** 이중선 박스 문자 세트 */
export const BOX_DOUBLE: BoxChars = {
  tl: "╔", t: "═", tr: "╗",
  ml: "╠", m: "═", mr: "╣",
  bl: "╚", b: "═", br: "╝",
  v: "║",
};

// ─── Panel Builder ──────────────────────────────────────────

/**
 * ASCII 패널(박스 프레임)을 줄 배열로 만든다.
 *
 * @param innerWidth 내부 영역 칸 수 (테두리 제외)
 * @param box        사용할 박스 문자 세트
 * @returns PanelBuilder 체이닝 인터페이스
 *
 * @example
 * ```ts
 * const lines = buildPanel(34, BOX_DOUBLE)
 *   .title("AVAILABLE EQUIPMENT")
 *   .separator()
 *   .left("HP: 60")
 *   .center("── Grid ──")
 *   .close()
 *   .lines();
 * ```
 */
export function buildPanel(innerWidth: number, box: BoxChars): PanelBuilder {
  return new PanelBuilder(innerWidth, box);
}

export class PanelBuilder {
  private readonly iw: number;
  private readonly box: BoxChars;
  private readonly _lines: string[] = [];

  constructor(innerWidth: number, box: BoxChars) {
    this.iw = innerWidth;
    this.box = box;
    // Top border
    this._lines.push(`${box.tl}${box.t.repeat(innerWidth)}${box.tr}`);
  }

  /** 가운데 정렬 타이틀 줄 */
  title(text: string): this {
    this._lines.push(centerPad(text, this.iw, this.box.v));
    return this;
  }

  /** 가운데 정렬 줄 (타이틀과 동일하지만 의미적으로 구분) */
  center(text: string): this {
    this._lines.push(centerPad(text, this.iw, this.box.v));
    return this;
  }

  /** 왼쪽 정렬 줄 (1칸 들여쓰기) */
  left(text: string): this {
    this._lines.push(leftPad(text, this.iw, this.box.v));
    return this;
  }

  /** 수평 구분선 */
  separator(): this {
    this._lines.push(
      `${this.box.ml}${this.box.m.repeat(this.iw)}${this.box.mr}`,
    );
    return this;
  }

  /** 빈 줄 */
  blank(): this {
    this._lines.push(
      `${this.box.v}${" ".repeat(this.iw)}${this.box.v}`,
    );
    return this;
  }

  /**
   * 임의 문자열을 innerWidth에 맞게 padEnd 후 테두리로 감싼다.
   * displayWidth 기준으로 패딩한다.
   */
  raw(text: string): this {
    const gap = Math.max(0, this.iw - displayWidth(text));
    this._lines.push(`${this.box.v}${text}${" ".repeat(gap)}${this.box.v}`);
    return this;
  }

  /** 하단 테두리를 추가하고 빌드를 완료한다. */
  close(): this {
    this._lines.push(
      `${this.box.bl}${this.box.b.repeat(this.iw)}${this.box.br}`,
    );
    return this;
  }

  /** 현재까지 생성된 줄 배열을 반환한다. */
  lines(): string[] {
    return this._lines;
  }

  /** 줄 배열을 줄바꿈 문자로 결합해 반환한다. */
  toString(): string {
    return this._lines.join("\n");
  }
}
