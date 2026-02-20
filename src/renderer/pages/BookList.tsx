import { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from './../firebaseConfig';

// Book data
interface Book {
  id: string;
  title: string;
  author?: string;
}

export function BookList() {
  const [books, setBooks] = useState<Book[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBooks = async () => {
      try {
        // 1. Reference the "books" collection in Firestore
        const booksCollection = collection(db, 'books');

        // 2. Get the snapshot of the documents
        const bookSnapshot = await getDocs(booksCollection);

        // 3. Map the documents into a clean array
        const bookList = bookSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Book[];

        setBooks(bookList);
      } catch (error) {
        console.error("Error fetching books: ", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBooks();
  }, []);

  if (loading) return <p>Loading books...</p>;

  return (
    <div>
      <h1>BookList Page</h1>
      {books.length === 0 ? (
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
