import { MemoryRouter as Router, Routes, Route } from 'react-router-dom';
import { Button, CssBaseline } from '@mui/material'; 
import '@fontsource/open-sans';
import '@fontsource/open-sans/800.css';
import { IoMdClock } from "react-icons/io";
import icon from '../../assets/icon.svg';
import './App.css';
import { Navbar } from './components/Navbar';
import { BookList } from './pages/BookList';
import { Home } from './pages/Home';



export default function App() {
  return (
    <Router> 
      <CssBaseline />
      <Navbar />
      <div>
        <Routes>
          <Route path="/" element={<Home />}/>
          <Route path="/book-list" element={<BookList />}/>
        </Routes>
      </div>
    </Router>
  );
}
