import fs from 'fs';
import path from 'path';

const dirPath = './resources';

export const resolvers = {
    Query: {
        books: () => {
            try {

                const files = fs.readdirSync(dirPath).filter(file => path.extname(file) === '.json');

                const read_books = files.map(file => {
                    const filePath = path.join(dirPath, file);
                    try {
                        const content = fs.readFileSync(filePath, 'utf8');
                        let book = JSON.parse(content);
                        book.numPages = book.pages.length;
                        if (book.pages.length > 5) {
                            book.has_next_page = true;
                            book.pages = book.pages.slice(0, 5);
                        } else {
                            book.has_next_page = false;
                        }
                        book.uid = file.split('.')[0];
                        return book;
                    } catch (err) {
                        console.error(`Error reading or parsing ${file}: ${err.message}`);
                        return null;
                    }
                }).filter(book => book);

                return {books: read_books};
            } catch (err) {
                console.error(`Error reading or parsing ${dirPath}: ${err.message}`);
                return {message: err.message, code: 500};
            }

        },

        book: (_, {bookUID, limit, offset}) => {
            if (!bookUID) {
                throw new error(`BookUID is required`);
            }
            if (!limit) {
                limit = 5;
            }
            if (!offset) {
                offset = 0;
            }
            try {
                const file = `${bookUID}.json`;
                const filePath = path.join(dirPath, file);
                let book = JSON.parse(fs.readFileSync(filePath, 'utf8'));;
                let pages = book.pages;
                book.numPages = pages.length;
                if ((offset + limit) > book.pages.length) {
                    if (offset >= book.pages.length) {
                        throw new Error(`Offset ${offset} is greater than the number of pages ${book.pages.length}`);
                    }
                    if (limit > book.pages.length) {
                        limit = book.pages.length;
                    }
                }
                if (limit) {
                    console.log(`Offset: ${offset}, Limit: ${limit}`)
                    let end = offset + limit;
                    if (end > pages.length) {
                        end = pages.length;
                    }
                    book.pages = pages.slice(offset, end);
                }
                book.has_next_page = book.pages[book.pages.length - 1].pageIndex < pages.length - 1;

                book.uid = bookUID;

                return book;
            } catch (error) {
                console.error(`Error reading for ${bookUID}: ${error.message}`);
                return {message: error.message, code: 500};
            }

        }
    },
    BooksResult: {
        __resolveType(obj) {
            if (obj.books) {
                return 'BookList';
            }
            if (obj.message) {
                return 'Error';
            }
            return null;
        },
    },
    BookResult: {
        __resolveType(obj) {
            if (obj.title) {
                return 'Book';
            }
            if (obj.message) {
                return 'Error';
            }
            return null;
        },
    }
};
