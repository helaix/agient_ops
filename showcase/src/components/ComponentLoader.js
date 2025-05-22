import React, { useState, useEffect, useRef } from 'react';
import { Box, CircularProgress, Typography, Alert } from '@mui/material';
import componentRegistry from '../utils/ComponentRegistry';
import { createReactAdapter } from '../utils/ComponentInterface';
import eventBus from '../utils/EventBus';
import sharedStore from '../utils/SharedStore';

/**
 * ComponentLoader
 * 
 * A component that dynamically loads and renders screen components.
 * Uses the component registry to load components on demand.
 */
function ComponentLoader({ 
  componentId, 
  options = {}, 
  onLoad, 
  onError,
  fallback = null
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [component, setComponent] = useState(null);
  const containerRef = useRef(null);
  const componentInstanceRef = useRef(null);

  useEffect(() => {
    let mounted = true;
    let componentAdapter = null;

    const loadComponent = async () => {
      if (!componentId) return;

      try {
        setLoading(true);
        setError(null);

        // Load the component from the registry
        const loadedComponent = await componentRegistry.load(componentId);
        
        if (!mounted) return;

        // Create an adapter for the component
        componentAdapter = createReactAdapter(loadedComponent.default || loadedComponent);
        
        // Initialize the component
        if (containerRef.current) {
          await componentAdapter.initialize(containerRef.current, {
            ...options,
            eventBus,
            store: sharedStore
          });
          
          // Render the component
          await componentAdapter.render();
          
          // Store the component instance
          componentInstanceRef.current = componentAdapter;
          
          // Set the component state
          setComponent(componentAdapter);
          
          // Notify parent that component has loaded
          if (onLoad) {
            onLoad(componentAdapter);
          }
        }
      } catch (err) {
        console.error(`Error loading component "${componentId}":`, err);
        
        if (!mounted) return;
        
        setError(err.message || 'Failed to load component');
        
        // Notify parent of error
        if (onError) {
          onError(err);
        }
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    loadComponent();

    // Clean up when unmounting or when componentId changes
    return () => {
      mounted = false;
      
      // Destroy the component instance if it exists
      if (componentInstanceRef.current) {
        componentInstanceRef.current.destroy().catch(err => {
          console.error(`Error destroying component "${componentId}":`, err);
        });
        componentInstanceRef.current = null;
      }
    };
  }, [componentId, options, onLoad, onError]);

  // If a fallback is provided and we're not loading, show it
  if (!loading && !component && fallback) {
    return fallback;
  }

  const metadata = componentRegistry.getMetadata(componentId) || {};
  const componentName = metadata.title || componentId;

  return (
    <Box 
      ref={containerRef} 
      sx={{ 
        width: '100%', 
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative'
      }}
      role="region"
      aria-label={`${componentName} component container`}
    >
      {loading && (
        <Box 
          sx={{ textAlign: 'center', p: 4 }}
          role="status"
          aria-live="polite"
        >
          <CircularProgress aria-label={`Loading ${componentName}`} />
          <Typography variant="body2" sx={{ mt: 2 }}>
            Loading {componentName}...
          </Typography>
        </Box>
      )}
      
      {error && (
        <Alert 
          severity="error" 
          sx={{ width: '100%', maxWidth: 500 }}
          role="alert"
        >
          {error}
        </Alert>
      )}
    </Box>
  );
}

export default ComponentLoader;
