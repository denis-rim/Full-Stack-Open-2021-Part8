require("dotenv").config();
const { ApolloServer, gql } = require("apollo-server");
const {
  ApolloServerPluginLandingPageGraphQLPlayground,
  UserInputError,
  AuthenticationError,
} = require("apollo-server-core");
const jwt = require("jsonwebtoken");
const { v1: uuid } = require("uuid");
const mongoose = require("mongoose");
const Book = require("./models/book");
const Author = require("./models/author");
const User = require("./models/user");

const JWT_SECRET = "NEED_HERE_A_SECRET_KEY";

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
  type User {
    username: String!
    favoriteGenre: String!
    id: ID!
  }

  type Token {
    value: String!
  }

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
    me: User
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
    createUser(username: String!, favoriteGenre: String!): User
    login(username: String!, password: String!): Token
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
    me: (root, args, context) => {
      return context.currentUser;
    },
  },
  Author: {
    booksCount: async (root) => {
      const books = await Book.find({ author: root.id });
      return books.length;
    },
  },
  Mutation: {
    addBook: async (root, { title, author, published, genres }, context) => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }

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
    editAuthor: async (root, { name, setBornTo }, context) => {
      const currentUser = context.currentUser;

      if (!currentUser) {
        throw new AuthenticationError("not authenticated");
      }

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
    createUser: async (root, { username, favoriteGenre }) => {
      const user = new User({ username, favoriteGenre });
      try {
        return await user.save();
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: { username, favoriteGenre },
        });
      }
    },
    login: async (root, { username, password }) => {
      const user = await User.findOne({ username: username });

      if (!user || password !== "secret") {
        throw new UserInputError("wrong credentials");
      }

      const userForToken = {
        username: user.username,
        id: user._id,
      };

      return { value: jwt.sign(userForToken, JWT_SECRET) };
    },
  },
};

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: async ({ req }) => {
    const auth = req ? req.headers.authorization : null;
    if (auth && auth.toLowerCase().startsWith("bearer ")) {
      const decodedToken = jwt.verify(auth.substring(7), JWT_SECRET);
      const currentUser = await User.findById(decodedToken.id);
      return { currentUser };
    }
  },
  plugins: [ApolloServerPluginLandingPageGraphQLPlayground()],
});

server.listen().then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
