import React from 'react';
import './character-carousel.css';
import CharacterEmblem from '../character-emblem/character-emblem.js';

class CharacterCarousel extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            characters: this.props.characters
        }
    }
    changeCharacter = (position) => {
        console.log("User wants to change characters.");
        console.log("position: "+position);
        let temp_array = this.state.characters;
        if(position == 0)
            temp_array.unshift(temp_array.pop());
        else if(position == 2)
            temp_array.push(temp_array.shift());
        this.setState({ characters: temp_array });
    }
    render(){
        if(!this.state.characters)
            return <div style={{width: "1em", height: "1em" }}></div>
        let character_list = this.state.characters.map( (current, index) => { 
            return (<CharacterEmblem key={current.class} position={index} data={current} onClick={this.changeCharacter} />); 
        });
        return(
            <div className='carousel-container'>
                <div className='carousel-wrapper'>
                    <div className='carousel-content'>
                        { character_list }
                    </div>
                </div>
            </div>
        );
    }
}
export default CharacterCarousel;