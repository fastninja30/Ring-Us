import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'; 
import '@fontsource/open-sans';
import '@fontsource/open-sans/800.css';
import './App.css';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Navbar } from './components/Navbar';
import { BookList } from './pages/BookList';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Clock } from './pages/Clock';
import { Alarm } from './pages/Alarm';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';
import { VerifyEmail } from './pages/VerifyEmail';

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
      <div className="main-content">
        {children}
      </div>
    </ProtectedRoute>
  );
}

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <AuthProvider>  
      <Router> 
        <CssBaseline />
        <Box sx={{ display: 'flex' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/verify-email" element={<VerifyEmail />} />

            {/* Protected routes */}
            <Route path="/home" element={
              <ProtectedLayout><Home /></ProtectedLayout>
            } />
            <Route path="/alarm" element={
              <ProtectedLayout><Alarm /></ProtectedLayout>
            } />
            <Route path="/clock" element={
              <ProtectedLayout><Clock /></ProtectedLayout>
            } />
            <Route path="/book-list" element={
              <ProtectedLayout><BookList /></ProtectedLayout>
            } />
            <Route path="/about" element={
              <ProtectedLayout><About /></ProtectedLayout>
            } />
            <Route path="/settings" element={
              <ProtectedLayout><Settings /></ProtectedLayout>
            } />
          </Routes>
          </Box>
        </Box>
      </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}