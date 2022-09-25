import React from 'react';

import CharacterPanel from './character_panel';
import TestObject from './test.js';

class UserPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            character_ids: [null, null, null],
            id: window.location.href.split('/')[4]
        };
    }
    componentDidMount(){
        //api endpoint should return a list of character ids.
        console.log("UserPanel: fetching c ids.");
        fetch("/api/characterIds?id="+this.state.id)
        .then( (result) => result.json() )
        .then( (result) => {
            console.log(result);
            this.setState({character_ids: result});
        })
        .catch( (error) => console.log(error));
    }
    render(){
        console.log(this.state.character_ids);
        return(
            <>
                
                <TestObject />
            </>
        );
    }
    
}
/*
<CharacterPanel id={this.state.character_ids[0]} />
<CharacterPanel id={this.state.character_ids[1]} />
<CharacterPanel id={this.state.character_ids[2]} /> 
*/
export default UserPage;