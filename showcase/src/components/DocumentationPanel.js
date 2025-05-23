import React from 'react';
import { 
  Box, 
  Typography, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Tabs,
  Tab,
  Paper
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { documentationData } from '../data/documentation';
import '../styles/DocumentationPanel.css';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`documentation-tabpanel-${index}`}
      aria-labelledby={`documentation-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `documentation-tab-${index}`,
    'aria-controls': `documentation-tabpanel-${index}`,
  };
}

function DocumentationPanel({ activeTab }) {
  const [docTab, setDocTab] = React.useState(0);

  const handleDocTabChange = (event, newValue) => {
    setDocTab(newValue);
  };

  // Filter documentation based on active tab
  const filteredDocs = documentationData.filter(doc => {
    if (activeTab === 0) return true; // All screens
    if (activeTab === 1 && doc.deviceType === 'desktop') return true;
    if (activeTab === 2 && doc.deviceType === 'tablet') return true;
    if (activeTab === 3 && doc.deviceType === 'mobile') return true;
    if (activeTab === 4 && doc.deviceType === 'cross-device') return true;
    return false;
  });

  return (
    <Paper 
      elevation={3} 
      className="documentation-panel"
      role="region"
      aria-label="Documentation and specifications"
    >
      <Typography variant="h5" component="h2" gutterBottom id="documentation-heading">
        Documentation & Specifications
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={docTab} 
          onChange={handleDocTabChange} 
          aria-label="Documentation categories"
          role="navigation"
        >
          <Tab label="Specifications" {...a11yProps(0)} />
          <Tab label="Implementation Notes" {...a11yProps(1)} />
          <Tab label="Known Issues" {...a11yProps(2)} />
          <Tab label="Future Plans" {...a11yProps(3)} />
        </Tabs>
      </Box>
      
      <TabPanel value={docTab} index={0}>
        <Box className="documentation-content">
          {filteredDocs.map((doc) => (
            <Accordion 
              key={doc.id}
              TransitionProps={{ unmountOnExit: true }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon aria-hidden="true" />}
                aria-controls={`panel-${doc.id}-content`}
                id={`panel-${doc.id}-header`}
              >
                <Typography variant="subtitle1">{doc.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography 
                  variant="body2" 
                  component="div" 
                  className="doc-description"
                  tabIndex={0}
                >
                  <div dangerouslySetInnerHTML={{ __html: doc.specifications }} />
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
          {filteredDocs.length === 0 && (
            <Typography variant="body1" color="text.secondary">
              No specifications available for the selected category.
            </Typography>
          )}
        </Box>
      </TabPanel>
      
      <TabPanel value={docTab} index={1}>
        <Box className="documentation-content">
          {filteredDocs.map((doc) => (
            <Accordion 
              key={`impl-${doc.id}`}
              TransitionProps={{ unmountOnExit: true }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon aria-hidden="true" />}
                aria-controls={`panel-impl-${doc.id}-content`}
                id={`panel-impl-${doc.id}-header`}
              >
                <Typography variant="subtitle1">{doc.title} - Implementation Notes</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography 
                  variant="body2" 
                  component="div" 
                  className="doc-description"
                  tabIndex={0}
                >
                  <div dangerouslySetInnerHTML={{ __html: doc.implementationNotes }} />
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
          {filteredDocs.length === 0 && (
            <Typography variant="body1" color="text.secondary">
              No implementation notes available for the selected category.
            </Typography>
          )}
        </Box>
      </TabPanel>
      
      <TabPanel value={docTab} index={2}>
        <Box className="documentation-content">
          {filteredDocs.map((doc) => (
            <Accordion 
              key={`issues-${doc.id}`}
              TransitionProps={{ unmountOnExit: true }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon aria-hidden="true" />}
                aria-controls={`panel-issues-${doc.id}-content`}
                id={`panel-issues-${doc.id}-header`}
              >
                <Typography variant="subtitle1">{doc.title} - Known Issues</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography 
                  variant="body2" 
                  component="div" 
                  className="doc-description"
                  tabIndex={0}
                >
                  <div dangerouslySetInnerHTML={{ __html: doc.knownIssues }} />
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
          {filteredDocs.length === 0 && (
            <Typography variant="body1" color="text.secondary">
              No known issues available for the selected category.
            </Typography>
          )}
        </Box>
      </TabPanel>
      
      <TabPanel value={docTab} index={3}>
        <Box className="documentation-content">
          {filteredDocs.map((doc) => (
            <Accordion 
              key={`future-${doc.id}`}
              TransitionProps={{ unmountOnExit: true }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon aria-hidden="true" />}
                aria-controls={`panel-future-${doc.id}-content`}
                id={`panel-future-${doc.id}-header`}
              >
                <Typography variant="subtitle1">{doc.title} - Future Plans</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography 
                  variant="body2" 
                  component="div" 
                  className="doc-description"
                  tabIndex={0}
                >
                  <div dangerouslySetInnerHTML={{ __html: doc.futurePlans }} />
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
          {filteredDocs.length === 0 && (
            <Typography variant="body1" color="text.secondary">
              No future plans available for the selected category.
            </Typography>
          )}
        </Box>
      </TabPanel>
    </Paper>
  );
}

export default DocumentationPanel;
