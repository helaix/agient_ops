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
    <Paper elevation={3} className="documentation-panel">
      <Typography variant="h5" component="h2" gutterBottom>
        Documentation & Specifications
      </Typography>
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={docTab} onChange={handleDocTabChange} aria-label="documentation tabs">
          <Tab label="Specifications" />
          <Tab label="Implementation Notes" />
          <Tab label="Known Issues" />
          <Tab label="Future Plans" />
        </Tabs>
      </Box>
      
      <TabPanel value={docTab} index={0}>
        <Box className="documentation-content">
          {filteredDocs.map((doc) => (
            <Accordion key={doc.id}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-${doc.id}-content`}
                id={`panel-${doc.id}-header`}
              >
                <Typography variant="subtitle1">{doc.title}</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" component="div" className="doc-description">
                  <div dangerouslySetInnerHTML={{ __html: doc.specifications }} />
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </TabPanel>
      
      <TabPanel value={docTab} index={1}>
        <Box className="documentation-content">
          {filteredDocs.map((doc) => (
            <Accordion key={`impl-${doc.id}`}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-impl-${doc.id}-content`}
                id={`panel-impl-${doc.id}-header`}
              >
                <Typography variant="subtitle1">{doc.title} - Implementation Notes</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" component="div" className="doc-description">
                  <div dangerouslySetInnerHTML={{ __html: doc.implementationNotes }} />
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </TabPanel>
      
      <TabPanel value={docTab} index={2}>
        <Box className="documentation-content">
          {filteredDocs.map((doc) => (
            <Accordion key={`issues-${doc.id}`}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-issues-${doc.id}-content`}
                id={`panel-issues-${doc.id}-header`}
              >
                <Typography variant="subtitle1">{doc.title} - Known Issues</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" component="div" className="doc-description">
                  <div dangerouslySetInnerHTML={{ __html: doc.knownIssues }} />
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </TabPanel>
      
      <TabPanel value={docTab} index={3}>
        <Box className="documentation-content">
          {filteredDocs.map((doc) => (
            <Accordion key={`future-${doc.id}`}>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls={`panel-future-${doc.id}-content`}
                id={`panel-future-${doc.id}-header`}
              >
                <Typography variant="subtitle1">{doc.title} - Future Plans</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="body2" component="div" className="doc-description">
                  <div dangerouslySetInnerHTML={{ __html: doc.futurePlans }} />
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </TabPanel>
    </Paper>
  );
}

export default DocumentationPanel;

