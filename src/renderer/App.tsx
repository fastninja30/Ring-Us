import {
  MemoryRouter as Router,
  Routes,
  Route,
  useNavigate,
} from 'react-router-dom';
import { useEffect } from 'react';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import '@fontsource/open-sans';
import '@fontsource/open-sans/800.css';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { FriendsProvider } from './contexts/FriendsContext';
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

const theme = createTheme({
  palette: {
    mode: 'dark',
    text: {
      primary: '#F4F3F2',
    },
  },
  // change font here
  typography: {
    fontFamily: 'san francisco, sans-serif',
  },
});

function ProtectedLayout({ children }: { children: React.ReactNode }) {
  return (
    <ProtectedRoute>
      <Navbar />
      <div className="main-content">{children}</div>
    </ProtectedRoute>
  );
}

function NavigationHandler() {
  const navigate = useNavigate();

  useEffect(() => {
    const removeListener = window.electron.ipcRenderer.on('navigate', (path) => {
      if (typeof path === 'string') {
        navigate(path);
      }
    });

    return () => {
      removeListener();
    };
  }, [navigate]);

  return null;
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>
        <FriendsProvider>
          <Router>
            <NavigationHandler />
            <CssBaseline />
            <Box sx={{ display: 'flex', minHeight: '100vh' }}>
              <Box
                component="main"
                sx={{
                  flexGrow: 1,
                  p: { xs: 2, sm: 3 },
                  mt: { xs: 6, md: 0 },
                  ml: { xs: 0, md: `${drawerWidth}px` },
                  width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
                }}
              >
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
              </Box>
            </Box>
          </Router>
        </FriendsProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}
