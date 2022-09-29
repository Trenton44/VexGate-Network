import React from 'react';

import User from './user.js';
import LoadingScreen from './loading.js';
import LoginScreen from './login.js';


class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            authenticated: false,
            loaded: false
        };
    }
    componentDidMount(){
        fetch(process.env.API_SERVER+"/api/authvalidated")
        .then( (result) => result.json() )
        .then( (result) => this.setState({loaded: true, authenticated: true, id: result}) )
        .catch( (error) => {
            console.log(error);
            this.setState({ loaded: true });
        });
    }
    render(){
        if(!this.state.loaded)
            return <LoadingScreen />
        if(!this.state.authenticated)
            return <LoginScreen />
        return <User id={ this.state.id } />
    }
}

export default App;