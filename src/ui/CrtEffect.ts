// ============================================================
// BTL Deck Crawl — CrtEffect (CRT 스캔라인 / 글로우 오버레이)
// ============================================================
// Phaser 씬에 "구형 CRT 모니터" 느낌의 시각 효과를 적용한다.
// 게임 캔버스 위에 반투명 스캔라인과 비네팅을 렌더링한다.

import * as Phaser from "phaser";

// ─── Scan-line overlay ──────────────────────────────────────

/**
 * 씬에 CRT 스캔라인 오버레이를 추가한다.
 * 1px 검정 줄을 2px 간격으로 반복하여 CRT 래스터 효과를 만든다.
 *
 * @param scene  대상 Phaser 씬
 * @param alpha  스캔라인 불투명도 (0–1, 기본 0.08)
 * @param depth  렌더링 깊이 (기본 9999 — 최상단)
 * @returns 생성된 Graphics 오브젝트 (제거·토글에 사용)
 */
export function addScanlines(
  scene: Phaser.Scene,
  alpha: number = 0.08,
  depth: number = 9999,
): Phaser.GameObjects.Graphics {
  const W = scene.scale.width;
  const H = scene.scale.height;

  const gfx = scene.add.graphics();
  gfx.setDepth(depth);
  gfx.setAlpha(alpha);

  gfx.fillStyle(0x000000, 1);
  for (let y = 0; y < H; y += 2) {
    gfx.fillRect(0, y, W, 1);
  }

  return gfx;
}

// ─── Vignette overlay ───────────────────────────────────────

/**
 * 화면 가장자리를 어둡게 만드는 비네팅 효과를 추가한다.
 *
 * @param scene  대상 Phaser 씬
 * @param alpha  비네팅 최대 불투명도 (기본 0.35)
 * @param depth  렌더링 깊이 (기본 9998)
 * @returns 생성된 Graphics 오브젝트
 */
export function addVignette(
  scene: Phaser.Scene,
  alpha: number = 0.35,
  depth: number = 9998,
): Phaser.GameObjects.Graphics {
  const W = scene.scale.width;
  const H = scene.scale.height;

  const gfx = scene.add.graphics();
  gfx.setDepth(depth);

  // Draw concentric transparent-to-black rectangles
  const steps = 12;
  for (let i = 0; i < steps; i++) {
    const t = i / steps;
    const inset = t * Math.min(W, H) * 0.15;
    const a = alpha * (t * t); // quadratic falloff
    gfx.fillStyle(0x000000, a);
    gfx.fillRect(0, 0, W, inset);          // top
    gfx.fillRect(0, H - inset, W, inset);  // bottom
    gfx.fillRect(0, 0, inset, H);          // left
    gfx.fillRect(W - inset, 0, inset, H);  // right
  }

  return gfx;
}

// ─── Text flicker animation ────────────────────────────────

/**
 * 텍스트 오브젝트에 깜빡임(flicker) 효과를 적용한다.
 *
 * @param scene    대상 씬 (타이머 사용)
 * @param text     대상 텍스트 오브젝트
 * @param count    깜빡임 횟수 (기본 6)
 * @param interval 깜빡임 간격 ms (기본 80)
 */
export function flicker(
  scene: Phaser.Scene,
  text: Phaser.GameObjects.Text,
  count: number = 6,
  interval: number = 80,
): void {
  for (let f = 0; f < count; f++) {
    scene.time.delayedCall(f * interval, () => {
      text.setAlpha(f % 2 === 0 ? 0.3 : 1);
    });
  }
  // Ensure fully visible after flicker
  scene.time.delayedCall(count * interval, () => {
    text.setAlpha(1);
  });
}

/**
 * 텍스트에 미세한 지터(jitter) 애니메이션을 적용한다.
 * CRT 화면의 미세 떨림을 재현한다.
 *
 * @param scene  대상 씬
 * @param text   대상 텍스트 오브젝트
 * @param amount 최대 이동 픽셀 (기본 0.5)
 */
export function jitter(
  scene: Phaser.Scene,
  text: Phaser.GameObjects.Text,
  amount: number = 0.5,
): void {
  const origX = text.x;
  const origY = text.y;

  scene.time.addEvent({
    delay: 100,
    loop: true,
    callback: () => {
      text.setPosition(
        origX + (Math.random() - 0.5) * amount,
        origY + (Math.random() - 0.5) * amount,
      );
    },
  });
}
