import type { FlowLog, TreeNode } from '../types';
import { NodeCard } from './NodeCard';

type Side = 'left' | 'right';

interface Props {
  rootId: string;
  nodesById: Map<string, TreeNode>;
  childrenOf: (parentId: string | null) => TreeNode[];
  flowLogsById: Map<string, FlowLog>;
  now: number;
  onEditText: (id: string, text: string) => void;
  onAddChild: (id: string) => void;
  onDeleteRequest: (id: string) => void;
  onStartRequest: (id: string) => void;
  onCheckboxRequest: (id: string) => void;
}

export function MindMap(props: Props) {
  const { rootId, nodesById, childrenOf } = props;
  const root = nodesById.get(rootId);
  if (!root) return null;

  const children = childrenOf(rootId);
  // 균형을 위해 번갈아 배치: 짝수 번째는 오른쪽, 홀수 번째는 왼쪽
  const right = children.filter((_, i) => i % 2 === 0);
  const left = children.filter((_, i) => i % 2 === 1);

  return (
    <div className="mm">
      <div className="mm-branches mm-branches--left">
        {left.map((c) => (
          <Branch key={c.id} {...props} nodeId={c.id} side="left" />
        ))}
      </div>

      <div
        className={[
          'mm-center',
          right.length > 0 ? 'has-right' : '',
          left.length > 0 ? 'has-left' : '',
        ].join(' ')}
      >
        <NodeContent {...props} node={root} isRoot />
      </div>

      <div className="mm-branches mm-branches--right">
        {right.map((c) => (
          <Branch key={c.id} {...props} nodeId={c.id} side="right" />
        ))}
      </div>
    </div>
  );
}

function Branch(props: Props & { nodeId: string; side: Side }) {
  const { nodeId, side, nodesById, childrenOf } = props;
  const node = nodesById.get(nodeId);
  if (!node) return null;
  const kids = childrenOf(nodeId);

  return (
    <div className={['mb', `mb--${side}`, kids.length > 0 ? 'has-kids' : ''].join(' ')}>
      <div className="mb-node">
        <NodeContent {...props} node={node} isRoot={false} />
      </div>
      {kids.length > 0 && (
        <div className="mb-kids">
          {kids.map((k) => (
            <Branch key={k.id} {...props} nodeId={k.id} side={side} />
          ))}
        </div>
      )}
    </div>
  );
}

function NodeContent(props: Props & { node: TreeNode; isRoot: boolean }) {
  const { node, isRoot, flowLogsById, now } = props;
  const liveElapsed =
    node.status === 'in_progress' && node.startedAt != null
      ? Math.max(0, Math.round((now - node.startedAt) / 1000))
      : null;

  return (
    <NodeCard
      node={node}
      isRoot={isRoot}
      liveElapsed={liveElapsed}
      flowLog={node.flowLogId ? flowLogsById.get(node.flowLogId) ?? null : null}
      onEditText={(t) => props.onEditText(node.id, t)}
      onAddChild={() => props.onAddChild(node.id)}
      onDelete={() => props.onDeleteRequest(node.id)}
      onStart={() => props.onStartRequest(node.id)}
      onToggleDone={() => props.onCheckboxRequest(node.id)}
    />
  );
}
