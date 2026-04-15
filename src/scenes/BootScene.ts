import Phaser from "phaser";

const BOOT_LINES = [
  "> INITIALIZING SYSTEM...",
  "> LOADING NAVIGATION DATA...",
  "> WEAPON SYSTEMS ONLINE...",
  "> SHIELD GENERATORS ACTIVE...",
  "> ALL SYSTEMS NOMINAL.",
  "",
  "> READY FOR DEPLOYMENT.",
];

const LINE_STYLE: Phaser.Types.GameObjects.Text.TextStyle = {
  fontFamily: "D2Coding",
  fontSize: "18px",
  color: "#00ff41",
};

const LINE_DELAY_MS = 250;
const FLICKER_COUNT = 6;
const FLICKER_INTERVAL_MS = 80;
const POST_BOOT_DELAY_MS = 1000;

export class BootScene extends Phaser.Scene {
  constructor() {
    super({ key: "BootScene" });
  }

  async create(): Promise<void> {
    await document.fonts.ready;

    const startX = 80;
    const startY = 120;
    const lineHeight = 28;

    let elapsed = 0;

    BOOT_LINES.forEach((line, index) => {
      const delay = index * LINE_DELAY_MS;
      elapsed = delay;

      this.time.delayedCall(delay, () => {
        const text = this.add.text(startX, startY + index * lineHeight, line, LINE_STYLE);

        // Flicker effect: toggle visibility rapidly a few times
        for (let f = 0; f < FLICKER_COUNT; f++) {
          this.time.delayedCall(f * FLICKER_INTERVAL_MS, () => {
            text.setAlpha(f % 2 === 0 ? 0.3 : 1);
          });
        }
        // Ensure fully visible after flicker
        this.time.delayedCall(FLICKER_COUNT * FLICKER_INTERVAL_MS, () => {
          text.setAlpha(1);
        });
      });
    });

    const totalBootTime =
      elapsed + FLICKER_COUNT * FLICKER_INTERVAL_MS + POST_BOOT_DELAY_MS;

    this.time.delayedCall(totalBootTime, () => {
      this.scene.start("ShipSelectScene");
    });
  }
}
