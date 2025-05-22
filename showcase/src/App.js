import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import ShowcasePage from './components/ShowcasePage';
import './styles/App.css';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#1890ff',
    },
    secondary: {
      main: '#722ed1',
    },
    background: {
      default: '#f0f2f5',
    },
    error: {
      main: '#ff4d4f', // Urgent priority
    },
    warning: {
      main: '#fa8c16', // High priority
    },
    info: {
      main: '#fadb14', // Medium priority
    },
    success: {
      main: '#52c41a', // Low priority
    },
  },
  typography: {
    fontFamily: [
      'Roboto',
      '-apple-system',
      'BlinkMacSystemFont',
      '"Segoe UI"',
      '"Helvetica Neue"',
      'Arial',
      'sans-serif',
    ].join(','),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Routes>
          <Route path="/" element={<ShowcasePage />} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;

