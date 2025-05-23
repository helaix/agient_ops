import React from 'react';
import { FiTrash2, FiSettings, FiX } from 'react-icons/fi';
import { WorkflowNode, Connection, ConnectionType, Agent } from '../../../types/workflow';

interface PropertiesPanelProps {
  selectedNode: WorkflowNode | null;
  selectedConnection: Connection | null;
  agents: Agent[];
  onUpdateNodeProperties: (nodeId: string, updates: Partial<WorkflowNode>) => void;
  onUpdateConnectionProperties: (connectionId: string, updates: Partial<Connection>) => void;
  onDeleteNode: (nodeId: string) => void;
  onDeleteConnection: (connectionId: string) => void;
}

const PropertiesPanel: React.FC<PropertiesPanelProps> = ({
  selectedNode,
  selectedConnection,
  agents,
  onUpdateNodeProperties,
  onUpdateConnectionProperties,
  onDeleteNode,
  onDeleteConnection
}) => {
  // Handle node title change
  const handleNodeTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedNode) return;
    onUpdateNodeProperties(selectedNode.id, { title: e.target.value });
  };

  // Handle connection label change
  const handleConnectionLabelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!selectedConnection) return;
    onUpdateConnectionProperties(selectedConnection.id, { label: e.target.value });
  };

  // Handle connection type change
  const handleConnectionTypeChange = (type: ConnectionType) => {
    if (!selectedConnection) return;
    onUpdateConnectionProperties(selectedConnection.id, { type });
  };

  // Render node properties
  const renderNodeProperties = () => {
    if (!selectedNode) return null;
    
    const agent = agents.find(a => a.id === selectedNode.agentId);
    
    return (
      <>
        <div className="properties-panel-header">
          <h3>Node Properties</h3>
          <div className="header-actions">
            <button 
              className="btn-icon" 
              onClick={() => onDeleteNode(selectedNode.id)}
              title="Delete Node"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
        
        <div className="properties-panel-content">
          <div className="property-group">
            <div className="property-group-title">Basic Information</div>
            
            <div className="property-row">
              <label className="property-label">Title</label>
              <input
                type="text"
                className="property-input"
                value={selectedNode.title}
                onChange={handleNodeTitleChange}
              />
            </div>
            
            <div className="property-row">
              <label className="property-label">Agent Type</label>
              <div className="property-value">{agent?.type || 'Unknown'}</div>
            </div>
          </div>
          
          <div className="property-group">
            <div className="property-group-title">Capabilities</div>
            
            <div className="property-row">
              <label className="property-label">Inputs</label>
              <div className="capability-list">
                {selectedNode.inputs.map((input, index) => (
                  <div key={`input-${index}`} className="capability-item badge-primary">
                    {input}
                  </div>
                ))}
                {selectedNode.inputs.length === 0 && (
                  <div className="empty-message">No inputs defined</div>
                )}
              </div>
            </div>
            
            <div className="property-row">
              <label className="property-label">Outputs</label>
              <div className="capability-list">
                {selectedNode.outputs.map((output, index) => (
                  <div key={`output-${index}`} className="capability-item badge-secondary">
                    {output}
                  </div>
                ))}
                {selectedNode.outputs.length === 0 && (
                  <div className="empty-message">No outputs defined</div>
                )}
              </div>
            </div>
          </div>
          
          <div className="property-group">
            <div className="property-group-title">Configuration</div>
            
            {/* Render dynamic configuration options based on agent type */}
            {agent?.configOptions?.map((option, index) => (
              <div key={`config-${index}`} className="property-row">
                <label className="property-label">{option.label}</label>
                {option.type === 'text' && (
                  <input
                    type="text"
                    className="property-input"
                    value={selectedNode.config[option.key] || ''}
                    onChange={(e) => {
                      const newConfig = { ...selectedNode.config, [option.key]: e.target.value };
                      onUpdateNodeProperties(selectedNode.id, { config: newConfig });
                    }}
                  />
                )}
                {option.type === 'select' && (
                  <select
                    className="property-select"
                    value={selectedNode.config[option.key] || ''}
                    onChange={(e) => {
                      const newConfig = { ...selectedNode.config, [option.key]: e.target.value };
                      onUpdateNodeProperties(selectedNode.id, { config: newConfig });
                    }}
                  >
                    {option.options?.map((opt, i) => (
                      <option key={`opt-${i}`} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            ))}
            
            {(!agent?.configOptions || agent.configOptions.length === 0) && (
              <div className="empty-message">No configuration options available</div>
            )}
          </div>
          
          {selectedNode.validationStatus !== 'success' && (
            <div className={`validation-message ${selectedNode.validationStatus}`}>
              {selectedNode.validationStatus === 'error' ? <FiX /> : <FiSettings />}
              {selectedNode.validationMessage}
            </div>
          )}
        </div>
      </>
    );
  };

  // Render connection properties
  const renderConnectionProperties = () => {
    if (!selectedConnection) return null;
    
    return (
      <>
        <div className="properties-panel-header">
          <h3>Connection Properties</h3>
          <div className="header-actions">
            <button 
              className="btn-icon" 
              onClick={() => onDeleteConnection(selectedConnection.id)}
              title="Delete Connection"
            >
              <FiTrash2 />
            </button>
          </div>
        </div>
        
        <div className="properties-panel-content">
          <div className="property-group">
            <div className="property-group-title">Basic Information</div>
            
            <div className="property-row">
              <label className="property-label">Label</label>
              <input
                type="text"
                className="property-input"
                value={selectedConnection.label || ''}
                onChange={handleConnectionLabelChange}
                placeholder="Connection label"
              />
            </div>
          </div>
          
          <div className="property-group">
            <div className="property-group-title">Connection Type</div>
            
            <div className="connection-type-selector">
              <div 
                className={`connection-type ${selectedConnection.type === ConnectionType.DataFlow ? 'active' : ''}`}
                onClick={() => handleConnectionTypeChange(ConnectionType.DataFlow)}
              >
                Data Flow
              </div>
              <div 
                className={`connection-type ${selectedConnection.type === ConnectionType.ControlFlow ? 'active' : ''}`}
                onClick={() => handleConnectionTypeChange(ConnectionType.ControlFlow)}
              >
                Control Flow
              </div>
              <div 
                className={`connection-type ${selectedConnection.type === ConnectionType.ContextSharing ? 'active' : ''}`}
                onClick={() => handleConnectionTypeChange(ConnectionType.ContextSharing)}
              >
                Context Sharing
              </div>
            </div>
          </div>
          
          <div className="property-group">
            <div className="property-group-title">Connection Details</div>
            
            <div className="property-row">
              <label className="property-label">Source Node</label>
              <div className="property-value">
                {agents.find(a => a.id === nodes.find(n => n.id === selectedConnection.sourceNodeId)?.agentId)?.name || 'Unknown'}
              </div>
            </div>
            
            <div className="property-row">
              <label className="property-label">Target Node</label>
              <div className="property-value">
                {agents.find(a => a.id === nodes.find(n => n.id === selectedConnection.targetNodeId)?.agentId)?.name || 'Unknown'}
              </div>
            </div>
          </div>
          
          {selectedConnection.validationStatus !== 'success' && (
            <div className={`validation-message ${selectedConnection.validationStatus}`}>
              {selectedConnection.validationStatus === 'error' ? <FiX /> : <FiSettings />}
              {selectedConnection.validationMessage}
            </div>
          )}
        </div>
      </>
    );
  };

  // Render empty state
  const renderEmptyState = () => {
    return (
      <>
        <div className="properties-panel-header">
          <h3>Properties</h3>
        </div>
        
        <div className="properties-panel-content">
          <div className="empty-state">
            <div className="empty-state-icon">
              <FiSettings size={48} opacity={0.3} />
            </div>
            <div className="empty-state-message">
              Select a node or connection to view and edit its properties.
            </div>
          </div>
        </div>
      </>
    );
  };

  return (
    <div className="properties-panel">
      {selectedNode ? renderNodeProperties() : 
       selectedConnection ? renderConnectionProperties() : 
       renderEmptyState()}
    </div>
  );
};

export default PropertiesPanel;

