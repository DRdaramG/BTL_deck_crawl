import * as Phaser from "phaser";

/**
 * BattleScene — 전투 씬 (M1 스텁)
 *
 * 플레이어와 적 함선의 카드 전투를 처리한다.
 * 현재는 기본 구조만 갖추고 있으며, M1 전투 시스템 구현 시 확장 예정.
 */
export class BattleScene extends Phaser.Scene {
  constructor() {
    super({ key: "BattleScene" });
  }

  create(): void {
    const W = this.scale.width;
    const H = this.scale.height;

    this.add
      .text(W / 2, H / 2 - 40, "═══ BATTLE SCENE ═══", {
        fontFamily: "D2Coding",
        fontSize: "24px",
        color: "#00ff41",
      })
      .setOrigin(0.5);

    this.add
      .text(W / 2, H / 2 + 10, "> 전투 시스템 구현 예정 (M1)", {
        fontFamily: "D2Coding",
        fontSize: "16px",
        color: "#888888",
      })
      .setOrigin(0.5);

    this.add
      .text(W / 2, H / 2 + 50, "[ ESC — 함선 선택으로 돌아가기 ]", {
        fontFamily: "D2Coding",
        fontSize: "14px",
        color: "#888888",
      })
      .setOrigin(0.5);

    const kb = this.input.keyboard;
    if (kb) {
      kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on("down", () => {
        this.scene.start("ShipSelectScene");
      });
    }
  }
}
