import React, { useState, useCallback } from 'react';
import { useDrag } from 'react-dnd';
import { FiSearch, FiFilter, FiCpu, FiDatabase, FiGlobe, FiMessageSquare, FiFileText } from 'react-icons/fi';
import { Agent } from '../../../types/workflow';

interface AgentPaletteProps {
  agents: Agent[];
  onAgentDrag: (agent: Agent, position: { x: number, y: number }) => void;
}

interface AgentCardProps {
  agent: Agent;
  onAgentDrag: (agent: Agent, position: { x: number, y: number }) => void;
}

// Agent category options
const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'processing', label: 'Processing', icon: <FiCpu /> },
  { id: 'data', label: 'Data', icon: <FiDatabase /> },
  { id: 'web', label: 'Web', icon: <FiGlobe /> },
  { id: 'communication', label: 'Communication', icon: <FiMessageSquare /> },
  { id: 'document', label: 'Document', icon: <FiFileText /> },
];

// Agent Card component with drag functionality
const AgentCard: React.FC<AgentCardProps> = ({ agent, onAgentDrag }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: 'AGENT',
    item: { agent },
    end: (item, monitor) => {
      const dropResult = monitor.getDropResult<{ x: number, y: number }>();
      if (item && dropResult) {
        onAgentDrag(agent, dropResult);
      }
    },
    collect: (monitor) => ({
      isDragging: !!monitor.isDragging(),
    }),
  }));

  // Get the appropriate icon based on agent type
  const getAgentIcon = () => {
    switch (agent.type) {
      case 'processing':
        return <FiCpu />;
      case 'data':
        return <FiDatabase />;
      case 'web':
        return <FiGlobe />;
      case 'communication':
        return <FiMessageSquare />;
      case 'document':
        return <FiFileText />;
      default:
        return <FiCpu />;
    }
  };

  return (
    <div 
      ref={drag} 
      className="agent-card" 
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <div className="agent-card-header">
        <span className="agent-card-title">{agent.name}</span>
        {getAgentIcon()}
      </div>
      <div className="agent-card-description">
        {agent.description}
      </div>
      <div className="agent-card-capabilities">
        {agent.capabilities.inputs.map((input, index) => (
          <span key={`input-${index}`} className="agent-capability badge-primary">
            In: {input}
          </span>
        ))}
        {agent.capabilities.outputs.map((output, index) => (
          <span key={`output-${index}`} className="agent-capability badge-secondary">
            Out: {output}
          </span>
        ))}
      </div>
    </div>
  );
};

// Main AgentPalette component
const AgentPalette: React.FC<AgentPaletteProps> = ({ agents, onAgentDrag }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Filter agents based on search query and selected category
  const filteredAgents = agents.filter(agent => {
    const matchesSearch = agent.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                         agent.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || agent.type === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // Handle search input change
  const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  }, []);

  // Handle category selection
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategory(categoryId);
  }, []);

  return (
    <div className="agent-palette">
      <div className="agent-palette-header">
        <h2>Agent Palette</h2>
        <button className="btn-icon">
          <FiFilter />
        </button>
      </div>
      
      <div className="agent-palette-search">
        <div className="search-input-wrapper">
          <FiSearch />
          <input 
            type="text" 
            placeholder="Search agents..." 
            value={searchQuery}
            onChange={handleSearchChange}
          />
        </div>
      </div>
      
      <div className="agent-categories">
        {CATEGORIES.map(category => (
          <div 
            key={category.id}
            className={`agent-category ${selectedCategory === category.id ? 'active' : ''}`}
            onClick={() => handleCategorySelect(category.id)}
          >
            {category.icon && <span className="category-icon">{category.icon}</span>}
            {category.label}
          </div>
        ))}
      </div>
      
      <div className="agent-list">
        {filteredAgents.length > 0 ? (
          filteredAgents.map(agent => (
            <AgentCard 
              key={agent.id} 
              agent={agent} 
              onAgentDrag={onAgentDrag} 
            />
          ))
        ) : (
          <div className="no-agents-message">
            No agents found matching your criteria.
          </div>
        )}
      </div>
    </div>
  );
};

export default AgentPalette;

