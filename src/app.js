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

function GetProfile(){
    let endpoint = process.env.REACT_APP_API+"/profile";
    let components = ["Profiles", "ProfileInventories", "ProfileCurrencies", "Characters", "CharacterInventories", "CharacterRenderData", "CharacterEquipment", "ItemInstances"];
    let url = new URL(endpoint);
    url.search = new URLSearchParams({ components: components });
    return pingAPI(url);
}
class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            destinyAccountId: false,
            available: false,
            bungie_available: true,
            loaded: false
        };
    }
    componentDidMount(){
        return pingAPI(process.env.REACT_APP_API+"/")
        .then( (result) => {
            console.log("API is up and available.");
            this.setState({ 
                destinyAccountId: result.validated, 
                available: result.available,
                bungie_available: result.bungie_service,
                loaded: true
            })
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
        if(this.state.destinyAccountId !== prevState.destinyAccountId){
            return GetProfile()
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
        if(!this.state.destinyAccountId)
            return (<LoginScreen />);
        return <a>Hello</a>
        return(<Structure id={ this.state.destinyAccountId } data={ this.state.character_data } />);
    }
}

export default App;