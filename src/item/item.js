import React from 'react';

import { Card, Container, Row, Col } from 'react-bootstrap';

import "./item.css";

class Item extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            src: "",
        };
    }
    render() {
        return(
            <Card id="item-icon" className="ratio ratio-1x1">
                <Card.Img src={ this.state.src } />
                <Card.ImgOverlay className="item-overlay">
                    <Container className="item-overlay-corners">
                        <Row>
                            <Col>
                            <Card.Text> {} </Card.Text>
                            </Col>
                            <Col>
                            <Card.Text> {} </Card.Text>
                            </Col>
                        </Row>
                        <Row>
                            <Col>
                            <Card.Text> {} </Card.Text>
                            </Col>
                            <Col>
                            <Card.Text> {} </Card.Text>
                            </Col>
                        </Row>
                    </Container>
                </Card.ImgOverlay>
            </Card>
        );
    }
}

export default Item;