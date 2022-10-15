import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import './character-emblem.css';


class CharacterEmblem extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return(
            <Card className="emblem-container" onClick={() => this.props.onClick(this.props.position)}>
                <Card.Img src={ this.props.data.image } alt="Card image" />
                <Card.ImgOverlay className="emblem-overlay">
                   <div>
                        <p>{this.props.data.light}</p>
                        <p>{this.props.data.class}</p>
                   </div>
                   <div>
                        <p>{this.props.data.title}</p>
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