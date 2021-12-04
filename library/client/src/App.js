import { useApolloClient, useQuery, useSubscription } from "@apollo/client";
import React, { useState } from "react";
import Authors from "./components/Authors";
import Books from "./components/Books";
import LogIn from "./components/LogIn";
import NewBook from "./components/NewBook";
import Recommend from "./components/Recommend";
import { ALL_AUTHORS, ALL_BOOKS, BOOK_ADDED } from "./queries";

const App = () => {
  const [page, setPage] = useState("authors");
  const [token, setToken] = useState(() => {
    return localStorage.getItem("library-user-token");
  });
  const result = useQuery(ALL_AUTHORS);
  const books = useQuery(ALL_BOOKS);
  const client = useApolloClient();

  const updateCacheWith = (addedBook) => {
    const includedIn = (set, object) =>
      set.map((p) => p.id).includes(object.id);

    const dataInStore = client.readQuery({ query: ALL_BOOKS });
    if (!includedIn(dataInStore.allBooks, addedBook)) {
      client.writeQuery({
        query: ALL_BOOKS,
        data: { allBooks: dataInStore.allBooks.concat(addedBook) },
      });
    }
  };

  useSubscription(BOOK_ADDED, {
    onSubscriptionData: ({ subscriptionData }) => {
      const addedBook = subscriptionData.data.bookAdded;
      window.alert(`${subscriptionData.data.bookAdded.title} added`);
      updateCacheWith(addedBook);
    },
  });

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
            <button onClick={() => setPage("recommend")}>Recommend</button>
            <button onClick={logout}>Logout</button>
          </>
        )}
      </div>
      <Authors
        show={page === "authors"}
        token={token}
        authors={result.data.allAuthors}
      />
      <Books show={page === "books"} booksData={books} />
      <NewBook show={page === "add"} updateCacheWith={updateCacheWith} />
      <Recommend show={page === "recommend"} booksData={books} />
      <LogIn show={page === "login"} setToken={setToken} setPage={setPage} />
    </div>
  );
};

export default App;
