require("dotenv").config();
const { ApolloServer, gql } = require("apollo-server");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
  UserInputError,
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
    booksCount: Int!
  }

  type Book {
    title: String!
    published: Int!
    author: Author!
    genres: [String!]!
    id: ID!
  }

  type Query {
    booksCount: Int!
    authorsCount: Int!
    allBooks(author: String, genre: String): [Book!]!
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
    booksCount: () => Book.collection.countDocuments(),
    authorsCount: () => Author.collection.countDocuments(),
    allBooks: async (root, { author, genre }) => {
      if (!author && !genre) {
        return Book.find({}).populate("author");
      }

      if (genre && !author) {
        const books = await Book.find({ genres: { $in: [genre] } }).populate(
          "author"
        );

        if (books.length === 0) {
          throw new UserInputError(`No books found with genre: ${genre}`);
        }
        return books;
      }

      const authorExist = await Author.findOne({ name: author });

      if (!authorExist) {
        throw new UserInputError(`Author ${author} not found`);
      }

      if (author && !genre) {
        return Book.find({ author: authorExist._id }).populate("author");
      }

      return Book.find({
        $and: [{ genres: { $in: [genre] } }, { author: authorExist._id }],
      }).populate("author");
    },
    allAuthors: async () => {
      return Author.find({});
    },
  },
  Author: {
    booksCount: async (root) => {
      const books = await Book.find({ author: root.id });
      return books.length;
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
          throw new UserInputError(error.message, {
            invalidArgs: { author },
          });
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
        throw new UserInputError(error.message, {
          invalidArgs: { title },
        });
      }

      return newBook;
    },
    editAuthor: async (root, { name, setBornTo }) => {
      const existingAuthor = await Author.findOneAndUpdate(
        { name },
        { born: setBornTo },
        { new: true }
      );

      // this is redundant, because findOneAndUpdate method returns null if no author is found
      if (!existingAuthor) {
        return null;
      }

      return existingAuthor;
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
