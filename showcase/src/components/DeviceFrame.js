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

  // Generate a unique ID for this device frame
  const frameId = `device-frame-${screen.id}`;
  const deviceTypeLabel = screen.deviceType.charAt(0).toUpperCase() + screen.deviceType.slice(1);
  const orientationLabel = orientation.charAt(0).toUpperCase() + orientation.slice(1);
  const ariaLabel = `${deviceTypeLabel} device frame for ${screen.title} in ${orientationLabel} orientation`;

  return (
    <Box 
      className={`device-frame ${screen.deviceType} ${isFullscreen ? 'fullscreen' : ''} ${isComparison ? 'comparison' : ''} ${orientation}`}
      role="region"
      aria-label={ariaLabel}
      id={frameId}
    >
      <Box 
        className="device-frame-content"
        aria-live={isFullscreen ? "assertive" : "off"}
      >
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
            aria-label={`Placeholder for ${screen.title}`}
          >
            <img 
              src={screen.imageUrl || `https://via.placeholder.com/800x600?text=${screen.title}`} 
              alt={`Preview of ${screen.title}`}
              style={{ 
                maxWidth: '100%', 
                maxHeight: '100%', 
                objectFit: 'contain'
              }}
            />
          </Box>
        )}
      </Box>
      
      <Box 
        className="device-controls"
        role="toolbar"
        aria-label="Device frame controls"
      >
        {screen.deviceType !== 'desktop' && (
          <Tooltip title="Rotate device">
            <IconButton 
              size="small" 
              onClick={handleRotate} 
              color="primary"
              aria-label={`Rotate to ${orientation === 'portrait' ? 'landscape' : 'portrait'}`}
            >
              <RotateIcon />
            </IconButton>
          </Tooltip>
        )}
        
        <Tooltip title="Device settings">
          <IconButton 
            size="small" 
            onClick={handleSettingsClick} 
            color="primary"
            aria-label="Open device settings"
            aria-haspopup="true"
            aria-expanded={open ? "true" : "false"}
            aria-controls={open ? "device-settings-menu" : undefined}
          >
            <SettingsIcon />
          </IconButton>
        </Tooltip>
        
        <Menu
          id="device-settings-menu"
          anchorEl={anchorEl}
          open={open}
          onClose={handleSettingsClose}
          MenuListProps={{
            'aria-labelledby': 'device-settings-button',
          }}
        >
          <MenuItem onClick={handleSettingsClose}>Change resolution</MenuItem>
          <MenuItem onClick={handleSettingsClose}>Simulate network</MenuItem>
          <MenuItem onClick={handleSettingsClose}>Accessibility options</MenuItem>
        </Menu>
        
        <Tooltip title={isRecording ? "Stop recording" : "Start recording interactions"}>
          <IconButton 
            size="small" 
            onClick={toggleRecording} 
            color={isRecording ? "error" : "primary"}
            aria-label={isRecording ? "Stop recording" : "Start recording interactions"}
            aria-pressed={isRecording}
          >
            {isRecording ? <StopIcon /> : <PlayIcon />}
          </IconButton>
        </Tooltip>
        
        {isFullscreen ? (
          <Tooltip title="Exit fullscreen">
            <IconButton 
              size="small" 
              onClick={onExitFullscreen} 
              color="primary"
              aria-label="Exit fullscreen mode"
            >
              <FullscreenExitIcon />
            </IconButton>
          </Tooltip>
        ) : (
          <Tooltip title="View fullscreen">
            <IconButton 
              size="small" 
              onClick={onEnterFullscreen} 
              color="primary"
              aria-label="Enter fullscreen mode"
            >
              <FullscreenIcon />
            </IconButton>
          </Tooltip>
        )}
      </Box>
      
      {/* Device frame elements */}
      {screen.deviceType === 'mobile' && (
        <>
          <Box 
            className="device-home-button"
            role="presentation"
            aria-hidden="true"
          ></Box>
          <Box 
            className="device-speaker"
            role="presentation"
            aria-hidden="true"
          ></Box>
        </>
      )}
    </Box>
  );
}

export default DeviceFrame;
