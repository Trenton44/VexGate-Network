import React from 'react';

import CharacterPanel from './character_panel';
import './user.css';

class UserPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            character_ids: [null, null, null],
            d2_id: window.location.href.split('/')[4]
        };
    }
    componentDidMount(){
        //api endpoint should return a list of character ids.
        fetch("/api/getCharacterIds?d2_id="+this.state.d2_id)
        .then( (result) => result.json() )
        .then( (result) => {
            console.log(result);
            this.setState({character_ids: result});
            console.log("completed.");
            console.log(this.state.character_ids);
        })
        .catch( (error) => console.log(error));
    }
    render(){
        return(
            <div>
                <CharacterPanel id={this.state.character_ids[0]} />
                <CharacterPanel id={this.state.character_ids[1]} />
                <CharacterPanel id={this.state.character_ids[2]} />
            </div>
            
        );
    }
    
}
export default UserPage;