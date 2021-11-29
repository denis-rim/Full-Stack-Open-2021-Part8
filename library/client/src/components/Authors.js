import React, { useState } from "react";
import EditAuthor from "./EditAuthor";

const Authors = (props) => {
  const [selectedAuthor, setSelectedAuthor] = useState(null);
  if (!props.show) {
    return null;
  }
  if (!props.authors) {
    return <div>Loading...</div>;
  }

  const handleChangeAuthor = (event) => {
    setSelectedAuthor(event.target.value);
  };

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
          {props?.authors.map((a) => (
            <tr key={a.name}>
              <td>{a.name}</td>
              <td>{a.born}</td>
              <td>{a.bookCount}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <div>
        <select value={selectedAuthor} onChange={handleChangeAuthor}>
          {props.authors.map((a) => (
            <option key={a.name} value={a.name}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        {selectedAuthor && (
          <p
            style={{
              display: "inline-block",
              border: "1px solid black",
              padding: "10px 15px",
            }}
          >
            Selected: {selectedAuthor}
          </p>
        )}
      </div>
      <EditAuthor selectedAuthor={selectedAuthor} />
    </div>
  );
};

export default Authors;
