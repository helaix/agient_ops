import React, { useState } from 'react';
import { FiMonitor, FiTablet, FiSmartphone, FiGrid } from 'react-icons/fi';
import WorkflowDesigner from './desktop/workflow-designer/WorkflowDesigner';
import '../styles/UnifiedShowcase.css';

// Placeholder components for other views
const DesktopCommandCenter = () => <div className="placeholder-view">Desktop Command Center View</div>;
const DesktopAgentDetail = () => <div className="placeholder-view">Desktop Agent Detail View</div>;
const TabletAdaptiveCommandCenter = () => <div className="placeholder-view">Tablet Adaptive Command Center</div>;
const TabletNavigationPatterns = () => <div className="placeholder-view">Tablet Navigation Patterns</div>;
const MobileFocusedInterface = () => <div className="placeholder-view">Mobile Focused Interface</div>;
const MobileHierarchicalNavigation = () => <div className="placeholder-view">Mobile Hierarchical Navigation</div>;

// View type enum
enum ViewType {
  Desktop = 'desktop',
  Tablet = 'tablet',
  Mobile = 'mobile',
  All = 'all'
}

// Desktop view enum
enum DesktopView {
  CommandCenter = 'commandCenter',
  AgentDetail = 'agentDetail',
  WorkflowDesigner = 'workflowDesigner'
}

// Tablet view enum
enum TabletView {
  AdaptiveCommandCenter = 'adaptiveCommandCenter',
  NavigationPatterns = 'navigationPatterns'
}

// Mobile view enum
enum MobileView {
  FocusedInterface = 'focusedInterface',
  HierarchicalNavigation = 'hierarchicalNavigation'
}

const UnifiedShowcase: React.FC = () => {
  // State for selected view types
  const [viewType, setViewType] = useState<ViewType>(ViewType.Desktop);
  const [desktopView, setDesktopView] = useState<DesktopView>(DesktopView.WorkflowDesigner);
  const [tabletView, setTabletView] = useState<TabletView>(TabletView.AdaptiveCommandCenter);
  const [mobileView, setMobileView] = useState<MobileView>(MobileView.FocusedInterface);

  // Render the appropriate view based on selections
  const renderView = () => {
    if (viewType === ViewType.All) {
      return (
        <div className="all-views-grid">
          <div className="view-section desktop-section">
            <h3>Desktop Views</h3>
            <div className="view-container desktop-view">
              <div className="view-header">
                <h4>Desktop Command Center</h4>
              </div>
              <DesktopCommandCenter />
            </div>
            <div className="view-container desktop-view">
              <div className="view-header">
                <h4>Desktop Agent Detail</h4>
              </div>
              <DesktopAgentDetail />
            </div>
            <div className="view-container desktop-view">
              <div className="view-header">
                <h4>Desktop Workflow Designer</h4>
              </div>
              <WorkflowDesigner />
            </div>
          </div>
          
          <div className="view-section tablet-section">
            <h3>Tablet Views</h3>
            <div className="view-container tablet-view">
              <div className="view-header">
                <h4>Tablet Adaptive Command Center</h4>
              </div>
              <TabletAdaptiveCommandCenter />
            </div>
            <div className="view-container tablet-view">
              <div className="view-header">
                <h4>Tablet Navigation Patterns</h4>
              </div>
              <TabletNavigationPatterns />
            </div>
          </div>
          
          <div className="view-section mobile-section">
            <h3>Mobile Views</h3>
            <div className="view-container mobile-view">
              <div className="view-header">
                <h4>Mobile Focused Interface</h4>
              </div>
              <MobileFocusedInterface />
            </div>
            <div className="view-container mobile-view">
              <div className="view-header">
                <h4>Mobile Hierarchical Navigation</h4>
              </div>
              <MobileHierarchicalNavigation />
            </div>
          </div>
        </div>
      );
    }
    
    if (viewType === ViewType.Desktop) {
      switch (desktopView) {
        case DesktopView.CommandCenter:
          return <DesktopCommandCenter />;
        case DesktopView.AgentDetail:
          return <DesktopAgentDetail />;
        case DesktopView.WorkflowDesigner:
          return <WorkflowDesigner />;
        default:
          return <WorkflowDesigner />;
      }
    }
    
    if (viewType === ViewType.Tablet) {
      switch (tabletView) {
        case TabletView.AdaptiveCommandCenter:
          return <TabletAdaptiveCommandCenter />;
        case TabletView.NavigationPatterns:
          return <TabletNavigationPatterns />;
        default:
          return <TabletAdaptiveCommandCenter />;
      }
    }
    
    if (viewType === ViewType.Mobile) {
      switch (mobileView) {
        case MobileView.FocusedInterface:
          return <MobileFocusedInterface />;
        case MobileView.HierarchicalNavigation:
          return <MobileHierarchicalNavigation />;
        default:
          return <MobileFocusedInterface />;
      }
    }
    
    return <WorkflowDesigner />;
  };

  return (
    <div className="unified-showcase">
      <div className="showcase-header">
        <h1>Multi-Agent Management UI/UX Showcase</h1>
        
        <div className="view-type-selector">
          <button 
            className={`view-type-btn ${viewType === ViewType.Desktop ? 'active' : ''}`}
            onClick={() => setViewType(ViewType.Desktop)}
          >
            <FiMonitor /> Desktop
          </button>
          <button 
            className={`view-type-btn ${viewType === ViewType.Tablet ? 'active' : ''}`}
            onClick={() => setViewType(ViewType.Tablet)}
          >
            <FiTablet /> Tablet
          </button>
          <button 
            className={`view-type-btn ${viewType === ViewType.Mobile ? 'active' : ''}`}
            onClick={() => setViewType(ViewType.Mobile)}
          >
            <FiSmartphone /> Mobile
          </button>
          <button 
            className={`view-type-btn ${viewType === ViewType.All ? 'active' : ''}`}
            onClick={() => setViewType(ViewType.All)}
          >
            <FiGrid /> All Views
          </button>
        </div>
        
        {viewType === ViewType.Desktop && (
          <div className="view-selector">
            <button 
              className={`view-btn ${desktopView === DesktopView.CommandCenter ? 'active' : ''}`}
              onClick={() => setDesktopView(DesktopView.CommandCenter)}
            >
              Command Center
            </button>
            <button 
              className={`view-btn ${desktopView === DesktopView.AgentDetail ? 'active' : ''}`}
              onClick={() => setDesktopView(DesktopView.AgentDetail)}
            >
              Agent Detail
            </button>
            <button 
              className={`view-btn ${desktopView === DesktopView.WorkflowDesigner ? 'active' : ''}`}
              onClick={() => setDesktopView(DesktopView.WorkflowDesigner)}
            >
              Workflow Designer
            </button>
          </div>
        )}
        
        {viewType === ViewType.Tablet && (
          <div className="view-selector">
            <button 
              className={`view-btn ${tabletView === TabletView.AdaptiveCommandCenter ? 'active' : ''}`}
              onClick={() => setTabletView(TabletView.AdaptiveCommandCenter)}
            >
              Adaptive Command Center
            </button>
            <button 
              className={`view-btn ${tabletView === TabletView.NavigationPatterns ? 'active' : ''}`}
              onClick={() => setTabletView(TabletView.NavigationPatterns)}
            >
              Navigation Patterns
            </button>
          </div>
        )}
        
        {viewType === ViewType.Mobile && (
          <div className="view-selector">
            <button 
              className={`view-btn ${mobileView === MobileView.FocusedInterface ? 'active' : ''}`}
              onClick={() => setMobileView(MobileView.FocusedInterface)}
            >
              Focused Interface
            </button>
            <button 
              className={`view-btn ${mobileView === MobileView.HierarchicalNavigation ? 'active' : ''}`}
              onClick={() => setMobileView(MobileView.HierarchicalNavigation)}
            >
              Hierarchical Navigation
            </button>
          </div>
        )}
      </div>
      
      <div className="showcase-content">
        {renderView()}
      </div>
    </div>
  );
};

export default UnifiedShowcase;

