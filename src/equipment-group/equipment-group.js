import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

import './equipment-group.css';

class EquipmentGroup extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return(
            <Container className="equipment-grid-container">
                <Row className="equipment-grid-row">
                    <Col>1</Col>
                    <Col>2</Col>
                    <Col>3</Col>
                </Row>
                <Row className="equipment-grid-row">
                    <Col>4</Col>
                    <Col>5</Col>
                    <Col>6</Col>
                </Row>
                <Row className="equipment-grid-row">
                    <Col>7</Col>
                    <Col>8</Col>
                    <Col>9</Col>
                </Row>
            </Container>
        );
    }
}
export default EquipmentGroup;