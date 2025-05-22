import React, { useState, useCallback, useRef, useEffect } from 'react';
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch';
import { FiZoomIn, FiZoomOut, FiMaximize, FiGrid, FiMove, FiInfo, FiHelpCircle } from 'react-icons/fi';
import AgentPalette from './AgentPalette';
import PropertiesPanel from './PropertiesPanel';
import WorkflowCanvas from './WorkflowCanvas';
import TestingPanel from './TestingPanel';
import KeyboardShortcutsHelp from './KeyboardShortcutsHelp';
import { Agent, WorkflowNode, Connection, ConnectionType } from '../../../types/workflow';
import { sampleAgents } from '../../../data/sampleData';
import '../../../styles/WorkflowDesigner.css';

const WorkflowDesigner: React.FC = () => {
  // State for the workflow
  const [agents, setAgents] = useState<Agent[]>(sampleAgents);
  const [nodes, setNodes] = useState<WorkflowNode[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedConnectionId, setSelectedConnectionId] = useState<string | null>(null);
  const [isGridLayout, setIsGridLayout] = useState<boolean>(true);
  const [isTestingPanelOpen, setIsTestingPanelOpen] = useState<boolean>(false);
  const [isShortcutsHelpOpen, setIsShortcutsHelpOpen] = useState<boolean>(false);
  
  // Refs
  const canvasRef = useRef<HTMLDivElement>(null);
  const connectionInProgress = useRef<{
    sourceNodeId: string;
    sourceIsOutput: boolean;
    x: number;
    y: number;
  } | null>(null);

  // Get the selected node
  const selectedNode = selectedNodeId 
    ? nodes.find(node => node.id === selectedNodeId) 
    : null;

  // Get the selected connection
  const selectedConnection = selectedConnectionId 
    ? connections.find(conn => conn.id === selectedConnectionId) 
    : null;

  // Handler for adding a new node to the canvas
  const handleAddNode = useCallback((agent: Agent, position: { x: number, y: number }) => {
    const newNode: WorkflowNode = {
      id: `node-${Date.now()}`,
      agentId: agent.id,
      title: agent.name,
      position,
      inputs: agent.capabilities.inputs,
      outputs: agent.capabilities.outputs,
      config: {},
      validationStatus: 'success',
      validationMessage: ''
    };
    
    setNodes(prevNodes => [...prevNodes, newNode]);
    setSelectedNodeId(newNode.id);
  }, []);

  // Handler for updating a node's position
  const handleNodeMove = useCallback((nodeId: string, position: { x: number, y: number }) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId ? { ...node, position } : node
      )
    );
  }, []);

  // Handler for selecting a node
  const handleNodeSelect = useCallback((nodeId: string | null) => {
    setSelectedNodeId(nodeId);
    if (nodeId) {
      setSelectedConnectionId(null);
    }
  }, []);

  // Handler for selecting a connection
  const handleConnectionSelect = useCallback((connectionId: string | null) => {
    setSelectedConnectionId(connectionId);
    if (connectionId) {
      setSelectedNodeId(null);
    }
  }, []);

  // Handler for starting a connection
  const handleStartConnection = useCallback((nodeId: string, isOutput: boolean, x: number, y: number) => {
    connectionInProgress.current = {
      sourceNodeId: nodeId,
      sourceIsOutput: isOutput,
      x,
      y
    };
  }, []);

  // Handler for updating a connection in progress
  const handleUpdateConnection = useCallback((x: number, y: number) => {
    if (connectionInProgress.current) {
      connectionInProgress.current.x = x;
      connectionInProgress.current.y = y;
    }
  }, []);

  // Handler for completing a connection
  const handleCompleteConnection = useCallback((targetNodeId: string, isInput: boolean) => {
    if (!connectionInProgress.current) return;
    
    const { sourceNodeId, sourceIsOutput } = connectionInProgress.current;
    
    // Ensure we're connecting an output to an input
    if (sourceIsOutput === isInput) return;
    
    // Determine source and target based on connection direction
    const [source, target] = sourceIsOutput 
      ? [sourceNodeId, targetNodeId] 
      : [targetNodeId, sourceNodeId];
    
    const sourceNode = nodes.find(node => node.id === source);
    const targetNode = nodes.find(node => node.id === target);
    
    if (!sourceNode || !targetNode) return;
    
    // Create the new connection
    const newConnection: Connection = {
      id: `conn-${Date.now()}`,
      sourceNodeId: source,
      targetNodeId: target,
      type: ConnectionType.DataFlow,
      label: '',
      validationStatus: 'success',
      validationMessage: ''
    };
    
    setConnections(prevConnections => [...prevConnections, newConnection]);
    connectionInProgress.current = null;
  }, [nodes]);

  // Handler for canceling a connection
  const handleCancelConnection = useCallback(() => {
    connectionInProgress.current = null;
  }, []);

  // Handler for deleting a node
  const handleDeleteNode = useCallback((nodeId: string) => {
    // Delete the node
    setNodes(prevNodes => prevNodes.filter(node => node.id !== nodeId));
    
    // Delete any connections to/from this node
    setConnections(prevConnections => 
      prevConnections.filter(conn => 
        conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
      )
    );
    
    // Clear selection if this node was selected
    if (selectedNodeId === nodeId) {
      setSelectedNodeId(null);
    }
  }, [selectedNodeId]);

  // Handler for deleting a connection
  const handleDeleteConnection = useCallback((connectionId: string) => {
    setConnections(prevConnections => 
      prevConnections.filter(conn => conn.id !== connectionId)
    );
    
    // Clear selection if this connection was selected
    if (selectedConnectionId === connectionId) {
      setSelectedConnectionId(null);
    }
  }, [selectedConnectionId]);

  // Handler for updating a node's properties
  const handleUpdateNodeProperties = useCallback((nodeId: string, updates: Partial<WorkflowNode>) => {
    setNodes(prevNodes => 
      prevNodes.map(node => 
        node.id === nodeId ? { ...node, ...updates } : node
      )
    );
  }, []);

  // Handler for updating a connection's properties
  const handleUpdateConnectionProperties = useCallback((connectionId: string, updates: Partial<Connection>) => {
    setConnections(prevConnections => 
      prevConnections.map(conn => 
        conn.id === connectionId ? { ...conn, ...updates } : conn
      )
    );
  }, []);

  // Handler for toggling the grid layout
  const handleToggleGridLayout = useCallback(() => {
    setIsGridLayout(prev => !prev);
  }, []);

  // Handler for toggling the testing panel
  const handleToggleTestingPanel = useCallback(() => {
    setIsTestingPanelOpen(prev => !prev);
  }, []);

  // Handler for toggling the keyboard shortcuts help
  const handleToggleShortcutsHelp = useCallback(() => {
    setIsShortcutsHelpOpen(prev => !prev);
  }, []);

  // Handler for running a test simulation
  const handleRunTest = useCallback(() => {
    // Implement test simulation logic here
    console.log('Running test simulation with nodes:', nodes);
    console.log('And connections:', connections);
  }, [nodes, connections]);

  // Handler for keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger shortcuts if user is typing in an input field
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      // Delete selected node or connection with Delete key
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedNodeId) {
          handleDeleteNode(selectedNodeId);
        } else if (selectedConnectionId) {
          handleDeleteConnection(selectedConnectionId);
        }
      }

      // Toggle grid layout with 'G' key
      if (e.key === 'g' || e.key === 'G') {
        handleToggleGridLayout();
      }

      // Toggle testing panel with 'T' key
      if (e.key === 't' || e.key === 'T') {
        handleToggleTestingPanel();
      }

      // Show keyboard shortcuts help with '?' key
      if (e.key === '?') {
        handleToggleShortcutsHelp();
      }

      // Escape key to cancel connection in progress or close panels
      if (e.key === 'Escape') {
        if (connectionInProgress.current) {
          handleCancelConnection();
        } else if (isShortcutsHelpOpen) {
          setIsShortcutsHelpOpen(false);
        } else if (isTestingPanelOpen) {
          setIsTestingPanelOpen(false);
        } else {
          // Deselect any selected node or connection
          setSelectedNodeId(null);
          setSelectedConnectionId(null);
        }
      }

      // Ctrl+Z for undo (placeholder)
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        console.log('Undo operation (not implemented)');
      }

      // Ctrl+Y or Ctrl+Shift+Z for redo (placeholder)
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.shiftKey && e.key === 'z'))) {
        console.log('Redo operation (not implemented)');
      }

      // Ctrl+S for save (placeholder)
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault(); // Prevent browser save dialog
        console.log('Save workflow (not implemented)');
      }

      // Ctrl+O for open (placeholder)
      if ((e.ctrlKey || e.metaKey) && e.key === 'o') {
        e.preventDefault(); // Prevent browser open dialog
        console.log('Open workflow (not implemented)');
      }

      // Ctrl+N for new workflow (placeholder)
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault(); // Prevent browser new window
        console.log('New workflow (not implemented)');
      }

      // Alt+[Number] for quick agent selection (1-9)
      if (e.altKey && !isNaN(parseInt(e.key)) && parseInt(e.key) >= 1 && parseInt(e.key) <= 9) {
        const index = parseInt(e.key) - 1;
        if (index < agents.length) {
          // Place the agent in the center of the visible canvas
          if (canvasRef.current) {
            const rect = canvasRef.current.getBoundingClientRect();
            const position = {
              x: rect.width / 2,
              y: rect.height / 2
            };
            handleAddNode(agents[index], position);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    selectedNodeId, 
    selectedConnectionId, 
    handleDeleteNode, 
    handleDeleteConnection, 
    handleToggleGridLayout, 
    handleToggleTestingPanel,
    handleCancelConnection,
    handleAddNode,
    agents
  ]);

  return (
    <div className="workflow-designer">
      <AgentPalette 
        agents={agents} 
        onAgentDrag={handleAddNode} 
      />
      
      <div className="canvas-container" ref={canvasRef}>
        <div className="canvas-layout-toggle">
          <div 
            className={`layout-option ${isGridLayout ? 'active' : ''}`}
            onClick={() => setIsGridLayout(true)}
          >
            <FiGrid /> Grid
          </div>
          <div 
            className={`layout-option ${!isGridLayout ? 'active' : ''}`}
            onClick={() => setIsGridLayout(false)}
          >
            <FiMove /> Free
          </div>
        </div>
        
        <TransformWrapper
          initialScale={1}
          minScale={0.5}
          maxScale={2}
          limitToBounds={false}
          wheel={{ step: 0.1 }}
        >
          {({ zoomIn, zoomOut, resetTransform }) => (
            <>
              <TransformComponent wrapperStyle={{ width: '100%', height: '100%' }}>
                <WorkflowCanvas 
                  nodes={nodes}
                  connections={connections}
                  selectedNodeId={selectedNodeId}
                  selectedConnectionId={selectedConnectionId}
                  connectionInProgress={connectionInProgress.current}
                  isGridLayout={isGridLayout}
                  onNodeMove={handleNodeMove}
                  onNodeSelect={handleNodeSelect}
                  onConnectionSelect={handleConnectionSelect}
                  onStartConnection={handleStartConnection}
                  onUpdateConnection={handleUpdateConnection}
                  onCompleteConnection={handleCompleteConnection}
                  onCancelConnection={handleCancelConnection}
                />
              </TransformComponent>
              
              <div className="canvas-controls">
                <button className="canvas-control-btn" onClick={() => zoomIn()}>
                  <FiZoomIn />
                </button>
                <button className="canvas-control-btn" onClick={() => zoomOut()}>
                  <FiZoomOut />
                </button>
                <button className="canvas-control-btn" onClick={() => resetTransform()}>
                  <FiMaximize />
                </button>
                <button className="canvas-control-btn" onClick={handleToggleTestingPanel}>
                  {isTestingPanelOpen ? 'Close Testing' : 'Open Testing'}
                </button>
                <button className="canvas-control-btn" onClick={handleToggleShortcutsHelp}>
                  <FiHelpCircle />
                </button>
              </div>
            </>
          )}
        </TransformWrapper>
        
        {isTestingPanelOpen && (
          <TestingPanel 
            nodes={nodes}
            connections={connections}
            onRunTest={handleRunTest}
            onClose={() => setIsTestingPanelOpen(false)}
          />
        )}

        {isShortcutsHelpOpen && (
          <KeyboardShortcutsHelp 
            onClose={() => setIsShortcutsHelpOpen(false)}
          />
        )}
      </div>
      
      <PropertiesPanel 
        selectedNode={selectedNode}
        selectedConnection={selectedConnection}
        agents={agents}
        onUpdateNodeProperties={handleUpdateNodeProperties}
        onUpdateConnectionProperties={handleUpdateConnectionProperties}
        onDeleteNode={handleDeleteNode}
        onDeleteConnection={handleDeleteConnection}
      />
    </div>
  );
};

export default WorkflowDesigner;
