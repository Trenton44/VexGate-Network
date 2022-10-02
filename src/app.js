import React from 'react';

import Structure from './structure.js';
import LoadingScreen from './loading_screen/loading.js';
import LoginScreen from './login_screen/login.js';


class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            authenticated: false,
            loaded: false
        };
    }
    componentDidMount(){
        return fetch(process.env.REACT_APP_API+"/api/authvalidated")
        .then( (result) => result.json() )
        .then( (result) => {
            if(!result.ok)
                return Promise.reject(result);
            this.setState({ authenticated: true, id: result});
        })
        .catch( (error) => {
            console.log(error);
            this.setState({ loaded: true });
        });
    }
    componentDidUpdate(prevProps, prevState, snapshot){
        if(this.state.id !== prevState.id){
            return fetch(process.env.REACT_APP_API+"/api/profileData?"+new URLSearchParams({ d2_membership_id: this.state.id }).toString())
            .then( (result) => result.json() )
            .then( (result) => {
                console.log(result);
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
        if(!this.state.loaded)
            return (<LoadingScreen />);
        if(!this.state.authenticated)
            return (<LoginScreen />);
        return(<Structure id={ this.state.id } />);
    }
}

export default App;