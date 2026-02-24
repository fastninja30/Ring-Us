import { useEffect, useState } from 'react';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

interface Book {
  id: string;
  title: string;
  author?: string;
}

export function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  // New state variables for the input field and submission status
  const [newTitle, setNewTitle] = useState('');
  const [isAdding, setIsAdding] = useState(false);

  // 1. Extract the fetch logic into a standalone function
  const fetchBooks = async () => {
    setLoading(true);
    try {
      const booksCollection = collection(db, 'books');
      const bookSnapshot = await getDocs(booksCollection);

      const bookList = bookSnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
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
    if (!newTitle.trim()) return; // Don't submit empty strings

    setIsAdding(true);
    try {
      const booksCollection = collection(db, 'books');

      // addDoc automatically generates a unique ID for the new document
      await addDoc(booksCollection, {
        title: newTitle.trim()
      });

      setNewTitle(''); // Clear the input field after success
    } catch (error) {
      console.error('Error adding book: ', error);
    } finally {
      setIsAdding(false);
    }
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
        <button onClick={handleAddBook} disabled={isAdding || !newTitle.trim()}>
          {isAdding ? 'Adding...' : 'Add Book'}
        </button>

        <button onClick={fetchBooks} disabled={loading} style={{ marginLeft: '10px' }}>
          {loading ? 'Loading...' : 'Reload List'}
        </button>
      </div>

      {/* Display the Data */}
      {loading && books.length === 0 ? (
        <p>Loading books...</p>
      ) : books.length === 0 ? (
        <p>No books found in the database.</p>
      ) : (
        <ul>
          {books.map((book) => (
            <li key={book.id}>
              <strong>{book.title}</strong> {book.author ? `by ${book.author}` : ''}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
  }
