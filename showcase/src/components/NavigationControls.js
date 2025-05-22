import React from 'react';
import { 
  Box, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  ToggleButtonGroup, 
  ToggleButton, 
  Button, 
  Chip,
  Tooltip
} from '@mui/material';
import { 
  ViewModule as GridIcon, 
  ViewList as ListIcon, 
  Compare as CompareIcon,
  Fullscreen as FullscreenIcon,
  DesktopWindows as DesktopIcon,
  Tablet as TabletIcon,
  PhoneAndroid as MobileIcon,
  DevicesOther as AllDevicesIcon
} from '@mui/icons-material';
import '../styles/NavigationControls.css';

function NavigationControls({
  deviceType,
  viewMode,
  comparisonMode,
  onDeviceTypeChange,
  onViewModeChange,
  onComparisonModeToggle,
  selectedScreens,
  onScreenSelect,
  screens
}) {
  const handleDeviceTypeChange = (event) => {
    onDeviceTypeChange(event.target.value);
  };

  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      onViewModeChange(newMode);
    }
  };

  return (
    <Box className="navigation-controls">
      <Box className="filter-group">
        <Tooltip title="Filter by device type">
          <FormControl variant="outlined" size="small">
            <InputLabel id="device-type-label">Device Type</InputLabel>
            <Select
              labelId="device-type-label"
              id="device-type-select"
              value={deviceType}
              onChange={handleDeviceTypeChange}
              label="Device Type"
              sx={{ minWidth: 150 }}
            >
              <MenuItem value="all">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AllDevicesIcon sx={{ mr: 1 }} />
                  All Devices
                </Box>
              </MenuItem>
              <MenuItem value="desktop">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DesktopIcon sx={{ mr: 1 }} />
                  Desktop
                </Box>
              </MenuItem>
              <MenuItem value="tablet">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TabletIcon sx={{ mr: 1 }} />
                  Tablet
                </Box>
              </MenuItem>
              <MenuItem value="mobile">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MobileIcon sx={{ mr: 1 }} />
                  Mobile
                </Box>
              </MenuItem>
            </Select>
          </FormControl>
        </Tooltip>
      </Box>

      <Box className="filter-group">
        <Tooltip title="Change view mode">
          <ToggleButtonGroup
            value={viewMode}
            exclusive
            onChange={handleViewModeChange}
            aria-label="view mode"
            size="small"
          >
            <ToggleButton value="grid" aria-label="grid view">
              <GridIcon />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
        </Tooltip>
      </Box>

      <Box className="filter-group">
        <Tooltip title={comparisonMode ? "Exit comparison mode" : "Enter comparison mode"}>
          <Button 
            variant={comparisonMode ? "contained" : "outlined"} 
            color="primary" 
            onClick={onComparisonModeToggle}
            startIcon={<CompareIcon />}
            disabled={selectedScreens.length < 2}
            size="small"
          >
            Compare
          </Button>
        </Tooltip>
      </Box>

      {selectedScreens.length > 0 && (
        <Box className="selected-screens">
          <Box component="span" sx={{ mr: 1 }}>Selected:</Box>
          {selectedScreens.map(screenId => {
            const screen = screens.find(s => s.id === screenId);
            return (
              <Chip 
                key={screenId}
                label={screen.title}
                onDelete={() => onScreenSelect(screenId)}
                color="primary"
                variant="outlined"
                size="small"
                sx={{ mr: 0.5 }}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export default NavigationControls;

