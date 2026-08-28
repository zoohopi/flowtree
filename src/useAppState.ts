import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AppState, Difficulty, TreeNode } from './types';
import { createId, loadState, saveState } from './storage';

export function useAppState() {
  const [state, setState] = useState<AppState>(() => loadState());

  // 모든 변경을 즉시 localStorage에 반영
  const first = useRef(true);
  useEffect(() => {
    if (first.current) {
      first.current = false;
      return;
    }
    saveState(state);
  }, [state]);

  const nodesById = useMemo(() => {
    const map = new Map<string, TreeNode>();
    for (const n of state.nodes) map.set(n.id, n);
    return map;
  }, [state.nodes]);

  const childrenOf = useCallback(
    (parentId: string | null) => state.nodes.filter((n) => n.parentId === parentId),
    [state.nodes],
  );

  const inProgressNode = useMemo(
    () => state.nodes.find((n) => n.status === 'in_progress') ?? null,
    [state.nodes],
  );

  const addChild = useCallback((parentId: string) => {
    setState((s) => ({
      ...s,
      nodes: [
        ...s.nodes,
        {
          id: createId(),
          parentId,
          text: '',
          status: 'todo',
          startedAt: null,
          elapsedSeconds: null,
          difficulty: null,
          completedAt: null,
          flowLogId: null,
        },
      ],
    }));
  }, []);

  const deleteNode = useCallback((id: string) => {
    setState((s) => {
      const toDelete = new Set<string>();
      const walk = (nid: string) => {
        toDelete.add(nid);
        for (const c of s.nodes.filter((n) => n.parentId === nid)) walk(c.id);
      };
      walk(id);
      return { ...s, nodes: s.nodes.filter((n) => !toDelete.has(n.id)) };
    });
  }, []);

  const updateText = useCallback((id: string, text: string) => {
    setState((s) => ({
      ...s,
      nodes: s.nodes.map((n) => (n.id === id ? { ...n, text } : n)),
    }));
  }, []);

  // 시작한 적 없는 todo 노드를 바로 완료/미완료 토글
  const toggleTodoDone = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      nodes: s.nodes.map((n) => {
        if (n.id !== id) return n;
        if (n.status === 'done') {
          return { ...n, status: 'todo', completedAt: null };
        }
        return { ...n, status: 'done', completedAt: Date.now() };
      }),
    }));
  }, []);

  const startSession = useCallback((id: string) => {
    setState((s) => ({
      ...s,
      nodes: s.nodes.map((n) =>
        n.id === id
          ? { ...n, status: 'in_progress', startedAt: Date.now(), completedAt: null }
          : n,
      ),
    }));
  }, []);

  const completeSession = useCallback((id: string, difficulty: Difficulty) => {
    setState((s) => ({
      ...s,
      nodes: s.nodes.map((n) => {
        if (n.id !== id) return n;
        const started = n.startedAt ?? Date.now();
        const elapsed = Math.max(1, Math.round((Date.now() - started) / 1000));
        return {
          ...n,
          status: 'done',
          elapsedSeconds: elapsed,
          difficulty,
          completedAt: Date.now(),
        };
      }),
    }));
  }, []);

  const attachFlowLog = useCallback((nodeId: string, note: string) => {
    setState((s) => {
      const log = { id: createId(), note: note.trim(), createdAt: Date.now() };
      return {
        ...s,
        flowLogs: [...s.flowLogs, log],
        nodes: s.nodes.map((n) => (n.id === nodeId ? { ...n, flowLogId: log.id } : n)),
      };
    });
  }, []);

  const setPrinciples = useCallback((text: string) => {
    setState((s) => ({ ...s, flowPrinciples: text }));
  }, []);

  return {
    state,
    nodesById,
    childrenOf,
    inProgressNode,
    addChild,
    deleteNode,
    updateText,
    toggleTodoDone,
    startSession,
    completeSession,
    attachFlowLog,
    setPrinciples,
  };
}
