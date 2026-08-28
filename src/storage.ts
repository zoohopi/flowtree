import type { AppState, TreeNode } from './types';

const STORAGE_KEY = 'flow-tree:v1';

export function createId(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36).slice(-4);
}

function createRootNode(): TreeNode {
  return {
    id: createId(),
    parentId: null,
    text: '최상위 목표',
    status: 'todo',
    startedAt: null,
    elapsedSeconds: null,
    difficulty: null,
    completedAt: null,
    flowLogId: null,
  };
}

export function defaultState(): AppState {
  return {
    nodes: [createRootNode()],
    flowLogs: [],
    flowPrinciples: '',
  };
}

export function loadState(): AppState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw) as Partial<AppState>;
    const nodes = Array.isArray(parsed.nodes) && parsed.nodes.length > 0 ? parsed.nodes : defaultState().nodes;
    return {
      nodes: nodes as TreeNode[],
      flowLogs: Array.isArray(parsed.flowLogs) ? parsed.flowLogs : [],
      flowPrinciples: typeof parsed.flowPrinciples === 'string' ? parsed.flowPrinciples : '',
    };
  } catch {
    return defaultState();
  }
}

export function saveState(state: AppState): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // 저장 실패는 조용히 무시 (용량 초과 등)
  }
}
