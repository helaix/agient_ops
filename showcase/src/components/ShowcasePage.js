import React, { useState, useEffect } from 'react';
import { Box, Container, Typography, Grid, Paper, Tabs, Tab } from '@mui/material';
import NavigationControls from './NavigationControls';
import DeviceFrame from './DeviceFrame';
import DocumentationPanel from './DocumentationPanel';
import ComponentLoader from './ComponentLoader';
import { screens } from '../data/screens';
import componentRegistry from '../utils/ComponentRegistry';
import eventBus from '../utils/EventBus';
import sharedStore from '../utils/SharedStore';
import { createSampleData } from '../models/SharedDataModel';
import '../styles/ShowcasePage.css';

function ShowcasePage() {
  const [selectedScreens, setSelectedScreens] = useState([]);
  const [deviceType, setDeviceType] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [comparisonMode, setComparisonMode] = useState(false);
  const [fullscreenScreen, setFullscreenScreen] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [loadedComponents, setLoadedComponents] = useState({});

  // Initialize the shared store with sample data
  useEffect(() => {
    const sampleData = createSampleData();
    sharedStore.setState({
      agents: sampleData.agents,
      tasks: sampleData.tasks,
      workflows: sampleData.workflows,
      contexts: sampleData.contexts,
      selectedScreens,
      deviceType,
      viewMode,
      comparisonMode
    });

    // Register event listeners
    const unsubscribe = eventBus.subscribe('screen:select', handleScreenSelect);
    
    return () => {
      unsubscribe();
    };
  }, []);

  // Update shared store when state changes
  useEffect(() => {
    sharedStore.setState({
      selectedScreens,
      deviceType,
      viewMode,
      comparisonMode
    });
  }, [selectedScreens, deviceType, viewMode, comparisonMode]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const filteredScreens = screens.filter(screen => {
    if (activeTab === 0) return true; // All screens
    if (activeTab === 1 && screen.deviceType === 'desktop') return true;
    if (activeTab === 2 && screen.deviceType === 'tablet') return true;
    if (activeTab === 3 && screen.deviceType === 'mobile') return true;
    if (activeTab === 4 && screen.deviceType === 'cross-device') return true;
    return false;
  }).filter(screen => {
    if (deviceType === 'all') return true;
    return screen.deviceType === deviceType;
  });

  const handleScreenSelect = (screenId) => {
    if (selectedScreens.includes(screenId)) {
      setSelectedScreens(selectedScreens.filter(id => id !== screenId));
    } else {
      setSelectedScreens([...selectedScreens, screenId]);
    }
  };

  const handleDeviceTypeChange = (type) => {
    setDeviceType(type);
  };

  const handleViewModeChange = (mode) => {
    setViewMode(mode);
  };

  const toggleComparisonMode = () => {
    setComparisonMode(!comparisonMode);
  };

  const enterFullscreen = (screenId) => {
    setFullscreenScreen(screenId);
  };

  const exitFullscreen = () => {
    setFullscreenScreen(null);
  };

  const handleComponentLoad = (screenId, component) => {
    setLoadedComponents(prev => ({
      ...prev,
      [screenId]: component
    }));
  };

  return (
    <Container maxWidth="xl" className="showcase-container">
      <Typography variant="h3" component="h1" gutterBottom className="showcase-title">
        Multi-Agent Management UI/UX Showcase
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={activeTab} onChange={handleTabChange} aria-label="showcase tabs">
          <Tab label="All Screens" />
          <Tab label="Desktop" />
          <Tab label="Tablet" />
          <Tab label="Mobile" />
          <Tab label="Cross-Device" />
        </Tabs>
      </Box>

      <NavigationControls 
        deviceType={deviceType}
        viewMode={viewMode}
        comparisonMode={comparisonMode}
        onDeviceTypeChange={handleDeviceTypeChange}
        onViewModeChange={handleViewModeChange}
        onComparisonModeToggle={toggleComparisonMode}
        selectedScreens={selectedScreens}
        onScreenSelect={handleScreenSelect}
        screens={filteredScreens}
      />

      {fullscreenScreen ? (
        <Box className="fullscreen-container">
          <DeviceFrame 
            screen={screens.find(s => s.id === fullscreenScreen)}
            isFullscreen={true}
            onExitFullscreen={exitFullscreen}
          >
            {screens.find(s => s.id === fullscreenScreen).implementationStatus === 'completed' && (
              <ComponentLoader 
                componentId={fullscreenScreen}
                options={{ isFullscreen: true }}
                onLoad={(component) => handleComponentLoad(fullscreenScreen, component)}
                fallback={
                  <Box sx={{ p: 2, textAlign: 'center' }}>
                    <Typography variant="body1">
                      This screen is available but not yet loaded. Click to load.
                    </Typography>
                  </Box>
                }
              />
            )}
          </DeviceFrame>
        </Box>
      ) : (
        <Grid container spacing={3} className={`showcase-grid ${viewMode}`}>
          {filteredScreens.map((screen) => (
            <Grid item xs={12} sm={viewMode === 'list' ? 12 : 6} md={viewMode === 'list' ? 12 : 4} lg={viewMode === 'list' ? 12 : 3} key={screen.id}>
              <Paper 
                elevation={3} 
                className={`screen-card ${selectedScreens.includes(screen.id) ? 'selected' : ''}`}
                onClick={() => handleScreenSelect(screen.id)}
              >
                <DeviceFrame 
                  screen={screen}
                  onEnterFullscreen={() => enterFullscreen(screen.id)}
                >
                  {screen.implementationStatus === 'completed' && (
                    <ComponentLoader 
                      componentId={screen.id}
                      options={{ isFullscreen: false }}
                      onLoad={(component) => handleComponentLoad(screen.id, component)}
                      fallback={
                        <Box sx={{ p: 2, textAlign: 'center' }}>
                          <Typography variant="body2">
                            {screen.prLink ? (
                              <>
                                Implementation available. 
                                <a href={screen.prLink} target="_blank" rel="noopener noreferrer">
                                  View PR
                                </a>
                              </>
                            ) : (
                              'Implementation available but not yet loaded.'
                            )}
                          </Typography>
                        </Box>
                      }
                    />
                  )}
                </DeviceFrame>
                <Typography variant="h6" component="h2" className="screen-title">
                  {screen.title}
                </Typography>
                <Typography variant="body2" color="textSecondary" className="screen-description">
                  {screen.description}
                </Typography>
                {screen.implementationStatus === 'completed' && (
                  <Box className="screen-status completed">
                    <Typography variant="caption">
                      Completed
                      {screen.prLink && (
                        <a href={screen.prLink} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                          View PR
                        </a>
                      )}
                    </Typography>
                  </Box>
                )}
                {screen.implementationStatus === 'in-progress' && (
                  <Box className="screen-status in-progress">
                    <Typography variant="caption">In Progress</Typography>
                  </Box>
                )}
              </Paper>
            </Grid>
          ))}
        </Grid>
      )}

      {comparisonMode && selectedScreens.length > 0 && !fullscreenScreen && (
        <Box mt={4}>
          <Typography variant="h5" component="h2" gutterBottom>
            Comparison View
          </Typography>
          <Grid container spacing={2}>
            {selectedScreens.map(screenId => {
              const screen = screens.find(s => s.id === screenId);
              return (
                <Grid item xs={12 / Math.min(selectedScreens.length, 3)} key={`comparison-${screenId}`}>
                  <DeviceFrame 
                    screen={screen}
                    isComparison={true}
                    onEnterFullscreen={() => enterFullscreen(screenId)}
                  >
                    {screen.implementationStatus === 'completed' && (
                      <ComponentLoader 
                        componentId={screenId}
                        options={{ isComparison: true }}
                        onLoad={(component) => handleComponentLoad(screenId, component)}
                        fallback={
                          <Box sx={{ p: 2, textAlign: 'center' }}>
                            <Typography variant="body2">
                              Implementation available but not yet loaded.
                            </Typography>
                          </Box>
                        }
                      />
                    )}
                  </DeviceFrame>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      <DocumentationPanel activeTab={activeTab} />
    </Container>
  );
}

export default ShowcasePage;
