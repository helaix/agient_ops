import React, { useRef } from 'react';
import { useDrag } from 'react-dnd';
import { FiX, FiAlertCircle, FiAlertTriangle, FiCheckCircle } from 'react-icons/fi';
import { WorkflowNode } from '../../../types/workflow';

interface WorkflowNodeComponentProps {
  node: WorkflowNode;
  isSelected: boolean;
  isGridLayout: boolean;
  onSelect: () => void;
  onMove: (position: { x: number, y: number }) => void;
  onStartConnection: (isOutput: boolean, x: number, y: number) => void;
  onCompleteConnection: (isInput: boolean) => void;
}

const WorkflowNodeComponent: React.FC<WorkflowNodeComponentProps> = ({
  node,
  isSelected,
  isGridLayout,
  onSelect,
  onMove,
  onStartConnection,
  onCompleteConnection
}) => {
  const nodeRef = useRef<HTMLDivElement>(null);

  // Set up drag functionality for the node
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'NODE',
    item: { id: node.id },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
    end: (item, monitor) => {
      const delta = monitor.getDifferenceFromInitialOffset();
      if (delta && nodeRef.current) {
        const { x, y } = node.position;
        let newX = x + delta.x;
        let newY = y + delta.y;
        
        // If grid layout is enabled, snap to grid
        if (isGridLayout) {
          const gridSize = 20;
          newX = Math.round(newX / gridSize) * gridSize;
          newY = Math.round(newY / gridSize) * gridSize;
        }
        
        onMove({ x: newX, y: newY });
      }
    },
  }));

  // Handle connection point mouse down
  const handleConnectionPointMouseDown = (
    e: React.MouseEvent, 
    isOutput: boolean
  ) => {
    e.stopPropagation();
    const { clientX, clientY } = e;
    onStartConnection(isOutput, clientX, clientY);
  };

  // Handle connection point mouse up
  const handleConnectionPointMouseUp = (
    e: React.MouseEvent, 
    isInput: boolean
  ) => {
    e.stopPropagation();
    onCompleteConnection(isInput);
  };

  // Handle node click
  const handleNodeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelect();
  };

  // Render validation indicator based on status
  const renderValidationIndicator = () => {
    switch (node.validationStatus) {
      case 'error':
        return (
          <div className="validation-indicator error" title={node.validationMessage}>
            <FiAlertCircle />
          </div>
        );
      case 'warning':
        return (
          <div className="validation-indicator warning" title={node.validationMessage}>
            <FiAlertTriangle />
          </div>
        );
      case 'success':
        return (
          <div className="validation-indicator success" title="Valid configuration">
            <FiCheckCircle />
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div
      id={`node-${node.id}`}
      ref={(el) => {
        nodeRef.current = el as HTMLDivElement;
        drag(el);
      }}
      className={`workflow-node ${isSelected ? 'selected' : ''}`}
      style={{
        left: `${node.position.x}px`,
        top: `${node.position.y}px`,
        opacity: isDragging ? 0.5 : 1,
      }}
      onClick={handleNodeClick}
    >
      {renderValidationIndicator()}
      
      <div className="workflow-node-header">
        <div className="workflow-node-title">{node.title}</div>
        <div className="workflow-node-actions">
          <div className="workflow-node-action">
            <FiX />
          </div>
        </div>
      </div>
      
      <div className="workflow-node-content">
        {/* Node content goes here */}
        <div className="node-type">{node.agentId}</div>
      </div>
      
      {/* Input connection points */}
      {node.inputs.map((input, index) => (
        <div
          key={`input-${index}`}
          className="connection-point input"
          style={{ top: `${50 + (index * 20)}px` }}
          title={`Input: ${input}`}
          onMouseUp={(e) => handleConnectionPointMouseUp(e, true)}
        />
      ))}
      
      {/* Output connection points */}
      {node.outputs.map((output, index) => (
        <div
          key={`output-${index}`}
          className="connection-point output"
          style={{ top: `${50 + (index * 20)}px` }}
          title={`Output: ${output}`}
          onMouseDown={(e) => handleConnectionPointMouseDown(e, true)}
        />
      ))}
    </div>
  );
};

export default WorkflowNodeComponent;

