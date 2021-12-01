require("dotenv").config();
const { ApolloServer, gql } = require("apollo-server");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
} = require("apollo-server-core");
const { v1: uuid } = require("uuid");
const mongoose = require("mongoose");
const Book = require("./models/book");
const Author = require("./models/author");

mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => {
    console.log("connected to MongoDB");
  })
  .catch((error) => {
    console.log("error connecting to MongoDB:", error.message);
  });

const typeDefs = gql`
  type Author {
    id: ID!
    name: String!
    born: Int
    bookCount: Int!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Query {
    bookCount: Int!
    authorCount: Int!
    allBooks(genre: String): [Book!]!
    allAuthors: [Author!]!
  }

  type Mutation {
    addBook(
      title: String!
      author: String!
      published: Int!
      genres: [String!]!
    ): Book
    addAuthor(name: String!, born: Int): Author
    editAuthor(name: String!, setBornTo: Int!): Author
  }
`;

const resolvers = {
  Query: {
    bookCount: () => books.length,
    authorCount: () => authors.length,
    allBooks: (root, { genre }) => {
      if (!genre) {
        return books;
      }

      return books.filter((book) => book.genres.includes(genre));
    },
    allAuthors: () => {
      return authors.map((author) => {
        return {
          ...author,
          bookCount: books.filter((book) => book.author === author.name).length,
        };
      });
    },
  },
  Mutation: {
    addBook: async (root, { title, author, published, genres }) => {
      let existingAuthor = await Author.findOne({ name: author });

      if (!existingAuthor) {
        const newAuthor = new Author({
          name: author,
        });

        try {
          existingAuthor = await newAuthor.save();
        } catch (error) {
          console.log(error);
        }
      }

      const newBook = new Book({
        title,
        author: existingAuthor._id,
        published,
        genres,
      });

      try {
        await newBook.save();
      } catch (error) {
        console.log(error);
      }

      return newBook;
    },
    editAuthor: (root, { name, setBornTo }) => {
      const existingAuthor = authors.find((author) => author.name === name);

      if (!existingAuthor) {
        return null;
      }
      authors = authors.map((author) => {
        if (author.name === name) {
          return {
            ...author,
            born: setBornTo,
          };
        }
        return author;
      });

      return {
        ...existingAuthor,
        born: setBornTo,
      };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
