import React from "react";
import EditAuthor from "./EditAuthor";

const Authors = (props) => {
  if (!props.show) {
    return null;
  }
  if (!props.authors) {
    return <div>Loading...</div>;
  }

  const authors = [...props.authors];

  return (
    <div>
      <h2>authors</h2>
      <table>
        <tbody>
          <tr>
            <th></th>
            <th>born</th>
            <th>books</th>
          </tr>
          {authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <EditAuthor />
    </div>
  );
};

export default Authors;
