import React, { useEffect } from "react";

const Books = ({ booksData, show }) => {
  const [genres, setGenres] = React.useState([]);
  const [books, setBooks] = React.useState([]);

  useEffect(() => {
    if (!booksData.loading) {
      setBooks(booksData?.data?.allBooks);
      const genres = Array.from(
        new Set(
          booksData?.data?.allBooks.reduce((arr, book) => {
            return arr.concat(book.genres);
          }, [])
        )
      );

      setGenres(genres);
    }
  }, [booksData]);

  const handleFilterBooks = (genre) => {
    const filteredBooks = booksData?.data?.allBooks.filter((book) => {
      return book.genres.includes(genre);
    });
    setBooks(filteredBooks);
  };

  if (!show) {
    return null;
  }

  if (booksData.loading) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <h2>books</h2>

      <h3>genres</h3>
      <div>
        <button onClick={() => setBooks(booksData?.data?.allBooks)}>
          reset filters
        </button>
        {genres
          ? genres.map((genre) => (
              <button
                key={genre}
                onClick={() => {
                  handleFilterBooks(genre);
                }}
              >
                {genre}
              </button>
            ))
          : null}
      </div>

      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {books.map((a) => (
            <tr key={a.title}>
              <td>{a.title}</td>
              <td>{a.author.name}</td>
              <td>{a.published}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Books;
