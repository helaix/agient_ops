import React, { useRef, useEffect } from 'react';
import { useDrop } from 'react-dnd';
import { WorkflowNode, Connection } from '../../../types/workflow';
import WorkflowNodeComponent from './WorkflowNodeComponent';
import ConnectionLine from './ConnectionLine';

interface WorkflowCanvasProps {
  nodes: WorkflowNode[];
  connections: Connection[];
  selectedNodeId: string | null;
  selectedConnectionId: string | null;
  connectionInProgress: {
    sourceNodeId: string;
    sourceIsOutput: boolean;
    x: number;
    y: number;
  } | null;
  isGridLayout: boolean;
  onNodeMove: (nodeId: string, position: { x: number, y: number }) => void;
  onNodeSelect: (nodeId: string | null) => void;
  onConnectionSelect: (connectionId: string | null) => void;
  onStartConnection: (nodeId: string, isOutput: boolean, x: number, y: number) => void;
  onUpdateConnection: (x: number, y: number) => void;
  onCompleteConnection: (targetNodeId: string, isInput: boolean) => void;
  onCancelConnection: () => void;
}

const WorkflowCanvas: React.FC<WorkflowCanvasProps> = ({
  nodes,
  connections,
  selectedNodeId,
  selectedConnectionId,
  connectionInProgress,
  isGridLayout,
  onNodeMove,
  onNodeSelect,
  onConnectionSelect,
  onStartConnection,
  onUpdateConnection,
  onCompleteConnection,
  onCancelConnection
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const tempLineRef = useRef<SVGLineElement>(null);

  // Set up drop target for agents
  const [{ isOver }, drop] = useDrop(() => ({
    accept: 'AGENT',
    drop: (item: any, monitor) => {
      const offset = monitor.getClientOffset();
      if (offset && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const x = offset.x - canvasRect.left;
        const y = offset.y - canvasRect.top;
        
        // If grid layout is enabled, snap to grid
        const gridSize = 20;
        const snappedX = isGridLayout ? Math.round(x / gridSize) * gridSize : x;
        const snappedY = isGridLayout ? Math.round(y / gridSize) * gridSize : y;
        
        return { x: snappedX, y: snappedY };
      }
      return undefined;
    },
    collect: (monitor) => ({
      isOver: !!monitor.isOver(),
    }),
  }));

  // Handle mouse move for connection in progress
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (connectionInProgress && canvasRef.current) {
        const canvasRect = canvasRef.current.getBoundingClientRect();
        const x = e.clientX - canvasRect.left;
        const y = e.clientY - canvasRect.top;
        onUpdateConnection(x, y);
      }
    };

    const handleMouseUp = () => {
      if (connectionInProgress) {
        onCancelConnection();
      }
    };

    if (connectionInProgress) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
    }

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [connectionInProgress, onUpdateConnection, onCancelConnection]);

  // Handle canvas click to deselect
  const handleCanvasClick = (e: React.MouseEvent) => {
    if (e.target === canvasRef.current) {
      onNodeSelect(null);
      onConnectionSelect(null);
    }
  };

  // Calculate connection points for nodes
  const getConnectionPoints = (nodeId: string, isOutput: boolean) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return { x: 0, y: 0 };
    
    const nodeElement = document.getElementById(`node-${nodeId}`);
    if (!nodeElement) return { x: 0, y: 0 };
    
    const nodeRect = nodeElement.getBoundingClientRect();
    const canvasRect = canvasRef.current?.getBoundingClientRect() || { left: 0, top: 0 };
    
    const x = isOutput 
      ? nodeRect.right - canvasRect.left 
      : nodeRect.left - canvasRect.left;
    const y = nodeRect.top + (nodeRect.height / 2) - canvasRect.top;
    
    return { x, y };
  };

  return (
    <div 
      ref={(el) => {
        canvasRef.current = el as HTMLDivElement;
        drop(el);
      }}
      className="workflow-canvas"
      onClick={handleCanvasClick}
      style={{ 
        position: 'relative', 
        width: '100%', 
        height: '100%',
        backgroundSize: isGridLayout ? '20px 20px' : 'auto'
      }}
    >
      {/* Render all connections */}
      <svg 
        width="100%" 
        height="100%" 
        style={{ position: 'absolute', pointerEvents: 'none', zIndex: 0 }}
      >
        {connections.map(connection => {
          const sourcePoint = getConnectionPoints(connection.sourceNodeId, true);
          const targetPoint = getConnectionPoints(connection.targetNodeId, false);
          
          return (
            <ConnectionLine
              key={connection.id}
              connection={connection}
              sourceX={sourcePoint.x}
              sourceY={sourcePoint.y}
              targetX={targetPoint.x}
              targetY={targetPoint.y}
              isSelected={connection.id === selectedConnectionId}
              onClick={() => onConnectionSelect(connection.id)}
            />
          );
        })}
        
        {/* Render connection in progress */}
        {connectionInProgress && (
          <line
            ref={tempLineRef}
            x1={getConnectionPoints(connectionInProgress.sourceNodeId, connectionInProgress.sourceIsOutput).x}
            y1={getConnectionPoints(connectionInProgress.sourceNodeId, connectionInProgress.sourceIsOutput).y}
            x2={connectionInProgress.x}
            y2={connectionInProgress.y}
            stroke="var(--primary-color)"
            strokeWidth="2"
            strokeDasharray="5,5"
          />
        )}
      </svg>
      
      {/* Render all nodes */}
      {nodes.map(node => (
        <WorkflowNodeComponent
          key={node.id}
          node={node}
          isSelected={node.id === selectedNodeId}
          isGridLayout={isGridLayout}
          onSelect={() => onNodeSelect(node.id)}
          onMove={(position) => onNodeMove(node.id, position)}
          onStartConnection={(isOutput, x, y) => onStartConnection(node.id, isOutput, x, y)}
          onCompleteConnection={(isInput) => onCompleteConnection(node.id, isInput)}
        />
      ))}
    </div>
  );
};

export default WorkflowCanvas;

