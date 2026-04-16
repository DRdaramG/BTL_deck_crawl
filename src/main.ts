import * as Phaser from "phaser";
import { BootScene } from "./scenes/BootScene";
import { ShipSelectScene } from "./scenes/ShipSelectScene";
import { ShipSetupScene } from "./scenes/ShipSetupScene";
import { StageMapScene } from "./scenes/StageMapScene";
import { BattleScene } from "./scenes/BattleScene";
import { RewardScene } from "./scenes/RewardScene";
import { ShopScene } from "./scenes/ShopScene";
import { EventScene } from "./scenes/EventScene";
import { RepairScene } from "./scenes/RepairScene";

const config: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 800,
  parent: "game-container",
  backgroundColor: "#0a0a0a",
  scene: [BootScene, ShipSelectScene, ShipSetupScene, StageMapScene, BattleScene, RewardScene, ShopScene, EventScene, RepairScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};

new Phaser.Game(config);
