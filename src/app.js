import React from 'react';

import Structure from './structure.js';
import LoadingScreen from './loading_screen/loading.js';
import LoginScreen from './login_screen/login.js';


class App extends React.Component {
    constructor(props){
        super(props);
        this.state = {
            authenticated: true,
            loaded: true
        };
    }
    componentDidMount(){
        return;
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
        return <Structure id={ this.state.id } />
    }
}

export default App;