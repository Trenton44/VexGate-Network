import React from 'react';
import { Container, Row, Col, Tabs, Tab, Button } from 'react-bootstrap';
import './structure.css';
import Character from './character/character.js';
import Vault from './vault/vault.js';
import EquipmentGroup from './equipment-group/equipment-group';
import CharacterCarousel from './character-carousel/character-carousel';

class Structure extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            temp_group_count: 9,
            degree_spread: 0,
        };
    }
    render(){
        return(
            <Container className="characters-grid-container" fluid>
                <Row className="characters-grid-row">
                    <Col><EquipmentGroup /></Col>
                    <Col><EquipmentGroup /></Col>
                    <Col><EquipmentGroup /></Col>
                </Row>
                <Row className="characters-grid-row">
                    <Col><EquipmentGroup /></Col>
                    <Col>
                        <CharacterCarousel />
                    </Col>
                    <Col><EquipmentGroup /></Col>
                </Row>
                <Row className="characters-grid-row">
                    <Col><EquipmentGroup /></Col>
                    <Col><EquipmentGroup /></Col>
                    <Col><EquipmentGroup /></Col>
                </Row>
            </Container>
        );
    }
}

export default Structure;

/*
<Container fluid>
    <Navigation></Navigation>
    <Row>
        <Col style={{"maxWidth": "50%"}}>
        <Tabs className='justify-content-center'>
            <Tab eventKey="character-1-tab" title="character-1"> 
                <Character />
            </Tab>
            <Tab eventKey="character-2-tab" title="character-2"> 
                <Character />
            </Tab>
            <Tab eventKey="character-3-tab" title="character-3"> 
                <Character />
            </Tab>
        </Tabs>
        </Col>
    </Row>
</Container>
*/