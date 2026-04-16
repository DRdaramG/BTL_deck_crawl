import * as Phaser from "phaser";
import { CONSOLE_LINE_STYLE } from "../ui";
import { addScanlines, addVignette, flicker } from "../ui";

const BOOT_LINES = [
  "> INITIALIZING SYSTEM...",
  "> LOADING NAVIGATION DATA...",
  "> WEAPON SYSTEMS ONLINE...",
  "> SHIELD GENERATORS ACTIVE...",
  "> ALL SYSTEMS NOMINAL.",
  "",
  "> READY FOR DEPLOYMENT.",
];

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

    // CRT effects
    addScanlines(this);
    addVignette(this);

    const startX = 80;
    const startY = 120;
    const lineHeight = 28;

    let elapsed = 0;

    BOOT_LINES.forEach((line, index) => {
      const delay = index * LINE_DELAY_MS;
      elapsed = delay;

      this.time.delayedCall(delay, () => {
        const text = this.add.text(startX, startY + index * lineHeight, line, CONSOLE_LINE_STYLE);
        flicker(this, text, FLICKER_COUNT, FLICKER_INTERVAL_MS);
      });
    });

    const totalBootTime =
      elapsed + FLICKER_COUNT * FLICKER_INTERVAL_MS + POST_BOOT_DELAY_MS;

    this.time.delayedCall(totalBootTime, () => {
      this.scene.start("ShipSelectScene");
    });
  }
}
