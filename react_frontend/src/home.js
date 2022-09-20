import React from 'react';
import ActionButton from './action_button.js';
class HomePage extends React.Component {
    constructor(props){
        super(props);
        console.log(this.props.user_id);
        this.state = {};
    }
    render(){
        return(
            <div>
                <ActionButton path="/api/getCredentialTypes" />
                <ActionButton path="/api/getLinkedProfiles" />
            </div>
        );
    }
    
}
export default HomePage;