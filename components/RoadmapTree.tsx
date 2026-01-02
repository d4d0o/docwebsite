'use client';

import React, { useMemo, useEffect, useState, useCallback } from 'react';
import {
  ReactFlow,
  Node,
  Edge,
  Position,
  useNodesState,
  useEdgesState,
  useReactFlow,
  ConnectionMode,
  MarkerType,
  NodeMouseHandler,
} from '@reactflow/core';
import { Background } from '@reactflow/background';
import { Controls } from '@reactflow/controls';
import { MiniMap } from '@reactflow/minimap';
import '@reactflow/core/dist/style.css';
import dagre from 'dagre';
import { useRouter } from 'next/navigation';
import { RoadmapTreeNode } from '@/lib/github';

interface RoadmapTreeProps {
  tree: RoadmapTreeNode;
  repoName: string;
}

interface CustomNodeData {
  label: string;
  type: 'root' | 'part' | 'chapter';
  slug?: string;
  description?: string;
  repoName?: string;
}

const NODE_WIDTH = 280;
const NODE_HEIGHT = 100;

/**
 * Layout the graph using Dagre
 */
function getLayoutedElements(nodes: Node[], edges: Edge[], direction: 'LR' | 'TB' = 'TB') {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  const isHorizontal = direction === 'LR';

  dagreGraph.setGraph({
    rankdir: direction,
    nodesep: isHorizontal ? 60 : 100,
    ranksep: isHorizontal ? 100 : 80,
  });

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: NODE_WIDTH, height: NODE_HEIGHT });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  nodes.forEach((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    node.targetPosition = isHorizontal ? Position.Left : Position.Top;
    node.sourcePosition = isHorizontal ? Position.Right : Position.Bottom;

    // Slight random offset to make it look less robotic if desired, 
    // but for this design strict alignment is better.
    node.position = {
      x: nodeWithPosition.x - NODE_WIDTH / 2,
      y: nodeWithPosition.y - NODE_HEIGHT / 2,
    };
  });

  return { nodes, edges };
}

/**
 * Custom Node Component matching the PaperCode ML150 aesthetic.
 * Minimalist, dark, border-focused.
 */
function CustomNode({ data }: { data: CustomNodeData }): React.JSX.Element {
  const { label, type, slug } = data;
  const isClickable = type === 'chapter' && !!slug;

  const getCategory = (): string => {
    if (type === 'root') return 'ROOT';
    if (type === 'part') {
      const partMatch = label.match(/part\s+(\d+)/i);
      return partMatch ? `PART ${partMatch[1]}` : 'MODULE';
    }
    return 'CHAPTER';
  };

  const getTitle = (): string => {
    if (type === 'part') {
      const cleanLabel = label.replace(/^part\s+\d+[:\s-]*/i, '').trim();
      return cleanLabel || label;
    }
    // "01_introduction" -> "Introduction"
    return label
      .replace(/^\d+[-_]?/, '')
      .replace(/_/g, ' ')
      .replace('.md', '')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const Icon = () => {
    if (type === 'root') {
      return (
        <svg className="w-5 h-5 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      );
    }
    if (type === 'part') {
      return (
        <svg className="w-5 h-5 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    }
    // Chapter icon
    return (
      <svg className="w-5 h-5 text-gray-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    );
  };

  return (
    <div
      className={`
        group relative w-full h-full flex flex-col items-center justify-center
        bg-[#0a0a0a] border border-[#333] rounded-xl px-6 py-4
        transition-all duration-200
        ${isClickable ? 'hover:border-white cursor-pointer hover:shadow-[0_0_15px_rgba(255,255,255,0.1)]' : ''}
      `}
    >
      {/* Top connector dot (visual only) */}
      <div className="absolute -top-[1px] left-1/2 -translate-x-1/2 w-2 h-[1px] bg-[#333] group-hover:bg-white transition-colors" />

      {/* Icon Bubble */}
      <div className="mb-3 p-2 rounded-lg bg-[#111] border border-[#222] group-hover:border-[#444] transition-colors">
        <Icon />
      </div>

      <div className="text-center">
        <div className="text-[10px] font-mono uppercase tracking-widest text-gray-500 mb-1">
          {getCategory()}
        </div>
        <div className="text-sm font-bold text-gray-200 group-hover:text-white leading-tight">
          {getTitle()}
        </div>
      </div>
    </div>
  );
}

const nodeTypes = {
  custom: CustomNode,
};

function FitViewHelper() {
  const { fitView } = useReactFlow();

  useEffect(() => {
    const timer = setTimeout(() => {
      fitView({ padding: 0.15, duration: 800 });
    }, 100);
    return () => clearTimeout(timer);
  }, [fitView]);

  return null;
}

export default function RoadmapTree({ tree, repoName }: RoadmapTreeProps): React.JSX.Element {
  const router = useRouter();
  const [direction, setDirection] = useState<'LR' | 'TB'>('TB');
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);

  // Handle responsive layout
  useEffect(() => {
    const updateDirection = () => {
      // Use Left-to-Right on smaller screens for better vertical scrolling flow
      setDirection(window.innerWidth < 768 ? 'LR' : 'TB');
    };
    updateDirection();
    window.addEventListener('resize', updateDirection);
    return () => window.removeEventListener('resize', updateDirection);
  }, []);

  // Construct graph
  const { nodes: layoutedNodes, edges: layoutedEdges } = useMemo(() => {
    const flowNodes: Node[] = [];
    const flowEdges: Edge[] = [];

    const buildNodes = (node: RoadmapTreeNode, parentId?: string) => {
      const nodeId = node.id;

      flowNodes.push({
        id: nodeId,
        type: 'custom',
        position: { x: 0, y: 0 },
        data: {
          label: node.label,
          type: node.type,
          slug: node.slug,
          repoName,
        },
      });

      if (parentId) {
        flowEdges.push({
          id: `${parentId}-${nodeId}`,
          source: parentId,
          target: nodeId,
          type: 'bezier', // Smooth curved lines like ML150
          animated: false,
          style: {
            stroke: '#888', // Lighter grey for visibility
            strokeWidth: 2,
            opacity: 0.8,
          },
        });
      }

      if (node.children) {
        node.children.forEach((child) => {
          buildNodes(child, nodeId);
        });
      }
    };

    buildNodes(tree);

    return getLayoutedElements(flowNodes, flowEdges, direction);
  }, [tree, direction, repoName]);

  // Update layout when nodes/direction change
  useEffect(() => {
    setNodes(layoutedNodes);
    setEdges(layoutedEdges);
  }, [layoutedNodes, layoutedEdges, setNodes, setEdges]);

  // Handle node clicks
  const onNodeClick: NodeMouseHandler = useCallback((_, node) => {
    const { type, slug } = node.data as CustomNodeData;
    if (type === 'chapter' && slug) {
      router.push(`/${repoName}/${slug}`);
    }
  }, [repoName, router]);

  return (
    // "Utilize full screen" - Using h-[calc(100vh-140px)] min-h-[600px] to ensure sufficient space
    <div className="w-full h-[85vh] min-h-[600px] border border-gray-800 rounded-xl bg-black overflow-hidden shadow-2xl relative ring-1 ring-gray-800">
      {/* Subtle grid background if desired */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-5 pointer-events-none" />

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        connectionMode={ConnectionMode.Loose}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={true} // Enable selection for clicking
        fitView
        fitViewOptions={{ padding: 0.15 }} // Reduced padding
        className="bg-black"
        minZoom={0.5} // Prevent too-small initial view
        maxZoom={2}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="#222"
          gap={24}
          size={1}
          style={{ opacity: 0.5 }}
        />
        <Controls
          className="bg-gray-900/90 border-gray-700 [&>button]:bg-transparent [&>button]:text-gray-400 [&>button:hover]:text-white [&>button]:border-0"
          position="bottom-right"
          showInteractive={false}
        />
        <FitViewHelper />
      </ReactFlow>
    </div>
  );
}

