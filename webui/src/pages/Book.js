import {Button, Card, Skeleton} from "antd";
import {useLocation} from "react-router-dom";
import {LeftOutlined, RightOutlined} from '@ant-design/icons';
import {gql, useQuery} from '@apollo/client';
import './Book.css'
import {useEffect, useState} from "react";
import PageContent from "../components/page_content";
import {token} from '../client/apollo';
import {useNavigate} from "react-router-dom";

const GET_BOOK = gql`
    query GetBook($bookUid: String!, $limit: Int, $offset: Int) {
      book(bookUID: $bookUid, limit: $limit, offset: $offset) {
        ... on Book {
          title
          cover
          author
          numPages
          pages {   
            pageIndex
            content
            tokens {
              position
              value
            }
          }
        }
      }
    }`;

const Book = () => {
    const location = useLocation();
    const [currentPage, setCurrentPage] = useState(1);
    const [pages, setPages] = useState([]);
    const [currentPageData, setCurrentPageData] = useState([]);
    const book_uid = location.pathname.split('/book/')[1];
    const {loading, error, data, fetchMore} = useQuery(GET_BOOK, {variables: {bookUid: book_uid}});
    // console.log({loading, data})
    let book = null;
    const startIndex = (currentPage - 1) * 2;
    const endIndex = startIndex + 2;
    const Navigate = useNavigate();

    if (!loading && !error) {
        book = data.book;
    }
    useEffect(() => {
        if (error) {
            console.error(error)
        }

        if (!loading && !error) {
            setPages(book.pages);
            setCurrentPageData(pages.slice(startIndex, endIndex));
        }
    }, [loading, error, data, pages, startIndex, endIndex, book])
    const nextPage = () => {
        let new_page = currentPage + 1;
        setCurrentPage(new_page);
        let lastPage = ((new_page - 1) * 2) + 2;
        console.log(pages.length - 3)
        // if (lastPage >= (pages.length -2)){
        //     console.log("fetching more")
        // }
        if (lastPage >= (pages.length - 2)) {
            console.log("fetching more")
            fetchMore({
                variables: {
                    limit: pages.length + 5,
                },
                updateQuery: (prev, {fetchMoreResult}) => {
                    if (!fetchMoreResult) return prev;
                    setPages(fetchMoreResult.book.pages);
                    setCurrentPageData(pages.slice(startIndex, endIndex));
                    return fetchMoreResult;
                }
            })
        }
        console.log({lastPage, pages})
    }


    function onTokenClick(selected_token) {
        token(selected_token)
        Navigate('/token')
    }

    const previousPage = () => {
        let new_page = currentPage - 1;
        setCurrentPage(new_page);
    }
    let LeftPage = currentPageData[0];
    let RightPage = currentPageData[1];
    return (
        <div className="book-container">
            <Card className="book-left-page"
            >
                <Skeleton
                    loading={loading}
                    active
                    paragraph={{rows: 4, width: [500, 100]}}
                >
                    {LeftPage ?
                        LeftPage.tokens.map((token) => {
                            return <div style={{display: "inline-block"}}>
                                <PageContent token={token} full_content={LeftPage.content} onClick={onTokenClick}/>
                            </div>
                            // return PageContent(token, LeftPage.content, onTokenClick)
                        }) : null}
                </Skeleton>

                {(currentPageData[0] && currentPageData[0].pageIndex > 0) &&
                    <Button style={{
                        position: 'absolute',
                        bottom: 0,
                        left: 0,
                        margin: '1rem',
                        alignContent: 'center',
                        justifyContent: 'center',
                    }} onClick={previousPage}>
                        <LeftOutlined/>
                        Previous Page
                    </Button>
                }

            </Card>
            <Card className="book-right-page">
                <Skeleton
                    loading={loading}
                    active
                    paragraph={{rows: 4, width: [500, 100]}}
                >
                    {RightPage ? RightPage.tokens.map((token) => {
                        return <div style={{display: "inline-block"}}>
                            <PageContent token={token} full_content={RightPage.content} onClick={onTokenClick}/>
                        </div>
                    }) : null}
                </Skeleton>
                {(book && (endIndex < book.numPages)) ?
                    <Button style={{
                        position: 'absolute',
                        bottom: 0,
                        right: 0,
                        margin: '1rem',
                        alignContent: 'center',
                        justifyContent: 'center',
                    }} onClick={nextPage}>
                        Next Page
                        <RightOutlined/>
                    </Button> : null
                }
            </Card>
        </div>
    );
}


export default Book;