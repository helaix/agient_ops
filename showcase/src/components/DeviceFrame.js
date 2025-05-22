import React, { useState } from 'react';
import { Box, IconButton, Tooltip, Menu, MenuItem } from '@mui/material';
import { 
  Fullscreen as FullscreenIcon, 
  FullscreenExit as FullscreenExitIcon,
  RotateRight as RotateIcon,
  Settings as SettingsIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon
} from '@mui/icons-material';
import '../styles/DeviceFrame.css';

function DeviceFrame({ 
  screen, 
  isFullscreen = false, 
  isComparison = false, 
  onEnterFullscreen, 
  onExitFullscreen,
  children 
}) {
  const [orientation, setOrientation] = useState('portrait');
  const [isRecording, setIsRecording] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleRotate = () => {
    setOrientation(orientation === 'portrait' ? 'landscape' : 'portrait');
  };

  const toggleRecording = () => {
    setIsRecording(!isRecording);
  };

  const handleSettingsClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleSettingsClose = () => {
    setAnchorEl(null);
  };

  return (
    <Box 
      className={`device-frame ${screen.deviceType} ${isFullscreen ? 'fullscreen' : ''} ${isComparison ? 'comparison' : ''} ${orientation}`}
    >
      <Box className="device-frame-content">
        {children ? (
          children
        ) : (
          // Default content when no children are provided
          <Box 
            sx={{ 
              p: 2, 
              height: '100%', 
              display: 'flex', 
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              backgroundColor: '#f0f2f5'
            }}
          >
            <img 
              src={screen.imageUrl || `https://via.placeholder.com/800x600?text=${screen.title}`} 
              alt={screen.title}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                objectFit: 'contain'
              }}
            />
          </Box>
        )}
      </Box>
      
      <Box className="device-controls">
        {screen.deviceType !== 'desktop' && (
          <Tooltip title="Rotate device">
            <IconButton size="small" onClick={handleRotate} color="primary">
              <RotateIcon />
            </IconButton>
          </Tooltip>
        )}
        
        <Tooltip title="Device settings">
          <IconButton size="small" onClick={handleSettingsClick} color="primary">
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        
        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={handleSettingsClose}
        >
          <MenuItem onClick={handleSettingsClose}>Change resolution</MenuItem>
          <MenuItem onClick={handleSettingsClose}>Simulate network</MenuItem>
          <MenuItem onClick={handleSettingsClose}>Accessibility options</MenuItem>
        </Menu>
        
        <Tooltip title={isRecording ? "Stop recording" : "Start recording interactions"}>
          <IconButton size="small" onClick={toggleRecording} color={isRecording ? "error" : "primary"}>
            {isRecording ? <StopIcon /> : <PlayIcon />}
          </IconButton>
        </Tooltip>
        
        {isFullscreen ? (
          <Tooltip title="Exit fullscreen">
            <IconButton size="small" onClick={onExitFullscreen} color="primary">
              <FullscreenExitIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="View fullscreen">
            <IconButton size="small" onClick={onEnterFullscreen} color="primary">
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      {/* Device frame elements */}
      {screen.deviceType === 'mobile' && (
        <>
          <Box className="device-home-button"></Box>
          <Box className="device-speaker"></Box>
        </>
      )}
    </Box>
  );
}

export default DeviceFrame;
