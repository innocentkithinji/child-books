import React from 'react';
import {Row, Skeleton, Typography} from 'antd';
import {gql, useQuery} from '@apollo/client';
import GridCard from "../components/GridCard";
import {useNavigate} from "react-router-dom";


const {Title} = Typography;


const GET_BOOKS = gql`
    query GetBooks {
        books {
            ... on BookList {
            books {
                uid
                title
                cover
                author
            }
            }
        }
    }
`


const Home = () => {
    const {loading, data} = useQuery(GET_BOOKS);
    const Navigate = useNavigate();
    return (
        <div style={{
            padding: '10px 50px',
            justifyContent: 'start',
            alignItems: 'start',
            width: '100%',
        }}>
            <div style={{textAlign: "start"}}>
                <Title level={3}>All Books:</Title>
                <Skeleton
                    loading={loading}
                    active
                    avatar={{shape: 'square', size: 'large'}}
                    title={{width: 300}}
                    paragraph={{rows: 4, width: [500, 100]}}
                >
                    <Row gutter={{xs: 6, sm: 12, md: 24, lg: 30}}>
                        {data?.books?.books?.map((book) => (
                            <GridCard key={book.uid} book={book} onclick={function () {
                                Navigate(`/book/${book.uid}`);
                            }}/>
                        ))}
                    </Row>
                </Skeleton>
            </div>

        </div>
    );
};


export default Home;