import React from 'react';
import { Connection, ConnectionType } from '../../../types/workflow';

interface ConnectionLineProps {
  connection: Connection;
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  isSelected: boolean;
  onClick: () => void;
}

const ConnectionLine: React.FC<ConnectionLineProps> = ({
  connection,
  sourceX,
  sourceY,
  targetX,
  targetY,
  isSelected,
  onClick
}) => {
  // Calculate control points for the bezier curve
  const dx = Math.abs(targetX - sourceX);
  const controlPointOffset = Math.min(100, dx * 0.5);
  
  const path = `
    M ${sourceX} ${sourceY}
    C ${sourceX + controlPointOffset} ${sourceY},
      ${targetX - controlPointOffset} ${targetY},
      ${targetX} ${targetY}
  `;

  // Determine stroke style based on connection type
  const getStrokeStyle = () => {
    switch (connection.type) {
      case ConnectionType.DataFlow:
        return {
          stroke: 'var(--primary-color)',
          strokeWidth: isSelected ? 3 : 2,
          strokeDasharray: ''
        };
      case ConnectionType.ControlFlow:
        return {
          stroke: 'var(--secondary-color)',
          strokeWidth: isSelected ? 3 : 2,
          strokeDasharray: ''
        };
      case ConnectionType.ContextSharing:
        return {
          stroke: 'var(--success-color)',
          strokeWidth: isSelected ? 3 : 2,
          strokeDasharray: '5,5'
        };
      default:
        return {
          stroke: 'var(--text-primary)',
          strokeWidth: isSelected ? 3 : 2,
          strokeDasharray: ''
        };
    }
  };

  // Determine marker based on connection type
  const getMarkerEnd = () => {
    switch (connection.type) {
      case ConnectionType.DataFlow:
        return 'url(#arrowDataFlow)';
      case ConnectionType.ControlFlow:
        return 'url(#arrowControlFlow)';
      case ConnectionType.ContextSharing:
        return 'url(#arrowContextSharing)';
      default:
        return 'url(#arrowDefault)';
    }
  };

  // Render validation indicator based on status
  const renderValidationIndicator = () => {
    if (connection.validationStatus === 'success') return null;
    
    const midX = (sourceX + targetX) / 2;
    const midY = (sourceY + targetY) / 2;
    
    return (
      <circle
        cx={midX}
        cy={midY}
        r={6}
        fill={connection.validationStatus === 'error' ? 'var(--danger-color)' : 'var(--warning-color)'}
        stroke="white"
        strokeWidth={1}
      />
    );
  };

  // Calculate position for the label
  const labelX = (sourceX + targetX) / 2;
  const labelY = (sourceY + targetY) / 2 - 10;

  const strokeStyle = getStrokeStyle();

  return (
    <>
      {/* Define markers for different connection types */}
      <defs>
        <marker
          id="arrowDataFlow"
          markerWidth={10}
          markerHeight={7}
          refX={10}
          refY={3.5}
          orient="auto"
        >
          <polygon 
            points="0 0, 10 3.5, 0 7" 
            fill="var(--primary-color)" 
          />
        </marker>
        <marker
          id="arrowControlFlow"
          markerWidth={10}
          markerHeight={7}
          refX={10}
          refY={3.5}
          orient="auto"
        >
          <polygon 
            points="0 0, 10 3.5, 0 7" 
            fill="var(--secondary-color)" 
          />
        </marker>
        <marker
          id="arrowContextSharing"
          markerWidth={10}
          markerHeight={7}
          refX={10}
          refY={3.5}
          orient="auto"
        >
          <polygon 
            points="0 0, 10 3.5, 0 7" 
            fill="var(--success-color)" 
          />
        </marker>
        <marker
          id="arrowDefault"
          markerWidth={10}
          markerHeight={7}
          refX={10}
          refY={3.5}
          orient="auto"
        >
          <polygon 
            points="0 0, 10 3.5, 0 7" 
            fill="var(--text-primary)" 
          />
        </marker>
      </defs>
      
      {/* Invisible wider path for easier selection */}
      <path
        d={path}
        stroke="transparent"
        strokeWidth={10}
        fill="none"
        onClick={onClick}
        style={{ cursor: 'pointer' }}
      />
      
      {/* Actual visible connection line */}
      <path
        d={path}
        stroke={strokeStyle.stroke}
        strokeWidth={strokeStyle.strokeWidth}
        strokeDasharray={strokeStyle.strokeDasharray}
        fill="none"
        markerEnd={getMarkerEnd()}
      />
      
      {/* Connection label */}
      {connection.label && (
        <g onClick={onClick} style={{ cursor: 'pointer' }}>
          <rect
            x={labelX - 40}
            y={labelY - 10}
            width={80}
            height={20}
            rx={4}
            fill="white"
            stroke={strokeStyle.stroke}
            strokeWidth={1}
          />
          <text
            x={labelX}
            y={labelY + 5}
            textAnchor="middle"
            fontSize={12}
            fill="var(--text-primary)"
          >
            {connection.label}
          </text>
        </g>
      )}
      
      {/* Validation indicator */}
      {renderValidationIndicator()}
    </>
  );
};

export default ConnectionLine;

