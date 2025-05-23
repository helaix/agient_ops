import React, { useState } from 'react';
import { FiPlay, FiPause, FiSkipForward, FiX, FiChevronDown, FiChevronUp } from 'react-icons/fi';
import { WorkflowNode, Connection } from '../../../types/workflow';

interface TestingPanelProps {
  nodes: WorkflowNode[];
  connections: Connection[];
  onRunTest: () => void;
  onClose: () => void;
}

const TestingPanel: React.FC<TestingPanelProps> = ({
  nodes,
  connections,
  onRunTest,
  onClose
}) => {
  const [isRunning, setIsRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [breakpoints, setBreakpoints] = useState<string[]>([]);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Handle run/pause test
  const handleRunPauseTest = () => {
    if (isRunning) {
      setIsRunning(false);
    } else {
      setIsRunning(true);
      setTestResults([
        ...testResults,
        `[${new Date().toLocaleTimeString()}] Starting workflow simulation...`
      ]);
      onRunTest();
    }
  };

  // Handle step forward
  const handleStepForward = () => {
    setCurrentStep(prev => prev + 1);
    setTestResults([
      ...testResults,
      `[${new Date().toLocaleTimeString()}] Executing step ${currentStep + 1}...`
    ]);
  };

  // Handle toggle breakpoint
  const handleToggleBreakpoint = (nodeId: string) => {
    if (breakpoints.includes(nodeId)) {
      setBreakpoints(breakpoints.filter(id => id !== nodeId));
    } else {
      setBreakpoints([...breakpoints, nodeId]);
    }
  };

  // Handle clear results
  const handleClearResults = () => {
    setTestResults([]);
    setCurrentStep(0);
  };

  return (
    <div className={`testing-panel ${isCollapsed ? 'collapsed' : 'open'}`}>
      <div className="testing-panel-header">
        <div className="testing-panel-title">
          <h3>Workflow Testing</h3>
          <button 
            className="btn-icon" 
            onClick={() => setIsCollapsed(!isCollapsed)}
            title={isCollapsed ? 'Expand' : 'Collapse'}
          >
            {isCollapsed ? <FiChevronUp /> : <FiChevronDown />}
          </button>
        </div>
        <div className="testing-panel-actions">
          <button 
            className="btn-icon" 
            onClick={onClose}
            title="Close Testing Panel"
          >
            <FiX />
          </button>
        </div>
      </div>
      
      {!isCollapsed && (
        <>
          <div className="testing-controls">
            <button 
              className={`btn ${isRunning ? 'btn-warning' : 'btn-primary'}`}
              onClick={handleRunPauseTest}
            >
              {isRunning ? <><FiPause /> Pause</> : <><FiPlay /> Run</>}
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleStepForward}
              disabled={isRunning}
            >
              <FiSkipForward /> Step
            </button>
            <button 
              className="btn btn-secondary"
              onClick={handleClearResults}
            >
              Clear Results
            </button>
            
            <div className="testing-status">
              {isRunning ? 'Running...' : 'Ready'}
              {currentStep > 0 && ` (Step ${currentStep})`}
            </div>
          </div>
          
          <div className="testing-results">
            {testResults.length > 0 ? (
              testResults.map((result, index) => (
                <div key={`result-${index}`} className="test-result-line">
                  {result}
                </div>
              ))
            ) : (
              <div className="empty-results-message">
                Run the workflow to see test results here.
              </div>
            )}
          </div>
          
          <div className="testing-options">
            <div className="testing-option">
              <label>
                <input 
                  type="checkbox" 
                  checked={true} 
                  onChange={() => {}} 
                />
                Validate connections
              </label>
            </div>
            <div className="testing-option">
              <label>
                <input 
                  type="checkbox" 
                  checked={true} 
                  onChange={() => {}} 
                />
                Show execution path
              </label>
            </div>
            <div className="testing-option">
              <label>
                <input 
                  type="checkbox" 
                  checked={false} 
                  onChange={() => {}} 
                />
                Simulate errors
              </label>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default TestingPanel;

