import React from 'react';

import CharacterEmblem from "./character_emblem.js";
class CharacterPanel extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            character_id: "",
            data: "",
        };
    }
    fetchCharacterData = () =>{
        let query = {
            d2_membership_id: window.location.href.split('/')[4],
            character_id: this.props.id
        };
        console.log("/api/characterData?"+ new URLSearchParams(query).toString());
        return fetch("/api/characterData?"+ new URLSearchParams(query).toString())
        .then( (result) => result.json() )
        .then( (result) => this.setState({data: result}) )
        .catch( (error) => {
            console.error(error);
            return error; 
        });
    }
    componentDidUpdate(prevProps, prevState, snapshot){
        if(prevProps.id != this.props.id){
            console.log("the id has changed for this compoent.");
            console.log("old: "+prevProps.id+" new: "+this.props.id);
            this.fetchCharacterData();
        }
        if(prevState.data !== this.state.data){
            console.log("character data has been updated.");
            console.log("NEW: ");
            console.log(this.state.data);
        }
    }
    componentDidMount(){
    }
    render(){
        return(
            <> <CharacterEmblem data={""} /> </>
        );
    }
}

export default CharacterPanel;