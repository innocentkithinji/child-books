import {Card, Col} from "antd";
import React from "react";

const {Meta} = Card;

const GridCard = ({book, onclick}) => {
    return (
        <Col className="gutter-row" span={6}>
            <Card
                hoverable
                style={{width: 240}}
                cover={
                    <img
                        alt={book.title}
                        src={book.cover}
                        style={{height: 300}}
                    />
                }
                onClick={onclick}
            >
                <Meta title={book.title} description={book.author} />
            </Card>
        </Col>
    );
}


export default GridCard;