import * as Phaser from "phaser";
import { ENEMIES } from "../data";
import type { PlacedEquipment, NodeType } from "../data";
import {
  generateStageMap,
  getSelectableNodeIds,
  findNode,
  nodeTypeLabel,
  nodeTypeIcon,
  type StageMap,
  type MapNode,
} from "../systems/stage/StageMapGenerator";
import {
  Color, FONT_FAMILY,
  TITLE_STYLE, SUBTITLE_STYLE, BODY_STYLE, BUTTON_STYLE, HELP_STYLE,
  buildPanel, BOX_SINGLE, BOX_DOUBLE,
  addScanlines, addVignette,
} from "../ui";

// ─── Layout constants ───────────────────────────────────────

/** Node rendering */
const NODE_W = 80;
const NODE_H = 40;
const LAYER_SPACING_Y = 90;
const MAP_TOP_Y = 120;
const MAP_LEFT_PAD = 80;

// ─── Scene Data ─────────────────────────────────────────────

interface StageMapSceneData {
  shipId: string;
  placedEquipment: PlacedEquipment[];
  zoneId?: number;
  /** 현재 HP (구역 간 유지) */
  currentHp?: number;
  /** 최대 HP */
  maxHp?: number;
  /** 재화 */
  scrap?: number;
  dataCore?: number;
  /** 기존 맵 데이터 (재진입 시) */
  stageMap?: StageMap;
  /** 방문한 노드 ID 목록 */
  visitedNodeIds?: string[];
}

// ─── Scene ──────────────────────────────────────────────────

/**
 * StageMapScene — 스테이지 맵 씬 (M2)
 *
 * Slay the Spire 스타일 노드 맵을 ASCII ART로 표시한다.
 * 플레이어는 분기 경로를 선택하여 진행한다.
 */
export class StageMapScene extends Phaser.Scene {
  private shipId!: string;
  private placedEquipment: PlacedEquipment[] = [];
  private currentHp!: number;
  private maxHp!: number;
  private scrap = 0;
  private dataCore = 0;

  private stageMap!: StageMap;
  private visitedNodeIds: string[] = [];
  private selectableNodeIds: string[] = [];

  private uiObjects: Phaser.GameObjects.GameObject[] = [];

  constructor() {
    super({ key: "StageMapScene" });
  }

  // ─── Lifecycle ────────────────────────────────────────────

  init(data: StageMapSceneData): void {
    this.shipId = data.shipId ?? "corvette";
    this.placedEquipment = data.placedEquipment ?? [];
    this.maxHp = data.maxHp ?? 60;
    this.currentHp = data.currentHp ?? this.maxHp;
    this.scrap = data.scrap ?? 0;
    this.dataCore = data.dataCore ?? 0;

    // Restore or generate new map
    if (data.stageMap) {
      this.stageMap = data.stageMap;
      this.visitedNodeIds = data.visitedNodeIds ?? [];
    } else {
      const zoneId = data.zoneId ?? 1;
      this.stageMap = generateStageMap(zoneId);
      this.visitedNodeIds = [];
    }

    this.selectableNodeIds = getSelectableNodeIds(this.stageMap, this.visitedNodeIds);
  }

  create(): void {
    // CRT effects
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
      this.scene.start("ShipSelectScene");
    });
  }

  // ─── Actions ──────────────────────────────────────────────

  private selectNode(nodeId: string): void {
    if (!this.selectableNodeIds.includes(nodeId)) return;

    const node = findNode(this.stageMap, nodeId);
    if (!node) return;

    // Mark visited
    node.visited = true;
    this.visitedNodeIds.push(nodeId);

    // Navigate to appropriate scene based on node type
    this.navigateToNode(node);
  }

  private navigateToNode(node: MapNode): void {
    const commonData = {
      shipId: this.shipId,
      placedEquipment: this.placedEquipment,
      currentHp: this.currentHp,
      maxHp: this.maxHp,
      scrap: this.scrap,
      dataCore: this.dataCore,
      stageMap: this.stageMap,
      visitedNodeIds: [...this.visitedNodeIds],
    };

    switch (node.type) {
      case "battle":
      case "elite":
      case "boss": {
        const enemyId = node.enemyId ?? "pirate_scout";
        this.scene.start("BattleScene", {
          shipId: this.shipId,
          placedEquipment: this.placedEquipment,
          enemyId,
          // Return data for StageMapScene after battle
          returnData: commonData,
        });
        break;
      }
      case "shop":
      case "event":
      case "repair":
        // These scenes are not yet implemented (M2 future tasks).
        // For now, show a placeholder and return to map.
        this.showPlaceholder(node.type, commonData);
        break;
    }
  }

  /**
   * Placeholder for unimplemented node types.
   * Shows a brief message and returns to the map.
   */
  private showPlaceholder(type: NodeType, _commonData: object): void {
    this.clearUI();
    const sceneW = this.scale.width;
    const sceneH = this.scale.height;

    const label = nodeTypeLabel(type);
    const icon = nodeTypeIcon(type);

    addScanlines(this);
    addVignette(this);

    this.addText(sceneW / 2, sceneH / 2 - 60, `${icon} ${label} ${icon}`, {
      ...TITLE_STYLE,
      fontSize: "28px",
    }).setOrigin(0.5);

    let description: string;
    switch (type) {
      case "shop":
        description = "상점 기능은 아직 구현 중입니다.\n스크랩을 사용해 장비를 구매할 수 있게 될 예정입니다.";
        break;
      case "event":
        description = "이벤트 기능은 아직 구현 중입니다.\n선택지 기반 랜덤 이벤트가 추가될 예정입니다.";
        break;
      case "repair":
        description = "수리 기지 기능은 아직 구현 중입니다.\nHP를 회복하고 장비를 재배치할 수 있게 될 예정입니다.";
        break;
      default:
        description = "이 기능은 아직 구현 중입니다.";
    }

    this.addText(sceneW / 2, sceneH / 2, description, {
      ...BODY_STYLE,
      fontSize: "14px",
      color: Color.DIM,
      align: "center",
    }).setOrigin(0.5);

    const btn = this.addText(sceneW / 2, sceneH / 2 + 80, "[ CONTINUE ]", {
      ...BUTTON_STYLE,
      fontSize: "18px",
      padding: { x: 20, y: 8 },
    }).setOrigin(0.5).setInteractive({ useHandCursor: true });

    btn.on("pointerdown", () => {
      // Re-enter map
      this.selectableNodeIds = getSelectableNodeIds(this.stageMap, this.visitedNodeIds);
      this.renderUI();
    });
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

    const sceneW = this.scale.width;
    const sceneH = this.scale.height;

    addScanlines(this);
    addVignette(this);

    this.renderHeader(sceneW);
    this.renderMap(sceneW, sceneH);
    this.renderPlayerInfo(sceneW, sceneH);
    this.renderHelp(sceneW, sceneH);

    // Check if map is completed (boss defeated)
    if (this.isMapComplete()) {
      this.renderMapComplete(sceneW, sceneH);
    }
  }

  // ─── Header ───────────────────────────────────────────────

  private renderHeader(sceneW: number): void {
    const zone = this.stageMap.zone;
    this.addText(
      sceneW / 2,
      16,
      `═══ STAGE MAP: ${zone.name} ═══`,
      TITLE_STYLE,
    ).setOrigin(0.5, 0);

    this.addText(
      sceneW / 2,
      50,
      `Zone ${zone.id} — ${zone.enemyTheme}   |   Boss: ${zone.bossName}`,
      SUBTITLE_STYLE,
    ).setOrigin(0.5, 0);
  }

  // ─── Map Rendering ────────────────────────────────────────

  private renderMap(sceneW: number, _sceneH: number): void {
    const layers = this.stageMap.layers;
    const totalLayers = layers.length;

    // Render from top (first layer) to bottom (boss)
    for (let layerIdx = 0; layerIdx < totalLayers; layerIdx++) {
      const layerNodes = layers[layerIdx]!;
      const y = MAP_TOP_Y + layerIdx * LAYER_SPACING_Y;

      // Center nodes horizontally
      const totalNodesW = layerNodes.length * NODE_W + (layerNodes.length - 1) * 20;
      const startX = (sceneW - totalNodesW) / 2;

      for (let nodeIdx = 0; nodeIdx < layerNodes.length; nodeIdx++) {
        const node = layerNodes[nodeIdx]!;
        const x = startX + nodeIdx * (NODE_W + 20);

        this.renderNode(x, y, node);
      }

      // Render edges to next layer
      if (layerIdx < totalLayers - 1) {
        const nextLayerNodes = layers[layerIdx + 1]!;
        this.renderEdges(layerNodes, nextLayerNodes, sceneW, y);
      }
    }
  }

  private renderNode(x: number, y: number, node: MapNode): void {
    const isSelectable = this.selectableNodeIds.includes(node.id);
    const isVisited = node.visited;

    const icon = nodeTypeIcon(node.type);
    const label = nodeTypeLabel(node.type);

    // Determine color
    let color: string;
    let boxChars;
    if (isSelectable) {
      color = Color.CYAN;
      boxChars = BOX_DOUBLE;
    } else if (isVisited) {
      color = Color.DIM;
      boxChars = BOX_SINGLE;
    } else {
      color = Color.GREEN;
      boxChars = BOX_SINGLE;
    }

    // Build node box
    const iw = 8;
    const panel = buildPanel(iw, boxChars)
      .center(`${icon}`)
      .center(label.length > iw ? label.substring(0, iw) : label)
      .close();

    const text = this.addText(x, y, panel.toString(), {
      fontFamily: FONT_FAMILY,
      fontSize: "12px",
      color,
      lineSpacing: 0,
    });

    // Make selectable nodes interactive
    if (isSelectable) {
      text.setInteractive({ useHandCursor: true });
      text.on("pointerover", () => {
        text.setColor(Color.YELLOW);
      });
      text.on("pointerout", () => {
        text.setColor(Color.CYAN);
      });
      text.on("pointerdown", () => {
        this.selectNode(node.id);
      });
    }
  }

  private renderEdges(
    currentLayer: MapNode[],
    nextLayer: MapNode[],
    sceneW: number,
    currentY: number,
  ): void {
    // Use ASCII characters for edges
    const nextY = currentY + LAYER_SPACING_Y;

    const totalCurrentW = currentLayer.length * NODE_W + (currentLayer.length - 1) * 20;
    const currentStartX = (sceneW - totalCurrentW) / 2;

    const totalNextW = nextLayer.length * NODE_W + (nextLayer.length - 1) * 20;
    const nextStartX = (sceneW - totalNextW) / 2;

    const graphics = this.add.graphics();
    graphics.setDepth(-1);
    this.uiObjects.push(graphics);

    for (const node of currentLayer) {
      const fromX = currentStartX + node.index * (NODE_W + 20) + NODE_W / 2;
      const fromY = currentY + NODE_H + 2;

      for (const nextId of node.nextNodeIds) {
        const nextNode = findNode(this.stageMap, nextId);
        if (!nextNode) continue;

        const toX = nextStartX + nextNode.index * (NODE_W + 20) + NODE_W / 2;
        const toY = nextY - 2;

        // Determine edge color
        const isVisitedPath =
          node.visited && (nextNode.visited || this.selectableNodeIds.includes(nextNode.id));

        if (isVisitedPath) {
          graphics.lineStyle(2, 0x00aaff, 0.8);
        } else {
          graphics.lineStyle(1, 0x333333, 0.5);
        }

        // Draw line
        graphics.beginPath();
        graphics.moveTo(fromX, fromY);
        graphics.lineTo(toX, toY);
        graphics.strokePath();
      }
    }
  }

  // ─── Player Info Panel ────────────────────────────────────

  private renderPlayerInfo(sceneW: number, sceneH: number): void {
    const panelIW = 40;
    const panel = buildPanel(panelIW, BOX_SINGLE)
      .left(`HP: ${this.currentHp}/${this.maxHp}`)
      .left(`Scrap: ${this.scrap}  Data Core: ${this.dataCore}`)
      .left(`Progress: ${this.visitedNodeIds.length}/${this.stageMap.layers.length} layers`)
      .close();

    this.addText(16, sceneH - 80, panel.toString(), {
      fontFamily: FONT_FAMILY,
      fontSize: "12px",
      color: Color.GREEN,
      lineSpacing: 0,
    });
  }

  // ─── Help ─────────────────────────────────────────────────

  private renderHelp(sceneW: number, sceneH: number): void {
    const legend = `⚔ 전투  ☠ 엘리트  ★ 보스  $ 상점  ? 이벤트  + 수리 기지`;
    this.addText(sceneW / 2, sceneH - 40, legend, {
      ...HELP_STYLE,
      fontSize: "11px",
    }).setOrigin(0.5);

    this.addText(sceneW / 2, sceneH - 20, "Click node to proceed   |   ESC: Quit", {
      ...HELP_STYLE,
      fontSize: "11px",
    }).setOrigin(0.5);
  }

  // ─── Map Complete ─────────────────────────────────────────

  private isMapComplete(): boolean {
    // All layers visited? Check if boss was visited.
    const lastLayer = this.stageMap.layers[this.stageMap.layers.length - 1];
    if (!lastLayer) return false;
    return lastLayer.some((n) => n.visited);
  }

  private renderMapComplete(sceneW: number, sceneH: number): void {
    const overlay = this.add.graphics();
    overlay.fillStyle(0x000000, 0.6);
    overlay.fillRect(0, 0, sceneW, sceneH);
    overlay.setDepth(5000);
    this.uiObjects.push(overlay);

    this.addText(sceneW / 2, sceneH / 2 - 40, "=== ZONE COMPLETE ===", {
      fontFamily: FONT_FAMILY,
      fontSize: "28px",
      color: Color.CYAN,
    }).setOrigin(0.5).setDepth(5001);

    const nextZoneId = this.stageMap.zone.id + 1;
    const hasNextZone = nextZoneId <= 4;

    if (hasNextZone) {
      const nextBtn = this.addText(sceneW / 2, sceneH / 2 + 30, "[ NEXT ZONE >> ]", {
        ...BUTTON_STYLE,
        fontSize: "18px",
        padding: { x: 16, y: 8 },
      }).setOrigin(0.5).setDepth(5001).setInteractive({ useHandCursor: true });

      nextBtn.on("pointerdown", () => {
        this.scene.start("StageMapScene", {
          shipId: this.shipId,
          placedEquipment: this.placedEquipment,
          zoneId: nextZoneId,
          currentHp: this.currentHp,
          maxHp: this.maxHp,
          scrap: this.scrap,
          dataCore: this.dataCore,
        });
      });
    }

    const returnBtn = this.addText(sceneW / 2, sceneH / 2 + 90, "[ RETURN TO SHIP SELECT ]", {
      ...SUBTITLE_STYLE,
      fontSize: "14px",
    }).setOrigin(0.5).setDepth(5001).setInteractive({ useHandCursor: true });

    returnBtn.on("pointerdown", () => {
      this.scene.start("ShipSelectScene");
    });
  }
}
