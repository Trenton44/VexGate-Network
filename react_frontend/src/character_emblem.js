import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';



class CharacterEmblem extends React.Component {
    constructor(props){
        super(props);
        this.state= {
            image: "",
            class: "",
            title: "",
            light: "",
        }
    }
    fetchCharacterData = () =>{
        let query = {
            d2_membership_id: window.location.href.split('/')[4],
            character_id: this.props.id
        };
        console.log("/api/characterData?"+ new URLSearchParams(query).toString());
        return fetch("/api/characterData?"+ new URLSearchParams(query).toString())
        .then( (result) => result.json() )
        .then( (result) => {
            result = result.character;
            console.log(result);
            this.setState({
                image: result.emblem_data.background_path,
                class: result.class_data.displayProperties.name,
                light: result.light
            });
            if(result.title_data)
                this.setState({ title: result.title_data.displayProperties.name });
        })
        .catch( (error) => {
            console.error(error);
            return error; 
        });
    }
    componentDidMount(){
        this.fetchCharacterData();
    }
    render(){
        return(
            <Card style={{width: "15em"}}>
                <Card.Img src={ this.state.image } alt="Card image" />
                <Card.ImgOverlay style={{"padding-top": 0, "padding-bottom": 0, right: 0, top: 0, display: "flex", "flex-direction": "column", "justify-content": "right"}}>
                   <div style={{"display": "flex", "flex-direction": "row", "justify-content": "right"}}>
                    <p>H</p>
                    <p>H</p>
                   </div>
                   <div style={{"display": "flex", "flex-direction": "row", "justify-content": "right"}}>
                   <p>H</p>
                   </div>
                   
                </Card.ImgOverlay>
            </Card>
        );
    }
}
/* 
<Row style={{"justify-content": "right", width: "30%"}}>
                        <Card.Text style={{margin: 0}}> { this.state.light } </Card.Text>
                        <Card.Title style={{margin: 0}}> { this.state.class } </Card.Title>
                    </Row>
                    <Card.Text style={{margin: 0}}> { this.state.title } </Card.Text>


                     <Card.Text style={{"text-align": "right"}}>Hello</Card.Text>
*/
export default CharacterEmblem;