import React from 'react';
import { Container, Row, Col, Tabs, Tab, Button } from 'react-bootstrap';
import './structure.css';
import Character from './character/character.js';
import Vault from './vault/vault.js';
class Structure extends React.Component {
    constructor(props){
        super(props);
        this.state = {};
    }
    render(){
        return(
            <>
            <Container fluid>
                <Row>
                    <p> Top Level </p>
                </Row>
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
            </>
        );
    }
}

export default Structure;