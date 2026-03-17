import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
} from '@mui/material';
import { IoMdAdd, IoMdTrash, IoMdRefresh } from 'react-icons/io';
import { db } from '../firebaseConfig';

interface Book {
  id: string;
  title: string;
  author?: string;
}

export function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // State variables for the input field and submission status
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // State variable to track which book is currently being deleted
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // 1. Extract the fetch logic into a standalone function
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const booksCollection = collection(db, 'books');
      const bookSnapshot = await getDocs(booksCollection);

      const bookList = bookSnapshot.docs.map((bookDoc) => ({
        id: bookDoc.id,
        ...bookDoc.data(),
      })) as Book[];

      setBooks(bookList);
    } catch (error) {
      console.error('Error fetching books: ', error);
    } finally {
      setLoading(false);
    }
  };

  // 2. Call fetchBooks when the component first loads
  useEffect(() => {
    fetchBooks();
  }, []);

  // 3. Create a function to handle adding data to Firestore
  const handleAddBook = async () => {
    if (!newTitle.trim()) return;

    setIsAdding(true);
    try {
      const booksCollection = collection(db, 'books');

      // Capture the document reference returned by addDoc
      const docRef = await addDoc(booksCollection, {
        title: newTitle.trim(),
      });

      // Create the new book object locally
      const newBook: Book = {
        id: docRef.id,
        title: newTitle.trim(),
      };

      // Instantly update the local state so the UI reflects the addition
      setBooks((prevBooks) => [...prevBooks, newBook]);

      setNewTitle(''); // Clear the input field
    } catch (error) {
      console.error('Error adding book: ', error);
    } finally {
      setIsAdding(false);
    }
  };

  // 4. Create a function to handle deleting a specific document
  const handleDeleteBook = async (id: string) => {
    setDeletingId(id);
    try {
      const bookDocRef = doc(db, 'books', id);
      await deleteDoc(bookDocRef);

      // Instantly update local state so the UI reflects the deletion
      setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id));
    } catch (error) {
      console.error('Error deleting book: ', error);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: { xs: 2, sm: 4 }, px: { xs: 2, sm: 3 } }}>
      <Typography variant="h4" sx={{ fontWeight: 700, mb: 3, textAlign: 'center' }}>
        Book List
      </Typography>

      {/* Control Panel: Input, Add Button, and Reload Button */}
      <Paper sx={{ p: { xs: 2, sm: 3 }, mb: 3, background: 'rgba(30, 30, 30, 0.7)' }}>
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', sm: 'row' }, gap: 2 }}>
          <TextField
            fullWidth
            label="Book Title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Enter book title..."
            disabled={isAdding}
            size="small"
          />
          <Box sx={{ display: 'flex', gap: 1, width: { xs: '100%', sm: 'auto' } }}>
            <Button
              variant="contained"
              startIcon={<IoMdAdd />}
              onClick={handleAddBook}
              disabled={isAdding || !newTitle.trim()}
              sx={{
                backgroundColor: '#ff7300',
                '&:hover': { backgroundColor: '#e56700' },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {isAdding ? <CircularProgress size={20} /> : 'Add'}
            </Button>
            <Button
              variant="outlined"
              startIcon={<IoMdRefresh />}
              onClick={fetchBooks}
              disabled={loading}
              sx={{
                borderColor: '#ff7300',
                color: '#ff7300',
                '&:hover': { borderColor: '#e56700', color: '#e56700' },
                width: { xs: '100%', sm: 'auto' },
              }}
            >
              {loading ? <CircularProgress size={20} /> : 'Reload'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Display the Data */}
      {loading && books.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress sx={{ color: '#ff7300' }} />
        </Box>
      ) : books.length === 0 ? (
        <Paper sx={{ p: 4, textAlign: 'center', background: 'rgba(30, 30, 30, 0.7)' }}>
          <Typography color="text.secondary">
            No books found in the database.
          </Typography>
        </Paper>
      ) : (
        <Paper sx={{ background: 'rgba(30, 30, 30, 0.7)' }}>
          <List>
            {books.map((book, index) => (
              <ListItem
                key={book.id}
                sx={{
                  borderBottom: index < books.length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                }}
              >
                <ListItemText
                  primary={
                    <Typography variant="body1" sx={{ fontWeight: 500 }}>
                      {book.title}
                    </Typography>
                  }
                  secondary={
                    book.author ? (
                      <Typography variant="body2" color="text.secondary">
                        by {book.author}
                      </Typography>
                    ) : null
                  }
                />
                <ListItemSecondaryAction sx={{ position: { xs: 'relative', sm: 'absolute' }, right: { xs: 0, sm: 8 }, top: { xs: 'unset', sm: '50%' }, transform: { xs: 'none', sm: 'translateY(-50%)' }, mt: { xs: 1, sm: 0 } }}>
                  <IconButton
                    onClick={() => handleDeleteBook(book.id)}
                    disabled={deletingId === book.id}
                    sx={{ color: '#ff4444' }}
                  >
                    {deletingId === book.id ? (
                      <CircularProgress size={20} sx={{ color: '#ff4444' }} />
                    ) : (
                      <IoMdTrash />
                    )}
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </Paper>
      )}
    </Box>
  );
}
