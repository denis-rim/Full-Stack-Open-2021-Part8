import { useQuery } from "@apollo/client";
import React, { useEffect } from "react";
import { ME } from "../queries";

const Recommend = ({ booksData, show }) => {
  const [recommendedBooks, setRecommendedBooks] = React.useState([]);
  const { data, loading } = useQuery(ME);

  useEffect(() => {
    if (data?.me) {
      const filteredByGenreBooks = booksData?.data?.allBooks?.filter((book) => {
        return book.genres.includes(data.me.favoriteGenre);
      });
      setRecommendedBooks(filteredByGenreBooks);
    }
  }, [booksData, data]);

  if (!show) {
    return null;
  }

  if (loading) {
    return <div>loading...</div>;
  }
  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favorite genre <b>{data.me.favoriteGenre}</b>
      </p>
      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {recommendedBooks.length > 0 &&
            recommendedBooks.map((a) => (
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

export default Recommend;
