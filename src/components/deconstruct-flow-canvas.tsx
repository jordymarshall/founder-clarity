import React, { useEffect, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Node,
  NodeProps,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { cn } from '@/lib/utils';
import type { NodeTypes } from '@xyflow/react';

// UX: A flowy, collaborative canvas for idea deconstruction blocks.
// - Freeform spatial layout makes it easier to digest and edit.
// - Nodes = bullets grouped by category columns.
// - Inline editing using native inputs (no hover/transition effects).
// - Keeps same inputs/outputs as previous DeconstructCanvas props.

export interface DeconstructFlowCanvasProps {
  className?: string;
  idea: string;
  initialData?: {
    problem?: string[];
    existingAlternatives?: string[];
    customerSegments?: string[];
    earlyAdopters?: string[];
    jobToBeDone?: string[];
  };
  onBlocksChange?: (blocks: {
    id: string;
    category: BlockCategory;
    title: string;
    content: string;
  }[]) => void;
}

type BlockCategory = 'problem' | 'alternatives' | 'segments' | 'early-adopters' | 'job-to-be-done';
interface BlockData {
  category: BlockCategory;
  label: string;
  text: string;
  onChange?: (id: string, text: string) => void;
}

const categoryOrder: Array<{ key: keyof NonNullable<DeconstructFlowCanvasProps['initialData']>; label: string; toBlockKey: BlockCategory }>
  = [
    { key: 'problem', label: 'Problem', toBlockKey: 'problem' },
    { key: 'existingAlternatives', label: 'Existing Alternatives', toBlockKey: 'alternatives' },
    { key: 'customerSegments', label: 'Customer Segments', toBlockKey: 'segments' },
    { key: 'earlyAdopters', label: 'Early Adopters', toBlockKey: 'early-adopters' },
    { key: 'jobToBeDone', label: 'Job to be Done', toBlockKey: 'job-to-be-done' },
  ];

function makeNodesFromInitial(initial?: DeconstructFlowCanvasProps['initialData']): Node<BlockData>[] {
  const nodes: Node<BlockData>[] = [];
  if (!initial) return nodes;

  const colX = [0, 330, 660, 990, 1320];
  const rowH = 130;

  categoryOrder.forEach((cat, col) => {
    const arr = (initial as any)?.[cat.key] as string[] | undefined;
    (arr || []).slice(0, 8).forEach((text, idx) => {
      const id = `${cat.toBlockKey}-${idx}`;
      nodes.push({
        id,
        type: 'block',
        data: {
          category: cat.toBlockKey,
          label: cat.label,
          text,
        },
        position: { x: colX[col], y: idx * rowH },
        selectable: true,
        draggable: true,
      } as Node<BlockData>);
    });
  });

  return nodes;
}

function BlockNode({ data, id }: NodeProps<BlockData>) {
  return (
    <div className={cn(
      'w-[300px] border rounded-md p-3 bg-card text-card-foreground border-border',
      'shadow-none'
    )}>
      <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">
        {data.label}
      </div>
      <textarea
        className={cn(
          'w-full min-h-[72px] text-sm leading-relaxed bg-transparent outline-none',
          'border border-border rounded p-2'
        )}
        value={data.text}
        onChange={(e) => data.onChange?.(id, e.target.value)}
        spellCheck={false}
      />
    </div>
  );
}

const nodeTypes = { block: BlockNode } as const;

export function DeconstructFlowCanvas({ className, idea, initialData, onBlocksChange }: DeconstructFlowCanvasProps) {
  const initialNodes = useMemo(() => makeNodesFromInitial(initialData), [initialData]);
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<BlockData>[]>(initialNodes);
  const [edges, _setEdges, onEdgesChange] = useEdgesState([]);

  // attach handlers into node data once mounted/updated
  useEffect(() => {
    setNodes((prev) => prev.map((n) => ({
      ...n,
      data: {
        ...(n.data as BlockData),
        onChange: (id: string, text: string) => {
          setNodes((curr) => curr.map((m) => m.id === id ? { ...m, data: { ...(m.data as BlockData), text } } : m));
        },
      },
    })) as Node<BlockData>[]);
  }, [setNodes]);

  // bubble up block changes whenever nodes change
  useEffect(() => {
    const blocks = nodes.map((n) => {
      const d = n.data as BlockData;
      return {
        id: n.id,
        category: d.category,
        title: (d.text || '').split(':')[0] || 'Insight',
        content: d.text || '',
      };
    });
    onBlocksChange?.(blocks);
  }, [nodes, onBlocksChange]);

  return (
    <div className={cn('h-[70vh] w-full border rounded-md bg-background', className)}>
      <ReactFlow
        nodes={nodes as Node[]}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        attributionPosition="bottom-right"
        nodeTypes={nodeTypes}
        proOptions={{ hideAttribution: true }}
        className="react-flow"
      >
        <MiniMap zoomable pannable />
        <Controls position="top-left" />
        <Background />
      </ReactFlow>
    </div>
  );
}

export default DeconstructFlowCanvas;
