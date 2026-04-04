import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import React, { useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { FriendsProvider } from './contexts/FriendsContext';
import {
  ThemeProvider as CustomThemeProvider,
  useTheme,
} from './contexts/ThemeContext';
import { lightTheme, darkTheme } from './theme';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { BookList } from './pages/BookList';
import { About } from './pages/About';
import { Alarm } from './pages/Alarm';
import { Settings } from './pages/Settings';
import { Friends } from './pages/Friends';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { VerifyEmail } from './pages/VerifyEmail';

const drawerWidth = 240;

function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { mode } = useTheme();
  const theme = mode === 'dark' ? darkTheme : lightTheme;

  return <ThemeProvider theme={theme}>{children}</ThemeProvider>;
}

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Box sx={{ display: 'flex', minHeight: '100vh' }}>
        <Navbar />
        <Box
          component="main"
          sx={{
            flexGrow: 1,
            p: { xs: 2, sm: 3 },
            mt: { xs: 8, md: 0 },
            ml: { xs: 0, md: `${drawerWidth}px` },
            width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          }}
        >
          {children}
        </Box>
      </Box>
    </ProtectedRoute>
  );
}

function NavigationHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!window.electron?.ipcRenderer) return;

    const removeListener = window.electron.ipcRenderer.on(
      'navigate',
      (path) => {
        if (typeof path === 'string') {
          navigate(path);
        }
      },
    );

    return () => {
      if (removeListener) removeListener();
    };
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <CustomThemeProvider>
      <ThemeWrapper>
        <AuthProvider>
          <FriendsProvider>
            <Router>
              <NavigationHandler />
              <CssBaseline />
              <Routes>
                {/* Public routes */}
                <Route path="/" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
                <Route path="/verify-email" element={<VerifyEmail />} />

                {/* Protected routes */}
                <Route
                  path="/alarm"
                  element={
                    <ProtectedLayout>
                      <Alarm />
                    </ProtectedLayout>
                  }
                />
                <Route
                  path="/book-list"
                  element={
                    <ProtectedLayout>
                      <BookList />
                    </ProtectedLayout>
                  }
                />
                <Route
                  path="/about"
                  element={
                    <ProtectedLayout>
                      <About />
                    </ProtectedLayout>
                  }
                />
                <Route
                  path="/settings"
                  element={
                    <ProtectedLayout>
                      <Settings />
                    </ProtectedLayout>
                  }
                />
                <Route
                  path="/friends"
                  element={
                    <ProtectedLayout>
                      <Friends />
                    </ProtectedLayout>
                  }
                />
              </Routes>
            </Router>
          </FriendsProvider>
        </AuthProvider>
      </ThemeWrapper>
    </CustomThemeProvider>
  );
}
