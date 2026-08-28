import type { FlowLog, TreeNode } from '../types';
import { NodeCard } from './NodeCard';

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

export function TreeView(props: Props) {
  const { rootId } = props;
  return (
    <div className="tree-wrap">
      <ul className="tree">
        <Branch {...props} nodeId={rootId} />
      </ul>
    </div>
  );
}

function Branch(props: Props & { nodeId: string }) {
  const {
    nodeId,
    nodesById,
    childrenOf,
    flowLogsById,
    now,
    rootId,
    onEditText,
    onAddChild,
    onDeleteRequest,
    onStartRequest,
    onCheckboxRequest,
  } = props;

  const node = nodesById.get(nodeId);
  if (!node) return null;
  const kids = childrenOf(nodeId);

  const liveElapsed =
    node.status === 'in_progress' && node.startedAt != null
      ? Math.max(0, Math.round((now - node.startedAt) / 1000))
      : null;

  return (
    <li>
      <NodeCard
        node={node}
        isRoot={node.id === rootId}
        liveElapsed={liveElapsed}
        flowLog={node.flowLogId ? flowLogsById.get(node.flowLogId) ?? null : null}
        onEditText={(t) => onEditText(node.id, t)}
        onAddChild={() => onAddChild(node.id)}
        onDelete={() => onDeleteRequest(node.id)}
        onStart={() => onStartRequest(node.id)}
        onToggleDone={() => onCheckboxRequest(node.id)}
      />
      {kids.length > 0 && (
        <ul>
          {kids.map((k) => (
            <Branch key={k.id} {...props} nodeId={k.id} />
          ))}
        </ul>
      )}
    </li>
  );
}
