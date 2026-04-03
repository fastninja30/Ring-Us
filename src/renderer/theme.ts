import { createTheme, ThemeOptions } from '@mui/material/styles';

const sharedThemeOptions: ThemeOptions = {
  typography: {
    fontFamily: "'Inter', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', 'sans-serif'",
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 700,
          fontSize: '1rem',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 12,
        },
      },
    },
  },
};

export const lightTheme = createTheme({
  ...sharedThemeOptions,
  palette: {
    mode: 'light',
    primary: {
      main: '#ff7300',
      contrastText: '#fff',
    },
    secondary: {
      main: '#9c27b0',
    },
    background: {
      default: '#f4f3f2',
      paper: 'rgba(255, 255, 255, 0.9)',
    },
    text: {
      primary: '#0f0f0f',
      secondary: '#666',
      disabled: '#999',
    },
    success: {
      main: '#2e7d32',
    },
    error: {
      main: '#d32f2f',
    },
    action: {
      hover: 'rgba(0, 0, 0, 0.04)',
    },
  },
});

export const darkTheme = createTheme({
  ...sharedThemeOptions,
  palette: {
    mode: 'dark',
    primary: {
      main: '#ff7300',
      contrastText: '#fff',
    },
    secondary: {
      main: '#f48fb1',
    },
    background: {
      default: '#0f0f0f',
      paper: 'rgba(30, 30, 30, 0.7)',
    },
    text: {
      primary: '#F4F3F2',
      secondary: '#aaa',
      disabled: '#555',
    },
    success: {
      main: '#4caf50',
    },
    error: {
      main: '#ff4444',
    },
    action: {
      hover: 'rgba(255, 255, 255, 0.08)',
    },
  },
});
