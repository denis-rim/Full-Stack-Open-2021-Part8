import { useLazyQuery, useQuery } from "@apollo/client";
import React, { useEffect } from "react";
import { ALL_BOOKS, ME } from "../queries";

const Recommend = ({ show }) => {
  const [recommendedBooks, setRecommendedBooks] = React.useState([]);
  const user = useQuery(ME);
  const [getBooks, result] = useLazyQuery(ALL_BOOKS);

  useEffect(() => {
    if (user.data?.me) {
      getBooks({
        variables: {
          genre: user.data.me.favoriteGenre,
        },
      });
    }
  }, [user.data]); // eslint-disable-line

  useEffect(() => {
    if (result.data?.allBooks) {
      setRecommendedBooks(result.data.allBooks);
    }
  }, [result.data]); // eslint-disable-line

  if (!show) {
    return null;
  }

  if (user.loading || result.loading) {
    return <div>loading...</div>;
  }
  return (
    <div>
      <h2>recommendations</h2>
      <p>
        books in your favorite genre <b>{user.data.me.favoriteGenre}</b>
      </p>
      <table>
        <tbody>
          <tr>
            <th>title</th>
            <th>author</th>
            <th>published</th>
          </tr>
          {recommendedBooks.length > 0 ? (
            recommendedBooks.map((a) => (
              <tr key={a.title}>
                <td>{a.title}</td>
                <td>{a.author.name}</td>
                <td>{a.published}</td>
              </tr>
            ))
          ) : (
            <p>No book found</p>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Recommend;
