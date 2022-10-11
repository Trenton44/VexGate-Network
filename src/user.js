import React from 'react';

import Character from './character';
import { Tabs, Tab, Nav, Row, Col, Card, Container } from 'react-bootstrap';
import CharacterEmblem from './character_emblem.js';


class UserPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            id: window.location.href.split('/')[4],
            data_loaded: false,
            character_data: {}
        };
    }
    fetchProfileData = () =>{
        let query = {
            d2_membership_id: window.location.href.split('/')[4]
        };
        return fetch(process.env.REACT_APP_API+"/profileData?"+ new URLSearchParams(query).toString(),{ credentials: "include" })
        .then( (result) => result.json() )
        .then( (result) => {
            this.setState({ character_data: result.characters, profile_data: result.profile_data, data_loaded: true });
        } )
        .catch( (error) => {
            console.error(error);
            return error; 
        });
    }
    componentDidMount(){
        this.fetchProfileData();
    }
    render(){
        let list = Object.keys(this.state.character_data);
        if(!this.state.data_loaded){
            return (<p>Put a loading screen here at some point.</p>);
        }
        return(
            <>
            <Container fluid>
                <Row style={{width: "40%"}}>
                    <Tabs variant="pills" justify>
                        <Tab eventKey="character-1" title="character-1">  <Character id={list[0]} data={ this.state.character_data[list[0]] }> </Character> </Tab>
                           
                        <Tab eventKey="character-2" title="character-2"> <Character id={list[1]} data={ this.state.character_data[list[1]] }> </Character> </Tab>
                            
                        <Tab eventKey="character-3" title="character-3"> <Character id={list[2]} data={ this.state.character_data[list[2]] }> </Character> </Tab>
                            
                    </Tabs>
                </Row>

            </Container>
            </>
        );
    }
    
}

/*
<Tab.Container variant="fluid-container" defaultActiveKey="profile" id="uncontrolled-tab-example" >
                <Row>
                    <Nav variant="pills">
                        <Nav.Item eventKey="character-1" title="character-1"> </Nav.Item>
                        <Nav.Item eventKey="character-2" title="character-2"> </Nav.Item>
                        <Nav.Item eventKey="character-3" title="character-3"> </Nav.Item>
                    </Nav>
                    <Col>
                        <Tab.Content>
                            <Tab.Pane eventKey="character-1">
                                <CharacterTab id={ this.state.character_ids[0] } />
                            </Tab.Pane>
                            <Tab.Pane eventKey="character-2">
                                <CharacterTab id={ this.state.character_ids[1] } />
                            </Tab.Pane>
                            <Tab.Pane eventKey="character-3">
                                <CharacterTab id={ this.state.character_ids[2] } />
                            </Tab.Pane>
                        </Tab.Content>
                    </Col>
                </Row>
            </Tab.Container>












 <Nav.Link eventKey="character-1">  </Nav.Link>
<Nav.Link eventKey="character-2">  </Nav.Link>
<Nav.Link eventKey="character-3"> <CharacterEmblem /> </Nav.Link>


<Tabs defaultActiveKey="active-character" id="character-tabs" className="mb-3">
    <CharacterTab id={this.state.character_ids[0]} />
    <CharacterTab id={this.state.character_ids[1]} />
    <CharacterTab id={this.state.character_ids[2]} />
</Tabs>
*/
export default UserPage;