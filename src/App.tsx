import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';
import WorkflowDesigner from './components/desktop/workflow-designer/WorkflowDesigner';
import UnifiedShowcase from './components/UnifiedShowcase';
import './styles/App.css';

const App: React.FC = () => {
  return (
    <DndProvider backend={HTML5Backend}>
      <div className="app">
        <Routes>
          <Route path="/" element={<UnifiedShowcase />} />
          <Route path="/workflow-designer" element={<WorkflowDesigner />} />
          {/* Additional routes for other views would go here */}
        </Routes>
      </div>
    </DndProvider>
  );
};

export default App;
