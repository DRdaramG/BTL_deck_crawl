import * as Phaser from "phaser";
import { EQUIPMENT, CARDS } from "../data";
import type { PlacedEquipment, EquipmentDefinition, EquipmentGrade, CardDefinition } from "../data";
import {
  Color, FONT_FAMILY, GradeColor,
  TITLE_STYLE, SUBTITLE_STYLE, BODY_STYLE, BUTTON_STYLE, HELP_STYLE,
  buildPanel, BOX_SINGLE, BOX_DOUBLE,
  truncate,
  addScanlines, addVignette,
} from "../ui";

// ─── Constants ──────────────────────────────────────────────

/** Number of equipment items to display in shop */
const SHOP_MIN_ITEMS = 3;
const SHOP_MAX_ITEMS = 5;

/** Equipment card UI dimensions */
const EQUIP_CARD_IW = 28;
const EQUIP_CARD_PX_W = 220;

/** Price multiplier by grade (scrap) */
const GRADE_PRICE: Record<EquipmentGrade, number> = {
  common: 30,
  rare: 60,
  epic: 100,
  legendary: 160,
};

/** Card upgrade cost */
const CARD_UPGRADE_COST = 50;

/** Equipment removal cost */
const EQUIPMENT_REMOVE_COST = 40;

/** Price bonus per provided card */
const CARD_COUNT_PRICE_MULTIPLIER = 5;

/** Card upgrade bonus values by effect type */
const UPGRADE_BONUS: Record<string, number> = {
  damage: 3,
  damage_all: 2,
  block: 4,
  heal: 3,
  multi_hit: 2,
  passive_heal: 1,
};

// ─── Shop mode ──────────────────────────────────────────────

type ShopMode = "main" | "buy" | "upgrade" | "remove";

// ─── Scene Data ─────────────────────────────────────────────

interface ShopSceneData {
  shipId: string;
  placedEquipment: PlacedEquipment[];
  currentHp?: number;
  maxHp?: number;
  scrap?: number;
  dataCore?: number;
  /** Return data for StageMapScene */
  returnData?: Record<string, unknown>;
}

// ─── Scene ──────────────────────────────────────────────────

/**
 * ShopScene — 상점 씬 (M2)
 *
 * 플레이어가 스크랩을 사용해 장비를 구매하거나,
 * 카드를 업그레이드하거나, 장비를 제거(덱 압축)할 수 있다.
 *
 * 상점 구성:
 * 1. 장비 구매 — 3~5개 장비 진열, 스크랩 소모
 * 2. 카드 업그레이드 — 보유 카드 효과 강화
 * 3. 장비 제거 — 배치된 장비를 제거하여 덱 압축
 */
export class ShopScene extends Phaser.Scene {
  private shipId!: string;
  private placedEquipment: PlacedEquipment[] = [];
  private currentHp!: number;
  private maxHp!: number;
  private scrap = 0;
  private dataCore = 0;
  private returnData?: Record<string, unknown>;

  /** Current shop view */
  private mode: ShopMode = "main";

  /** Shop inventory (equipment for sale) */
  private shopItems: EquipmentDefinition[] = [];

  /** Selected index for buy/upgrade/remove views */
  private selectedIndex = -1;

  /** Upgraded card IDs this visit (prevent double-upgrade) */
  private upgradedCardIds: Set<string> = new Set();

  /** Cumulative card upgrade bonuses (cardId → applied bonus map) */
  private cardUpgrades: Map<string, Record<string, number>> = new Map();

  /** Removed equipment IDs this visit */
  private removedEquipmentIds: Set<string> = new Set();

  /** Message to display briefly */
  private message = "";

  private uiObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: "ShopScene" });
  }

  // ─── Lifecycle ────────────────────────────────────────────

  init(data: ShopSceneData): void {
    this.shipId = data.shipId ?? "corvette";
    this.placedEquipment = data.placedEquipment ?? [];
    this.maxHp = data.maxHp ?? 60;
    this.currentHp = data.currentHp ?? this.maxHp;
    this.scrap = data.scrap ?? 0;
    this.dataCore = data.dataCore ?? 0;
    this.returnData = data.returnData;

    this.mode = "main";
    this.selectedIndex = -1;
    this.upgradedCardIds = new Set();
    this.cardUpgrades = new Map();
    this.removedEquipmentIds = new Set();
    this.message = "";

    // Generate shop inventory
    this.shopItems = this.generateShopItems();
  }

  create(): void {
    addScanlines(this);
    addVignette(this);

    this.renderUI();
    this.setupKeyboard();
  }

  // ─── Keyboard ─────────────────────────────────────────────

  private setupKeyboard(): void {
    const kb = this.input.keyboard;
    if (!kb) return;

    kb.addKey(Phaser.Input.Keyboard.KeyCodes.ESC).on("down", () => {
      if (this.mode === "main") {
        this.leaveShop();
      } else {
        this.mode = "main";
        this.selectedIndex = -1;
        this.message = "";
        this.renderUI();
      }
    });
  }

  // ─── Navigation ───────────────────────────────────────────

  private leaveShop(): void {
    if (this.returnData) {
      // Propagate updated scrap back
      const rd = { ...this.returnData };
      rd["scrap"] = this.scrap;
      rd["dataCore"] = this.dataCore;
      rd["placedEquipment"] = this.placedEquipment;
      this.scene.start("StageMapScene", rd);
    } else {
      this.scene.start("ShipSelectScene");
    }
  }

  // ─── Render Helpers ───────────────────────────────────────

  private clearUI(): void {
    for (const obj of this.uiObjects) obj.destroy();
    this.uiObjects = [];
  }

  private addText(
    x: number,
    y: number,
    content: string,
    style: Phaser.Types.GameObjects.Text.TextStyle,
  ): Phaser.GameObjects.Text {
    const t = this.add.text(x, y, content, style);
    this.uiObjects.push(t);
    return t;
  }

  // ─── Main Render ──────────────────────────────────────────

  private renderUI(): void {
    this.clearUI();

    addScanlines(this);
    addVignette(this);

    const sceneW = this.scale.width;
    const sceneH = this.scale.height;

    // Header
    this.addText(sceneW / 2, 16, "═══ $ SHOP $ ═══", {
      ...TITLE_STYLE,
      fontSize: "24px",
    }).setOrigin(0.5, 0);

    // Player info bar
    this.renderPlayerBar(sceneW);

    // Message
    if (this.message) {
      this.addText(sceneW / 2, 80, this.message, {
        ...BODY_STYLE,
        fontSize: "14px",
        color: Color.YELLOW,
      }).setOrigin(0.5, 0);
    }

    switch (this.mode) {
      case "main":
        this.renderMainMenu(sceneW, sceneH);
        break;
      case "buy":
        this.renderBuyView(sceneW, sceneH);
        break;
      case "upgrade":
        this.renderUpgradeView(sceneW, sceneH);
        break;
      case "remove":
        this.renderRemoveView(sceneW, sceneH);
        break;
    }

    // Help
    this.addText(sceneW / 2, sceneH - 20, "ESC: Back / Leave shop", {
      ...HELP_STYLE,
      fontSize: "11px",
    }).setOrigin(0.5);
  }

  // ─── Player Bar ───────────────────────────────────────────

  private renderPlayerBar(sceneW: number): void {
    const info = `HP: ${this.currentHp}/${this.maxHp}  |  Scrap: ${this.scrap}  |  Data Core: ${this.dataCore}`;
    this.addText(sceneW / 2, 50, info, {
      ...SUBTITLE_STYLE,
      fontSize: "14px",
      color: Color.GREEN,
    }).setOrigin(0.5, 0);
  }

  // ─── Main Menu ────────────────────────────────────────────

  private renderMainMenu(sceneW: number, sceneH: number): void {
    const menuY = 140;
    const spacing = 80;

    // 1. Buy Equipment
    const buyPanel = buildPanel(36, BOX_DOUBLE)
      .center("$ 장비 구매")
      .separator()
      .left(`진열 장비: ${this.shopItems.length}개`)
      .left("스크랩으로 장비를 구매합니다")
      .close();

    const buyBtn = this.addText(sceneW / 2, menuY, buyPanel.toString(), {
      ...BODY_STYLE,
      fontSize: "14px",
      color: Color.CYAN,
    }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });

    buyBtn.on("pointerover", () => buyBtn.setColor(Color.YELLOW));
    buyBtn.on("pointerout", () => buyBtn.setColor(Color.CYAN));
    buyBtn.on("pointerdown", () => {
      this.mode = "buy";
      this.selectedIndex = -1;
      this.message = "";
      this.renderUI();
    });

    // 2. Card Upgrade
    const upgradePanel = buildPanel(36, BOX_DOUBLE)
      .center("▲ 카드 업그레이드")
      .separator()
      .left(`비용: ${CARD_UPGRADE_COST} 스크랩`)
      .left("카드 효과를 강화합니다")
      .close();

    const upgradeBtn = this.addText(sceneW / 2, menuY + spacing, upgradePanel.toString(), {
      ...BODY_STYLE,
      fontSize: "14px",
      color: Color.CYAN,
    }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });

    upgradeBtn.on("pointerover", () => upgradeBtn.setColor(Color.YELLOW));
    upgradeBtn.on("pointerout", () => upgradeBtn.setColor(Color.CYAN));
    upgradeBtn.on("pointerdown", () => {
      this.mode = "upgrade";
      this.selectedIndex = -1;
      this.message = "";
      this.renderUI();
    });

    // 3. Equipment Removal
    const removePanel = buildPanel(36, BOX_DOUBLE)
      .center("✕ 장비 제거 (덱 압축)")
      .separator()
      .left(`비용: ${EQUIPMENT_REMOVE_COST} 스크랩`)
      .left("배치된 장비를 제거합니다")
      .close();

    const removeBtn = this.addText(sceneW / 2, menuY + spacing * 2, removePanel.toString(), {
      ...BODY_STYLE,
      fontSize: "14px",
      color: Color.CYAN,
    }).setOrigin(0.5, 0).setInteractive({ useHandCursor: true });

    removeBtn.on("pointerover", () => removeBtn.setColor(Color.YELLOW));
    removeBtn.on("pointerout", () => removeBtn.setColor(Color.CYAN));
    removeBtn.on("pointerdown", () => {
      this.mode = "remove";
      this.selectedIndex = -1;
      this.message = "";
      this.renderUI();
    });

    // Leave shop button
    const leaveBtn = this.addText(sceneW / 2, sceneH - 60, "[ LEAVE SHOP ]", {
      ...BUTTON_STYLE,
      fontSize: "16px",
      padding: { x: 20, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    leaveBtn.on("pointerdown", () => this.leaveShop());
  }

  // ─── Buy View ─────────────────────────────────────────────

  private renderBuyView(sceneW: number, sceneH: number): void {
    this.addText(sceneW / 2, 100, "— 장비 구매 —", {
      ...SUBTITLE_STYLE,
      fontSize: "16px",
      color: Color.GREEN,
    }).setOrigin(0.5, 0);

    if (this.shopItems.length === 0) {
      this.addText(sceneW / 2, 200, "품절되었습니다.", {
        ...BODY_STYLE,
        fontSize: "16px",
        color: Color.DIM,
      }).setOrigin(0.5, 0);
      this.renderBackButton(sceneW, sceneH);
      return;
    }

    const count = this.shopItems.length;
    const totalW = count * EQUIP_CARD_PX_W + (count - 1) * 16;
    const startX = (sceneW - totalW) / 2;
    const cardY = 140;

    for (let i = 0; i < count; i++) {
      const equip = this.shopItems[i]!;
      const x = startX + i * (EQUIP_CARD_PX_W + 16);
      const price = this.getEquipmentPrice(equip);
      const canAfford = this.scrap >= price;

      this.renderShopEquipCard(x, cardY, equip, price, canAfford, i);
    }

    this.renderBackButton(sceneW, sceneH);
  }

  private renderShopEquipCard(
    x: number,
    y: number,
    equip: EquipmentDefinition,
    price: number,
    canAfford: boolean,
    index: number,
  ): void {
    const box = BOX_SINGLE;
    const gradeColor = GradeColor[equip.grade] ?? Color.DIM;
    const color = canAfford ? gradeColor : Color.DIM;

    const iw = EQUIP_CARD_IW;
    const panel = buildPanel(iw, box);

    panel.center(truncate(equip.name, iw - 2));
    panel.separator();
    panel.left(`${equip.category}`);
    panel.left(`등급: ${equip.grade}`);
    panel.left(`모양: ${equip.shapeDescription}`);
    panel.separator();
    panel.left(truncate(equip.description, iw - 2));
    panel.separator();
    panel.left("카드:");
    for (const pc of equip.providedCards) {
      panel.left(truncate(`  ${pc.cardId} x${pc.count}`, iw - 2));
    }
    panel.separator();

    const priceStr = canAfford ? `$ ${price} 스크랩` : `$ ${price} (부족)`;
    panel.center(priceStr);
    panel.close();

    const text = this.addText(x, y, panel.toString(), {
      ...BODY_STYLE,
      fontSize: "12px",
      color,
    });

    if (canAfford) {
      text.setInteractive({ useHandCursor: true });
      text.on("pointerover", () => text.setColor(Color.YELLOW));
      text.on("pointerout", () => text.setColor(gradeColor));
      text.on("pointerdown", () => this.buyEquipment(index));
    }
  }

  private buyEquipment(index: number): void {
    const equip = this.shopItems[index];
    if (!equip) return;

    const price = this.getEquipmentPrice(equip);
    if (this.scrap < price) {
      this.message = "스크랩이 부족합니다!";
      this.renderUI();
      return;
    }

    // Deduct scrap
    this.scrap -= price;

    // Add equipment to inventory. Position (-1,-1) indicates the equipment
    // needs to be placed on the grid via ShipSetupScene (수리 기지 or 장비 배치 화면).
    this.placedEquipment.push({
      equipmentId: equip.id,
      position: { row: -1, col: -1 },
      rotation: 0,
    });

    // Remove from shop
    this.shopItems.splice(index, 1);

    this.message = `${equip.name} 구매 완료! (${price} 스크랩 사용)`;
    this.renderUI();
  }

  // ─── Upgrade View ─────────────────────────────────────────

  private renderUpgradeView(sceneW: number, sceneH: number): void {
    this.addText(sceneW / 2, 100, `— 카드 업그레이드 (${CARD_UPGRADE_COST} 스크랩) —`, {
      ...SUBTITLE_STYLE,
      fontSize: "16px",
      color: Color.GREEN,
    }).setOrigin(0.5, 0);

    // Get unique cards from placed equipment
    const cardEntries = this.getUpgradeableCards();

    if (cardEntries.length === 0) {
      this.addText(sceneW / 2, 200, "업그레이드 가능한 카드가 없습니다.", {
        ...BODY_STYLE,
        fontSize: "16px",
        color: Color.DIM,
      }).setOrigin(0.5, 0);
      this.renderBackButton(sceneW, sceneH);
      return;
    }

    const canAfford = this.scrap >= CARD_UPGRADE_COST;
    const startY = 140;
    const lineH = 32;
    // Show cards in a scrollable-like list (limited to fit screen)
    const maxVisible = Math.min(cardEntries.length, 14);

    for (let i = 0; i < maxVisible; i++) {
      const entry = cardEntries[i]!;
      const card = entry.card;
      const upgraded = this.upgradedCardIds.has(card.id);
      const bonus = this.getUpgradeBonus(card);

      let label = `${card.name}  (EP: ${card.epCost})`;
      if (bonus) {
        label += `  →  ${bonus.description}`;
      }
      if (upgraded) {
        label = `✓ ${label} [업그레이드됨]`;
      }

      const color = upgraded ? Color.DIM : canAfford ? Color.GREEN : Color.DIM;

      const text = this.addText(60, startY + i * lineH, label, {
        ...BODY_STYLE,
        fontSize: "13px",
        color,
      });

      if (!upgraded && canAfford && bonus) {
        text.setInteractive({ useHandCursor: true });
        text.on("pointerover", () => text.setColor(Color.YELLOW));
        text.on("pointerout", () => text.setColor(Color.GREEN));
        text.on("pointerdown", () => this.upgradeCard(card.id, bonus));
      }
    }

    if (!canAfford) {
      this.addText(sceneW / 2, sceneH - 100, "스크랩이 부족합니다!", {
        ...BODY_STYLE,
        fontSize: "14px",
        color: Color.RED,
      }).setOrigin(0.5);
    }

    this.renderBackButton(sceneW, sceneH);
  }

  private upgradeCard(
    cardId: string,
    bonus: { description: string },
  ): void {
    if (this.scrap < CARD_UPGRADE_COST) {
      this.message = "스크랩이 부족합니다!";
      this.renderUI();
      return;
    }

    this.scrap -= CARD_UPGRADE_COST;
    this.upgradedCardIds.add(cardId);

    // Apply upgrade to the card definition.
    // We deep-copy the effects array so the original data is not mutated
    // if this card is shared by multiple equipment pieces.
    const card = CARDS[cardId];
    if (card) {
      // Clone effects to avoid mutating the original definition for other contexts
      card.effects = card.effects.map((e) => ({ ...e }));
      const bonuses: Record<string, number> = {};
      for (const effect of card.effects) {
        const bonusVal = UPGRADE_BONUS[effect.type];
        if (bonusVal && effect.value !== undefined) {
          effect.value += bonusVal;
          bonuses[effect.type] = bonusVal;
        }
      }
      // Mark as upgraded in name
      if (!card.name.endsWith("+")) {
        card.name += "+";
      }
      this.cardUpgrades.set(cardId, bonuses);
    }

    this.message = `${card?.name ?? cardId} 업그레이드 완료! (${CARD_UPGRADE_COST} 스크랩 사용)`;
    this.renderUI();
  }

  // ─── Remove View ──────────────────────────────────────────

  private renderRemoveView(sceneW: number, sceneH: number): void {
    this.addText(sceneW / 2, 100, `— 장비 제거 (${EQUIPMENT_REMOVE_COST} 스크랩) —`, {
      ...SUBTITLE_STYLE,
      fontSize: "16px",
      color: Color.GREEN,
    }).setOrigin(0.5, 0);

    if (this.placedEquipment.length === 0) {
      this.addText(sceneW / 2, 200, "배치된 장비가 없습니다.", {
        ...BODY_STYLE,
        fontSize: "16px",
        color: Color.DIM,
      }).setOrigin(0.5, 0);
      this.renderBackButton(sceneW, sceneH);
      return;
    }

    const canAfford = this.scrap >= EQUIPMENT_REMOVE_COST;
    const startY = 140;
    const lineH = 32;
    const maxVisible = Math.min(this.placedEquipment.length, 14);

    for (let i = 0; i < maxVisible; i++) {
      const placed = this.placedEquipment[i]!;
      const equipDef = EQUIPMENT[placed.equipmentId];
      if (!equipDef) continue;

      const cardNames = equipDef.providedCards
        .map((pc) => {
          const c = CARDS[pc.cardId];
          return `${c?.name ?? pc.cardId} x${pc.count}`;
        })
        .join(", ");

      const label = `${equipDef.name}  [${equipDef.grade}]  — 카드: ${cardNames}`;
      const color = canAfford ? Color.GREEN : Color.DIM;

      const text = this.addText(60, startY + i * lineH, `✕ ${label}`, {
        ...BODY_STYLE,
        fontSize: "13px",
        color,
      });

      if (canAfford) {
        text.setInteractive({ useHandCursor: true });
        text.on("pointerover", () => text.setColor(Color.RED));
        text.on("pointerout", () => text.setColor(Color.GREEN));
        text.on("pointerdown", () => this.removeEquipment(i));
      }
    }

    if (!canAfford) {
      this.addText(sceneW / 2, sceneH - 100, "스크랩이 부족합니다!", {
        ...BODY_STYLE,
        fontSize: "14px",
        color: Color.RED,
      }).setOrigin(0.5);
    }

    this.renderBackButton(sceneW, sceneH);
  }

  private removeEquipment(index: number): void {
    if (this.scrap < EQUIPMENT_REMOVE_COST) {
      this.message = "스크랩이 부족합니다!";
      this.renderUI();
      return;
    }

    const placed = this.placedEquipment[index];
    if (!placed) return;

    const equipDef = EQUIPMENT[placed.equipmentId];
    const name = equipDef?.name ?? placed.equipmentId;

    this.scrap -= EQUIPMENT_REMOVE_COST;
    this.placedEquipment.splice(index, 1);
    this.removedEquipmentIds.add(placed.equipmentId);

    this.message = `${name} 제거 완료! (${EQUIPMENT_REMOVE_COST} 스크랩 사용)`;
    this.renderUI();
  }

  // ─── Back Button ──────────────────────────────────────────

  private renderBackButton(sceneW: number, sceneH: number): void {
    const btn = this.addText(sceneW / 2, sceneH - 60, "[ ← BACK ]", {
      ...BUTTON_STYLE,
      fontSize: "16px",
      padding: { x: 20, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on("pointerdown", () => {
      this.mode = "main";
      this.selectedIndex = -1;
      this.message = "";
      this.renderUI();
    });
  }

  // ─── Helpers ──────────────────────────────────────────────

  /** Generate random shop equipment inventory. */
  private generateShopItems(): EquipmentDefinition[] {
    const count = SHOP_MIN_ITEMS + Math.floor(Math.random() * (SHOP_MAX_ITEMS - SHOP_MIN_ITEMS + 1));
    const allEquipIds = Object.keys(EQUIPMENT);
    const result: EquipmentDefinition[] = [];
    const used = new Set<string>();

    // Exclude already placed equipment
    const placedIds = new Set(this.placedEquipment.map((p) => p.equipmentId));

    while (result.length < count && result.length < allEquipIds.length) {
      const idx = Math.floor(Math.random() * allEquipIds.length);
      const id = allEquipIds[idx];
      if (!id || used.has(id) || placedIds.has(id)) continue;
      used.add(id);

      const eq = EQUIPMENT[id];
      if (eq) result.push(eq);
    }

    return result;
  }

  /** Get price for equipment based on grade. */
  private getEquipmentPrice(equip: EquipmentDefinition): number {
    // Base price from grade + slight random variation
    const base = GRADE_PRICE[equip.grade] ?? 50;
    // Add variation based on number of cards provided
    const cardBonus = equip.providedCards.reduce((sum, pc) => sum + pc.count * CARD_COUNT_PRICE_MULTIPLIER, 0);
    return base + cardBonus;
  }

  /** Get unique cards from placed equipment that can be upgraded. */
  private getUpgradeableCards(): Array<{ card: CardDefinition; equipId: string }> {
    const seen = new Set<string>();
    const entries: Array<{ card: CardDefinition; equipId: string }> = [];

    for (const placed of this.placedEquipment) {
      const equipDef = EQUIPMENT[placed.equipmentId];
      if (!equipDef) continue;

      for (const pc of equipDef.providedCards) {
        if (seen.has(pc.cardId)) continue;
        seen.add(pc.cardId);

        const card = CARDS[pc.cardId];
        if (!card) continue;

        // Show cards that have upgradeable effects or have already been upgraded this visit (for display)
        const bonus = this.getUpgradeBonus(card);
        if (bonus !== null || this.upgradedCardIds.has(card.id)) {
          entries.push({ card, equipId: placed.equipmentId });
        }
      }
    }

    return entries;
  }

  /** Calculate upgrade bonus description for a card. */
  private getUpgradeBonus(card: CardDefinition): { description: string } | null {
    const parts: string[] = [];

    for (const effect of card.effects) {
      const bonusVal = UPGRADE_BONUS[effect.type];
      if (bonusVal && effect.value !== undefined) {
        switch (effect.type) {
          case "damage":
          case "damage_all":
            parts.push(`피해 +${bonusVal}`);
            break;
          case "block":
            parts.push(`블록 +${bonusVal}`);
            break;
          case "heal":
            parts.push(`회복 +${bonusVal}`);
            break;
          case "multi_hit":
            parts.push(`타격당 피해 +${bonusVal}`);
            break;
          case "passive_heal":
            parts.push(`패시브 회복 +${bonusVal}`);
            break;
        }
      }
    }

    if (parts.length === 0) return null;
    return { description: parts.join(", ") };
  }
}
