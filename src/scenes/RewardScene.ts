import * as Phaser from "phaser";
import { TITLE_STYLE, SUBTITLE_STYLE, addScanlines, addVignette } from "../ui";

/**
 * RewardScene — 전투 후 보상 씬 (M1 스텁)
 *
 * 전투 승리 후 장비 보상 선택 화면을 처리한다.
 * 현재는 기본 구조만 갖추고 있으며, M1 보상 시스템 구현 시 확장 예정.
 */
export class RewardScene extends Phaser.Scene {
  constructor() {
    super({ key: "RewardScene" });
  }

  create(): void {
    const W = this.scale.width;
    const H = this.scale.height;

    // CRT effects
    addScanlines(this);
    addVignette(this);

    this.add
      .text(W / 2, H / 2 - 40, "═══ REWARD ═══", TITLE_STYLE)
      .setOrigin(0.5);

    this.add
      .text(W / 2, H / 2 + 10, "> 보상 시스템 구현 예정 (M1)", SUBTITLE_STYLE)
      .setOrigin(0.5);

    this.add
      .text(W / 2, H / 2 + 50, "[ ESC — 함선 선택으로 돌아가기 ]", SUBTITLE_STYLE)
      .setOrigin(0.5);

    const kb = this.input.keyboard;
    if (kb) {
      kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on("down", () => {
        this.scene.start("ShipSelectScene");
      });
    }
  }
}
