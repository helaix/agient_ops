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
    <Box 
      className="navigation-controls"
      role="toolbar"
      aria-label="Showcase navigation and filtering controls"
    >
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
              aria-label="Filter screens by device type"
            >
              <MenuItem value="all">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <AllDevicesIcon sx={{ mr: 1 }} aria-hidden="true" />
                  All Devices
                </Box>
              </MenuItem>
              <MenuItem value="desktop">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <DesktopIcon sx={{ mr: 1 }} aria-hidden="true" />
                  Desktop
                </Box>
              </MenuItem>
              <MenuItem value="tablet">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <TabletIcon sx={{ mr: 1 }} aria-hidden="true" />
                  Tablet
                </Box>
              </MenuItem>
              <MenuItem value="mobile">
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <MobileIcon sx={{ mr: 1 }} aria-hidden="true" />
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
            aria-label="View mode selection"
            size="small"
          >
            <ToggleButton 
              value="grid" 
              aria-label="grid view"
              aria-pressed={viewMode === 'grid'}
            >
              <GridIcon aria-hidden="true" />
              <span className="visually-hidden">Grid View</span>
            </ToggleButton>
            <ToggleButton 
              value="list" 
              aria-label="list view"
              aria-pressed={viewMode === 'list'}
            >
              <ListIcon aria-hidden="true" />
              <span className="visually-hidden">List View</span>
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
            startIcon={<CompareIcon aria-hidden="true" />}
            disabled={selectedScreens.length < 2}
            size="small"
            aria-pressed={comparisonMode}
            aria-label="Toggle comparison mode"
          >
            Compare
          </Button>
        </Tooltip>
      </Box>

      {selectedScreens.length > 0 && (
        <Box 
          className="selected-screens"
          role="region"
          aria-label="Selected screens"
        >
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
                aria-label={`${screen.title} (click to remove)`}
                deleteButtonProps={{
                  'aria-label': `Remove ${screen.title} from selection`
                }}
              />
            );
          })}
        </Box>
      )}
    </Box>
  );
}

export default NavigationControls;
