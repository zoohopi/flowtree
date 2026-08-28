import { useEffect, useRef, useState } from 'react';
import type { Difficulty, FlowLog, TreeNode } from '../types';

const DIFF_LABEL: Record<Difficulty, string> = {
  easy: '너무 쉬움',
  good: '딱 좋음',
  hard: '너무 어려움',
};

const DIFF_CLASS: Record<Difficulty, string> = {
  easy: 'bg-amber-100 text-amber-800',
  good: 'bg-accent/15 text-accent',
  hard: 'bg-rose-100 text-rose-700',
};

export function formatDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  if (m === 0) return `${s}초`;
  return `${m}분 ${s}초`;
}

interface Props {
  node: TreeNode;
  isRoot: boolean;
  liveElapsed: number | null; // 진행 중일 때 실시간 경과(초)
  flowLog: FlowLog | null;
  onEditText: (text: string) => void;
  onAddChild: () => void;
  onDelete: () => void;
  onStart: () => void;
  onToggleDone: () => void;
}

export function NodeCard({
  node,
  isRoot,
  liveElapsed,
  flowLog,
  onEditText,
  onAddChild,
  onDelete,
  onStart,
  onToggleDone,
}: Props) {
  const [editing, setEditing] = useState(node.text === '');
  const [draft, setDraft] = useState(node.text);
  const [showLog, setShowLog] = useState(false);
  const taRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (editing) {
      setDraft(node.text);
      taRef.current?.focus();
      taRef.current?.select();
    }
  }, [editing, node.text]);

  const commit = () => {
    setEditing(false);
    if (draft !== node.text) onEditText(draft);
  };

  const done = node.status === 'done';
  const running = node.status === 'in_progress';
  const highlightGood = done && node.difficulty === 'good';

  return (
    <div
      className={[
        'w-56 rounded-lg border bg-card px-3 py-2.5 text-left shadow-sm transition-colors',
        highlightGood ? 'border-accent ring-1 ring-accent/40' : 'border-line',
        running ? 'border-accent/60' : '',
      ].join(' ')}
    >
      <div className="flex items-start gap-2">
        <input
          type="checkbox"
          checked={done}
          onChange={onToggleDone}
          className="mt-1 h-4 w-4 shrink-0 accent-accent"
          aria-label="완료"
        />
        {editing ? (
          <textarea
            ref={taRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={commit}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                commit();
              }
              if (e.key === 'Escape') setEditing(false);
            }}
            rows={2}
            placeholder="목표 내용"
            className="w-full resize-none rounded border border-line bg-paper px-2 py-1 text-sm outline-none focus:border-accent"
          />
        ) : (
          <button
            type="button"
            onClick={() => setEditing(true)}
            className={[
              'w-full whitespace-pre-wrap break-words text-sm',
              done ? 'text-muted line-through' : 'text-ink',
              node.text === '' ? 'italic text-muted' : '',
            ].join(' ')}
          >
            {node.text || '목표 입력…'}
          </button>
        )}
      </div>

      {(done || running) && (
        <div className="mt-2 flex flex-wrap items-center gap-1.5 text-xs">
          {done && node.difficulty && (
            <span className={`rounded px-1.5 py-0.5 font-medium ${DIFF_CLASS[node.difficulty]}`}>
              {DIFF_LABEL[node.difficulty]}
            </span>
          )}
          {done && node.elapsedSeconds != null && (
            <span className="text-muted">{formatDuration(node.elapsedSeconds)}</span>
          )}
          {running && liveElapsed != null && (
            <span className="text-muted">진행 중 · {formatDuration(liveElapsed)}</span>
          )}
        </div>
      )}

      {done && flowLog && (
        <div className="mt-1.5 text-xs">
          <button
            type="button"
            onClick={() => setShowLog((v) => !v)}
            className="text-accent hover:underline"
          >
            {showLog ? '몰입 기록 숨기기' : '몰입 기록 보기'}
          </button>
          {showLog && (
            <p className="mt-1 whitespace-pre-wrap rounded bg-paper px-2 py-1 text-muted">
              {flowLog.note || '(내용 없음)'}
            </p>
          )}
        </div>
      )}

      <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
        {!done && !running && (
          <button type="button" onClick={onStart} className="text-accent hover:underline">
            ▶ 시작
          </button>
        )}
        <button type="button" onClick={onAddChild} className="text-muted hover:text-ink">
          + 하위 목표
        </button>
        {!isRoot && (
          <button type="button" onClick={onDelete} className="text-muted hover:text-rose-600">
            삭제
          </button>
        )}
      </div>
    </div>
  );
}
