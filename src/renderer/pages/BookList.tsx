import { useEffect, useState } from 'react';
import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
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

  // Helper function to handle conditional rendering
  const renderBookList = () => {
    if (loading && books.length === 0) {
      return <p>Loading books...</p>;
    }

    if (books.length === 0) {
      return <p>No books found in the database.</p>;
    }

    return (
      <ul>
        {books.map((book) => (
          <li key={book.id} style={{ marginBottom: '8px' }}>
            <strong>{book.title}</strong>
            {book.author ? `by ${book.author}` : ''}
            <button
              type="button"
              onClick={() => handleDeleteBook(book.id)}
              disabled={deletingId === book.id}
              style={{ marginLeft: '15px', color: 'red', cursor: 'pointer' }}
            >
              {deletingId === book.id ? 'Deleting...' : 'Delete'}
            </button>
          </li>
        ))}
      </ul>
    );
  };

  return (
    <div>
      <h1>BookList Page</h1>

      {/* Control Panel: Input, Add Button, and Reload Button */}
      <div
        style={{
          marginBottom: '20px',
          padding: '10px',
          border: '1px solid #ccc',
        }}
      >
        <input
          type="text"
          value={newTitle}
          onChange={(e) => setNewTitle(e.target.value)}
          placeholder="Enter book title..."
          disabled={isAdding}
          style={{ marginRight: '10px', padding: '5px' }}
        />
        {/* Add Book Button */}
        <button
          type="button"
          onClick={handleAddBook}
          disabled={isAdding || !newTitle.trim()}
        >
          {isAdding ? 'Adding...' : 'Add Book'}
        </button>

        {/* Reload List Button */}
        <button
          type="button"
          onClick={fetchBooks}
          disabled={loading}
          style={{ marginLeft: '10px' }}
        >
          {loading ? 'Loading...' : 'Reload List'}
        </button>
      </div>

      {/* Display the Data */}
      {renderBookList()}
    </div>
  );
}
