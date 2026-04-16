// ============================================================
// BTL Deck Crawl — StageMapGenerator (맵 노드 생성 로직)
// ============================================================
// Slay the Spire 스타일의 분기 경로 맵을 생성한다.
// 각 구역(Zone)의 layerCount 만큼의 레이어로 구성되며,
// 플레이어는 분기 경로 중 하나를 선택해 진행한다.

import type { NodeType, ZoneDefinition } from "../../data/types";
import { ZONES, ENEMIES } from "../../data";

// ─── Types ──────────────────────────────────────────────────

/** 맵 노드 */
export interface MapNode {
  /** 고유 ID ("layer-index" 형태) */
  id: string;
  /** 레이어 인덱스 (0-based) */
  layer: number;
  /** 레이어 내 인덱스 */
  index: number;
  /** 노드 타입 */
  type: NodeType;
  /** 연결된 다음 레이어 노드 ID 목록 */
  nextNodeIds: string[];
  /** 이 노드에 연결된 이전 레이어 노드 ID 목록 */
  prevNodeIds: string[];
  /** 전투 노드의 경우 적 ID */
  enemyId?: string;
  /** 방문 여부 */
  visited: boolean;
}

/** 구역 맵 */
export interface StageMap {
  /** 구역 정보 */
  zone: ZoneDefinition;
  /** 맵 노드 (레이어별) */
  layers: MapNode[][];
}

// ─── Constants ──────────────────────────────────────────────

/** 레이어별 최소/최대 노드 수 */
const MIN_NODES_PER_LAYER = 2;
const MAX_NODES_PER_LAYER = 4;

/** 노드 타입별 배치 가중치 (일반 레이어) */
const NODE_WEIGHTS: Record<NodeType, number> = {
  battle: 50,
  elite: 10,
  boss: 0,   // 보스는 마지막 레이어에 고정
  shop: 12,
  event: 18,
  repair: 10,
};

// ─── Generator ──────────────────────────────────────────────

/**
 * 구역의 스테이지 맵을 생성한다.
 *
 * 맵 구조:
 * - 레이어 0: 첫 번째 전투 노드들 (항상 전투)
 * - 레이어 1 ~ (N-3): 일반 노드 (전투, 엘리트, 상점, 이벤트, 수리 기지)
 * - 레이어 N-2: 수리 기지 (보스 전 휴식)
 * - 레이어 N-1: 보스 노드 (단일)
 *
 * @param zoneId 구역 ID (1-based)
 * @returns 생성된 스테이지 맵
 */
export function generateStageMap(zoneId: number): StageMap {
  const zone = ZONES.find((z) => z.id === zoneId);
  if (!zone) throw new Error(`Unknown zone: ${zoneId}`);

  // layerCount는 보스 전까지의 레이어 수 + 수리기지 + 보스 = 총 레이어
  // Planning.md: 3-5개 노드 레이어 + 엘리트 + 수리기지 + 보스
  // 구현: layerCount개의 일반 레이어 + 수리기지 + 보스 = layerCount + 2 총 레이어
  const normalLayerCount = zone.layerCount;
  const totalLayers = normalLayerCount + 2; // +1 repair, +1 boss

  const layers: MapNode[][] = [];

  // Generate node counts per layer
  for (let layer = 0; layer < totalLayers; layer++) {
    const isFirstLayer = layer === 0;
    const isRepairLayer = layer === totalLayers - 2;
    const isBossLayer = layer === totalLayers - 1;

    let nodeCount: number;

    if (isBossLayer) {
      nodeCount = 1; // 보스는 항상 단일 노드
    } else if (isRepairLayer) {
      nodeCount = 1; // 수리 기지는 단일 노드
    } else if (isFirstLayer) {
      nodeCount = randRange(MIN_NODES_PER_LAYER, MAX_NODES_PER_LAYER);
    } else {
      nodeCount = randRange(MIN_NODES_PER_LAYER, MAX_NODES_PER_LAYER);
    }

    const nodes: MapNode[] = [];
    for (let i = 0; i < nodeCount; i++) {
      let nodeType: NodeType;

      if (isBossLayer) {
        nodeType = "boss";
      } else if (isRepairLayer) {
        nodeType = "repair";
      } else if (isFirstLayer) {
        nodeType = "battle"; // 첫 레이어는 항상 전투
      } else {
        nodeType = pickNodeType();
      }

      const node: MapNode = {
        id: `${layer}-${i}`,
        layer,
        index: i,
        type: nodeType,
        nextNodeIds: [],
        prevNodeIds: [],
        enemyId: undefined,
        visited: false,
      };

      // 전투/엘리트/보스 노드에 적 배정
      if (nodeType === "battle" || nodeType === "elite" || nodeType === "boss") {
        node.enemyId = pickEnemy(zoneId, nodeType);
      }

      nodes.push(node);
    }

    layers.push(nodes);
  }

  // Generate edges (connections between layers)
  for (let layer = 0; layer < totalLayers - 1; layer++) {
    const currentLayer = layers[layer]!;
    const nextLayer = layers[layer + 1]!;

    connectLayers(currentLayer, nextLayer);
  }

  return { zone, layers };
}

// ─── Node Type Selection ────────────────────────────────────

function pickNodeType(): NodeType {
  const entries = Object.entries(NODE_WEIGHTS).filter(([, w]) => w > 0) as [NodeType, number][];
  const totalWeight = entries.reduce((sum, [, w]) => sum + w, 0);
  let roll = Math.random() * totalWeight;

  for (const [type, weight] of entries) {
    roll -= weight;
    if (roll <= 0) return type;
  }

  return "battle"; // fallback
}

// ─── Enemy Selection ────────────────────────────────────────

function pickEnemy(zoneId: number, nodeType: NodeType): string {
  const zoneEnemies = ENEMIES.filter((e) => e.zoneIds.includes(zoneId));

  let candidates;
  switch (nodeType) {
    case "boss":
      candidates = zoneEnemies.filter((e) => e.isBoss);
      break;
    case "elite":
      candidates = zoneEnemies.filter((e) => e.isElite);
      break;
    default:
      candidates = zoneEnemies.filter((e) => !e.isBoss && !e.isElite);
      break;
  }

  if (candidates.length === 0) {
    // fallback: any non-boss enemy in zone
    candidates = zoneEnemies.filter((e) => !e.isBoss);
    if (candidates.length === 0) {
      candidates = zoneEnemies;
    }
  }

  const enemy = candidates[Math.floor(Math.random() * candidates.length)]!;
  return enemy.id;
}

// ─── Layer Connection ───────────────────────────────────────

/**
 * 두 인접 레이어를 연결한다.
 *
 * 규칙:
 * 1. 모든 현재 레이어 노드는 최소 1개의 다음 노드와 연결
 * 2. 모든 다음 레이어 노드는 최소 1개의 이전 노드와 연결
 * 3. 가급적 교차하지 않도록 인접한 노드끼리 연결
 */
function connectLayers(current: MapNode[], next: MapNode[]): void {
  const cLen = current.length;
  const nLen = next.length;

  // Step 1: Each current node connects to at least one next node
  for (let ci = 0; ci < cLen; ci++) {
    // Map to proportional position in next layer
    const ni = Math.min(nLen - 1, Math.floor((ci / cLen) * nLen));
    addEdge(current[ci]!, next[ni]!);
  }

  // Step 2: Ensure each next node has at least one incoming edge
  for (let ni = 0; ni < nLen; ni++) {
    const nextNode = next[ni]!;
    if (nextNode.prevNodeIds.length === 0) {
      // Connect to nearest current node
      const ci = Math.min(cLen - 1, Math.floor((ni / nLen) * cLen));
      addEdge(current[ci]!, nextNode);
    }
  }

  // Step 3: Add some extra edges for branching (randomize)
  for (let ci = 0; ci < cLen; ci++) {
    const currentNode = current[ci]!;
    // Possibly add connection to adjacent next node
    const mappedNi = Math.min(nLen - 1, Math.floor((ci / cLen) * nLen));
    if (mappedNi + 1 < nLen && Math.random() < 0.4) {
      addEdge(currentNode, next[mappedNi + 1]!);
    }
    if (mappedNi - 1 >= 0 && Math.random() < 0.3) {
      addEdge(currentNode, next[mappedNi - 1]!);
    }
  }
}

function addEdge(from: MapNode, to: MapNode): void {
  if (!from.nextNodeIds.includes(to.id)) {
    from.nextNodeIds.push(to.id);
  }
  if (!to.prevNodeIds.includes(from.id)) {
    to.prevNodeIds.push(from.id);
  }
}

// ─── Utilities ──────────────────────────────────────────────

function randRange(min: number, max: number): number {
  return min + Math.floor(Math.random() * (max - min + 1));
}

/**
 * 맵에서 특정 ID의 노드를 찾는다.
 */
export function findNode(map: StageMap, nodeId: string): MapNode | undefined {
  for (const layer of map.layers) {
    for (const node of layer) {
      if (node.id === nodeId) return node;
    }
  }
  return undefined;
}

/**
 * 플레이어가 현재 선택 가능한 노드 ID 목록을 반환한다.
 *
 * - 아직 아무 노드도 방문하지 않았으면 → 첫 번째 레이어의 모든 노드
 * - 그렇지 않으면 → 마지막으로 방문한 노드의 nextNodeIds
 */
export function getSelectableNodeIds(
  map: StageMap,
  visitedNodeIds: string[],
): string[] {
  if (visitedNodeIds.length === 0) {
    // 첫 번째 레이어의 모든 노드
    const firstLayer = map.layers[0];
    return firstLayer ? firstLayer.map((n) => n.id) : [];
  }

  // 마지막으로 방문한 노드의 다음 노드들
  const lastVisitedId = visitedNodeIds[visitedNodeIds.length - 1]!;
  const lastNode = findNode(map, lastVisitedId);
  if (!lastNode) return [];

  return lastNode.nextNodeIds;
}

/**
 * 노드 타입을 한글로 반환한다.
 */
export function nodeTypeLabel(type: NodeType): string {
  switch (type) {
    case "battle": return "전투";
    case "elite": return "엘리트";
    case "boss": return "보스";
    case "shop": return "상점";
    case "event": return "이벤트";
    case "repair": return "수리 기지";
  }
}

/**
 * 노드 타입의 ASCII 아이콘을 반환한다.
 */
export function nodeTypeIcon(type: NodeType): string {
  switch (type) {
    case "battle": return "⚔";
    case "elite": return "☠";
    case "boss": return "★";
    case "shop": return "$";
    case "event": return "?";
    case "repair": return "+";
  }
}
