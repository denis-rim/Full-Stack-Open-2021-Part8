import { useApolloClient, useQuery } from "@apollo/client";
import React, { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import LogIn from "./components/LogIn";
import NewBook from "./components/NewBook";
import { ALL_AUTHORS } from "./queries";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(null);
  const result = useQuery(ALL_AUTHORS);
  const client = useApolloClient();

  const logout = () => {
    setToken(null);
    localStorage.clear();
    client.resetStore();
  };

  if (result.loading) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div>
        <button onClick={() => setPage("authors")}>Authors</button>
        <button onClick={() => setPage("books")}>Books</button>
        {!token ? (
          <button onClick={() => setPage("login")}>Login</button>
        ) : (
          <>
            <button onClick={() => setPage("add")}>Add book</button>
            <button onClick={logout}>Logout</button>
          </>
        )}
      </div>
      <Authors
        show={page === "authors"}
        token={token}
        authors={result.data.allAuthors}
      />
      <Books show={page === "books"} />
      <NewBook show={page === "add"} />
      <LogIn show={page === "login"} setToken={setToken} />
    </div>
  );
};

export default App;
