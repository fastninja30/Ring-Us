import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Box, CssBaseline, ThemeProvider, createTheme } from '@mui/material'; 
import '@fontsource/open-sans';
import '@fontsource/open-sans/800.css';
import { IoMdClock } from "react-icons/io";
import icon from '../../assets/icon.svg';
import './App.css';
import { Navbar } from './components/Navbar';
import { BookList } from './pages/BookList';
import { Home } from './pages/Home';
import { About } from './pages/About';
import { Clock } from './pages/Clock';
import { Settings } from './pages/Settings';

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
        <Box sx={{ display: 'flex' }}>
          <Navbar />
          <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
          <Routes>
            <Route path="/" element={<Home />}/>
            <Route path="/book-list" element={<BookList />}/>
            <Route path="/about" element={<About />}/>
            <Route path="/clock" element={<Clock />}/>
            <Route path="/settings" element={<Settings />}/>
          </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}
