import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";

const EditAuthor = () => {
  const [authorName, setAuthorName] = useState("");
  const [authorBornDate, setAuthorBornDate] = useState("");
  const [editBornDate, result] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    console.log(authorName, authorBornDate);
    editBornDate({ variables: { name: authorName, born: authorBornDate } });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="authorName">Author Name</label>
          <input
            type="text"
            id="authorName"
            value={authorName}
            placeholder="Enter Author Name"
            onChange={(event) => setAuthorName(event.target.value)}
          />
        </div>
        <div>
          <label htmlFor="authorBorn">Author Born Date</label>
          <input
            type="number"
            id="authorBorn"
            value={authorBornDate}
            onChange={(event) => setAuthorBornDate(Number(event.target.value))}
          />
        </div>
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export default EditAuthor;
