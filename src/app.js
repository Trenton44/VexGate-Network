import React from 'react';

import Structure from './structure.js';
import LoadingScreen from './loading-screen/loading.js';
import LoginScreen from './login-screen/login.js';

//function runs on first component load, works as a health checker and initial cookie setter.
function pingAPI(path){
    return fetch(path, { credentials: "include" })
    .then( (result) => {
        if(!result.ok){ return Promise.reject(result); }
        return result.json();
    })
    .catch( (error) => { return Promise.reject(error); });
}
class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            authenticated: false,
            available: true,
            loaded: false
        };
    }
    componentDidMount(){
        return pingAPI(process.env.REACT_APP_API+"/")
        .then( (result) => {
            console.log("API is up and available.");
            return pingAPI(process.env.REACT_APP_API+"/authvalidated")
            .then( (result) => this.setState({ authenticated: true, id: result.d2_membership_id }))
            .catch( (error) => {
                console.log("User is not authenticated with the API.");
                this.setState({ loaded: true });
            });
        })
        .catch( (error) => {
            console.log("API Server is Currently unavailable. Reason: ");
            console.log(error);
            this.setState({loaded: true, available: false });
            return error;
        })

    }
    componentDidUpdate(prevProps, prevState, snapshot){
        console.log(this.state);
        if(this.state.id !== prevState.id){
            return pingAPI(process.env.REACT_APP_API+"/profileData?"+new URLSearchParams({ d2_membership_id: this.state.id }).toString())
            .then( (result) => {
                console.log("User data retrieval successful.");
                this.setState({
                    loaded: true,
                    character_data: result.characters,
                    profile_data: result.profile_data
                });
            })
            .catch( (error) => {
                console.log(error);
                this.setState({ loaded: true });
            });
        }
    }
    render(){
        if(!this.state.available)
            return (<p>The API Server is Currently Unavailable</p>);
        if(!this.state.loaded)
            return (<LoadingScreen />);
        if(!this.state.authenticated)
            return (<LoginScreen />);
        return(<Structure id={ this.state.id } />);
    }
}

export default App;