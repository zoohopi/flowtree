export type Difficulty = 'easy' | 'good' | 'hard'; // 너무 쉬움 / 딱 좋음 / 너무 어려움

export interface FlowLog {
  id: string;
  note: string;
  createdAt: number;
}

export interface TreeNode {
  id: string;
  parentId: string | null; // null이면 루트
  text: string;
  status: 'todo' | 'in_progress' | 'done';
  startedAt: number | null; // 타이머 시작 시각(ms)
  elapsedSeconds: number | null; // 완료 시 확정된 소요 시간
  difficulty: Difficulty | null;
  completedAt: number | null;
  flowLogId: string | null; // 연결된 몰입 기록
}

export interface AppState {
  nodes: TreeNode[];
  flowLogs: FlowLog[];
  flowPrinciples: string; // 나만의 몰입 조건/원칙
}
