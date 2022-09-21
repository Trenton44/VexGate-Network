import React from 'react';
import ActionButton from './action_button.js';
class HomePage extends React.Component {
    constructor(props){
        super(props);
        this.state = {d2_account_data: {}};
    }
    componentDidMount(){
        fetch("/api/essentialPayload")
        .then( (result) => result.json() )
        .then( (result) => this.setState({d2_account_data: result}) )
        .catch(function(error){
            console.log(error);
        });
    }
    render(){

        return(
            <p>{ JSON.stringify(this.state.d2_account_data) }</p>
        );
    }
    
}
export default HomePage;