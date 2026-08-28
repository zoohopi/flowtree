import { useEffect, useMemo, useState } from 'react';
import type { Difficulty, FlowLog } from './types';
import { useAppState } from './useAppState';
import { MindMap } from './components/MindMap';
import { PrinciplesPanel } from './components/PrinciplesPanel';
import { Modal } from './components/Modal';

type ModalState =
  | { kind: 'none' }
  | { kind: 'warmup'; nodeId: string }
  | { kind: 'busy' }
  | { kind: 'difficulty'; nodeId: string }
  | { kind: 'flowlog'; nodeId: string }
  | { kind: 'deleteConfirm'; nodeId: string };

const DIFF_OPTIONS: { value: Difficulty; label: string }[] = [
  { value: 'easy', label: '너무 쉬움' },
  { value: 'good', label: '딱 좋음' },
  { value: 'hard', label: '너무 어려움' },
];

export default function App() {
  const api = useAppState();
  const { state, nodesById, childrenOf, inProgressNode } = api;
  const [modal, setModal] = useState<ModalState>({ kind: 'none' });
  const [logDraft, setLogDraft] = useState('');
  const [now, setNow] = useState(() => Date.now());

  // 진행 중인 세션이 있을 때만 1초마다 갱신
  useEffect(() => {
    if (!inProgressNode) return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [inProgressNode]);

  const rootId = useMemo(() => childrenOf(null)[0]?.id ?? '', [childrenOf]);

  const flowLogsById = useMemo(() => {
    const map = new Map<string, FlowLog>();
    for (const l of state.flowLogs) map.set(l.id, l);
    return map;
  }, [state.flowLogs]);

  const handleStartRequest = (nodeId: string) => {
    if (inProgressNode && inProgressNode.id !== nodeId) {
      setModal({ kind: 'busy' });
      return;
    }
    setModal({ kind: 'warmup', nodeId });
  };

  const handleCheckboxRequest = (nodeId: string) => {
    const node = nodesById.get(nodeId);
    if (!node) return;
    if (node.status === 'in_progress') {
      setModal({ kind: 'difficulty', nodeId });
    } else {
      api.toggleTodoDone(nodeId);
    }
  };

  const confirmWarmup = (nodeId: string) => {
    api.startSession(nodeId);
    setModal({ kind: 'none' });
  };

  const selectDifficulty = (nodeId: string, d: Difficulty) => {
    api.completeSession(nodeId, d);
    setLogDraft('');
    setModal({ kind: 'flowlog', nodeId });
  };

  const saveFlowLog = (nodeId: string) => {
    api.attachFlowLog(nodeId, logDraft);
    setModal({ kind: 'none' });
  };

  return (
    <div className="min-h-full">
      <header className="border-b border-line px-6 py-4">
        <h1 className="text-xl font-semibold text-ink">몰입 트리</h1>
        <p className="mt-0.5 text-sm text-muted">
          목표를 쪼개고 · 워밍업으로 진입하고 · 집중을 기록해 나만의 몰입 조건을 재현하기
        </p>
      </header>

      <main className="overflow-auto">
        {rootId && (
          <MindMap
            rootId={rootId}
            nodesById={nodesById}
            childrenOf={childrenOf}
            flowLogsById={flowLogsById}
            now={now}
            onEditText={api.updateText}
            onAddChild={api.addChild}
            onDeleteRequest={(id) => setModal({ kind: 'deleteConfirm', nodeId: id })}
            onStartRequest={handleStartRequest}
            onCheckboxRequest={handleCheckboxRequest}
          />
        )}
      </main>

      <PrinciplesPanel value={state.flowPrinciples} onChange={api.setPrinciples} />

      {modal.kind === 'warmup' && (
        <Modal title="워밍업 타임">
          <p className="text-sm leading-relaxed text-ink">
            아이패드로 가벼운 워크플로우를 세우세요.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModal({ kind: 'none' })}
              className="rounded-lg px-3 py-1.5 text-sm text-muted hover:text-ink"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => confirmWarmup(modal.nodeId)}
              className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent/90"
            >
              시작
            </button>
          </div>
        </Modal>
      )}

      {modal.kind === 'busy' && (
        <Modal title="이미 진행 중인 목표가 있어요">
          <p className="text-sm leading-relaxed text-ink">
            한 번에 하나의 목표에만 집중할 수 있어요. 진행 중인 목표를 먼저 완료하거나
            멈춘 뒤 다시 시작하세요.
          </p>
          <div className="mt-5 flex justify-end">
            <button
              type="button"
              onClick={() => setModal({ kind: 'none' })}
              className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent/90"
            >
              확인
            </button>
          </div>
        </Modal>
      )}

      {modal.kind === 'difficulty' && (
        <Modal title="이번 목표의 난이도는 어땠나요?">
          <div className="mt-2 flex flex-col gap-2">
            {DIFF_OPTIONS.map((o) => (
              <button
                key={o.value}
                type="button"
                onClick={() => selectDifficulty(modal.nodeId, o.value)}
                className={[
                  'rounded-lg border px-4 py-2 text-sm transition-colors',
                  o.value === 'good'
                    ? 'border-accent text-accent hover:bg-accent/10'
                    : 'border-line text-ink hover:bg-paper',
                ].join(' ')}
              >
                {o.label}
              </button>
            ))}
          </div>
        </Modal>
      )}

      {modal.kind === 'flowlog' && (
        <Modal title="방금 몰입은 어땠나요?">
          <p className="text-sm leading-relaxed text-muted">
            잘 됐던 / 방해됐던 조건을 남겨두면 다음에 재현하기 쉬워요.
          </p>
          <textarea
            value={logDraft}
            onChange={(e) => setLogDraft(e.target.value)}
            rows={3}
            autoFocus
            placeholder="예) 알림 끄고 15분 워밍업하니 바로 몰입됨"
            className="mt-3 w-full resize-none rounded-lg border border-line bg-paper px-3 py-2 text-sm outline-none focus:border-accent"
          />
          <div className="mt-4 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModal({ kind: 'none' })}
              className="rounded-lg px-3 py-1.5 text-sm text-muted hover:text-ink"
            >
              건너뛰기
            </button>
            <button
              type="button"
              onClick={() => saveFlowLog(modal.nodeId)}
              className="rounded-lg bg-accent px-4 py-1.5 text-sm font-medium text-white hover:bg-accent/90"
            >
              저장
            </button>
          </div>
        </Modal>
      )}

      {modal.kind === 'deleteConfirm' && (
        <Modal title="이 목표를 삭제할까요?">
          <p className="text-sm leading-relaxed text-ink">
            하위 목표도 함께 삭제되며 되돌릴 수 없어요.
          </p>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setModal({ kind: 'none' })}
              className="rounded-lg px-3 py-1.5 text-sm text-muted hover:text-ink"
            >
              취소
            </button>
            <button
              type="button"
              onClick={() => {
                api.deleteNode(modal.nodeId);
                setModal({ kind: 'none' });
              }}
              className="rounded-lg bg-rose-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-rose-500"
            >
              삭제
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
}
