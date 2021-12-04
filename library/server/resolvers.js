const { UserInputError, AuthenticationError } = require("apollo-server-core");
const { PubSub } = require("graphql-subscriptions");
const User = require("./models/user");
const jwt = require("jsonwebtoken");
const Book = require("./models/book");
const Author = require("./models/author");
const pubsub = new PubSub();

const JWT_SECRET = "NEED_HERE_A_SECRET_KEY";

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

      const bookExist = await Book.findOne({ title });

      if (bookExist) {
        throw new UserInputError(`Book ${title} already exists`);
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
        const savedBook = await newBook.save().then((book) => {
          return book.populate("author");
        });

        pubsub.publish("BOOK_ADDED", { bookAdded: savedBook });

        return savedBook;
      } catch (error) {
        throw new UserInputError(error.message, {
          invalidArgs: { title },
        });
      }
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
  Subscription: {
    bookAdded: {
      subscribe: () => pubsub.asyncIterator(["BOOK_ADDED"]),
    },
  },
};

module.exports = resolvers;
