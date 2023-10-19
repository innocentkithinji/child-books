import { createTestClient } from "apollo-server-testing";
import { ApolloServer, gql } from "apollo-server";
import {resolvers} from "../../src/resolvers.js";
import {typeDefs} from "../../src/schema.js";

const {query} = createTestClient(new ApolloServer({
    typeDefs,
    resolvers
}));


describe("Test the books query", () => {
    it("Should return two books", async () => {
        const GET_BOOKS = gql`
            query GetBooks {
                books {
                    ... on BookList {
                        books{
                            uid,
                            title,
                            author
                        }
                    }
                }
            }
        `;

        const response = await query({ query: GET_BOOKS });
        expect(response.data.books.books.length).toEqual(2);
    });

    it("Should return books", async () => {
        const GET_BOOKS = gql`
            query GetBooks {
                books {
                    ... on BookList {
                        books{
                            uid,
                            title,
                            author
                        }
                    }
                }
            }
        `;

        const response = await query({ query: GET_BOOKS });
        expect(response.data.books.books[0].author).toEqual("Leo Lionni");
    });


    it("Books should have uid, title, author, 5 pages and has_next_page", async () => {
        const GET_BOOKS = gql`
            query GetBooks {
                books {
                    ... on BookList {
                        books{
                            uid,
                            title,
                            author
                            pages{
                                pageIndex,
                                content
                            }
                            has_next_page
                        }
                    }
                }
            }
        `;

        const response = await query({ query: GET_BOOKS });
        response.data.books.books.forEach(book => {
            expect(book.uid).toBeDefined();
            expect(book.title).toBeDefined();
            expect(book.author).toBeDefined();
            expect(book.pages.length).toBe(5);
            expect(book.has_next_page).toBeTruthy();
        });
    });
});
 