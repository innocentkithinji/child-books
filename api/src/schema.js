import { gql } from "apollo-server";

export const typeDefs = gql`
    """Format of a book."""
    type Book {
        uid: String!,
        title: String!,
        cover: String!,
        author: String!,
        pages: [Page!]!
        numPages: Int!,
        has_next_page: Boolean!
    }

    """For for a page of a book."""
    type Page {
        pageIndex: Int!,
        content: String!
        tokens: [Token!]!
    }

    """Format for a token in a page."""
    type Token {
        position: [Int!]!,
        value: String!
    }

    """Standard error format."""
    type Error {
        message: String!
        code: Int!
    }

    """Format for a list of books."""
    type BookList {
        books: [Book!]!
    }

    """Union type for query results and errors."""
    union BooksResult =  BookList | Error
    union BookResult =  Book | Error

    """Query for books and specific books."""
    type Query {
        books: BooksResult
        book(bookUID: String!, limit: Int, offset: Int): BookResult!
    }
    
`;