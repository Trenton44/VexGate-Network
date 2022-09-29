import React from 'react';

class LoginScreen extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return( <a href={ process.env.API_SERVER+"/api/login"}>Login</a> ); 
    }
}

export default LoginScreen;