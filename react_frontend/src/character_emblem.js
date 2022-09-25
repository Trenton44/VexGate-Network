import React from 'react';

import "./character_emblem.css";

class CharacterEmblem extends React.Component {
    constructor(props){
        super(props);
        this.state = {};
    }
    render(){
        if(this.props.data.length !== 0){
            return(
                <div class="character_emblem" style={{ "background-image": "url("+this.props.data.emblemPath+")" }} >
                    <h1>{this.props.data}</h1>
                    <div>
                        <h1>Light</h1>
                        <h1>Race</h1>
                    </div>
                </div>
            );
        }
        else{
            return(<div></div>);
        }
        
    }
}

export default CharacterEmblem;