import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import '@fontsource/open-sans';
import '@fontsource/open-sans/800.css';
import './App.css';
import { Navbar } from './components/Navbar';
import { BookList } from './pages/BookList';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Clock } from './pages/Clock';
import { Alarm } from './pages/Alarm';
import { Settings } from './pages/Settings';
import { Login } from './pages/Login';
import { Signup } from './pages/Signup';

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

export default function App() {
  return (
    <ThemeProvider theme={theme}>
      <Router>
        <CssBaseline />
        <Routes>
          <Route path="/" element={<Login />}/>
          <Route path="/signup" element={<Signup />}/>
          <Route path="/home" element={
            <>
              <Navbar />
              <div className="main-content">
                <Home />
              </div>
            </>
          }/>
          <Route path="/alarm" element={
            <>
              <Navbar />
              <div className="main-content">
                <Alarm />
              </div>
            </>
          }/>
          <Route path="/clock" element={
            <>
              <Navbar />
              <div className="main-content">
                <Clock />
              </div>
            </>
          }/>
          <Route path="/book-list" element={
            <>
              <Navbar />
              <div className="main-content">
                <BookList />
              </div>
            </>
          }/>
          <Route path="/about" element={
            <>
              <Navbar />
              <div className="main-content">
                <About />
              </div>
            </>
          }/>
          <Route path="/settings" element={
            <>
              <Navbar />
              <div className="main-content">
                <Settings />
              </div>
            </>
          }/>
        </Routes>
      </Router>
    </ThemeProvider>
  );
}