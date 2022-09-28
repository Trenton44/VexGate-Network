import React from 'react';

class Character extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            character_id: "",
            data: "",
        };
    }
    
    componentDidUpdate(prevProps, prevState, snapshot){
        if(prevProps.id != this.props.id){
            this.fetchCharacterData();
        }
        if(prevState.data !== this.state.data){
            console.log(this.state.data);
        }
    }
    componentDidMount(){
    }
    render(){
        return(<p>Hello</p>);
    }
}

export default Character;