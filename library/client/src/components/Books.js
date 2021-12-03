import { useQuery } from "@apollo/client";
import React, { useEffect } from "react";
import { ALL_BOOKS } from "../queries";

const Books = (props) => {
  const [genres, setGenres] = React.useState([]);
  const [books, setBooks] = React.useState([]);
  const { loading, data } = useQuery(ALL_BOOKS);

  useEffect(() => {
    if (!loading) {
      setBooks(data?.allBooks);
      const genres = Array.from(
        new Set(
          data?.allBooks.reduce((arr, book) => {
            return arr.concat(book.genres);
          }, [])
        )
      );

      setGenres(genres);
    }
  }, [data, loading]);

  const handleFilterBooks = (genre) => {
    const filteredBooks = data?.allBooks.filter((book) => {
      return book.genres.includes(genre);
    });
    setBooks(filteredBooks);
  };

  if (!props.show) {
    return null;
  }

  if (loading) {
    return <div>loading...</div>;
  }

  return (
    <div>
      <h2>books</h2>

      <h3>genres</h3>
      <div>
        <button onClick={() => setBooks(data?.allBooks)}>reset filters</button>
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
