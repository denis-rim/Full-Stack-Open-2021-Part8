import { useMutation } from "@apollo/client";
import React, { useState } from "react";
import { ALL_AUTHORS, EDIT_AUTHOR } from "../queries";

const EditAuthor = (props) => {
  const [authorBornDate, setAuthorBornDate] = useState("");
  const [editBornDate] = useMutation(EDIT_AUTHOR, {
    refetchQueries: [{ query: ALL_AUTHORS }],
  });

  const handleSubmit = (event) => {
    event.preventDefault();
    editBornDate({
      variables: { name: props.selectedAuthor, born: authorBornDate },
    });
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div>
          <label htmlFor="authorBorn">Author Born Date</label>
          <input
            type="number"
            id="authorBorn"
            value={authorBornDate}
            onChange={(event) => setAuthorBornDate(Number(event.target.value))}
          />
        </div>
        <button type="submit">Update Author</button>
      </form>
    </div>
  );
};

export default EditAuthor;
