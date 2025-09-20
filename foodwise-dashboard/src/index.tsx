import React from 'react';
import { createRoot } from 'react-dom/client';
import { ThemeProvider } from '@mui/material/styles';
import { createTheme, Theme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import App from './App';

// Declare theme augmentation
declare module '@mui/material/styles' {
  interface Theme {
    status: {
      danger: string;
    };
  }
  interface ThemeOptions {
    status?: {
      danger?: string;
    };
  }
}

// Create theme with proper typing
const theme: Theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e',
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff',
    },
  },
  typography: {
    h4: {
      fontWeight: 600,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          margin: 0,
          padding: 0,
          boxSizing: 'border-box',
        },
      },
    },
  },
});

// Get root element with type checking
const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error(
    'Root element not found. The application requires a root element with id "root".'
  );
}

// Create root with proper typing
const root = createRoot(rootElement);

// Render app with error boundary
try {
  root.render(
    <React.StrictMode>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <App />
      </ThemeProvider>
    </React.StrictMode>
  );
} catch (error) {
  console.error('Failed to render application:', error);
  // You might want to render an error fallback UI here
}