import React from 'react';

class LoginScreen extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return( <a href={ process.env.REACT_APP_API+"/login" } >Login</a> ); 
    }
}

export default LoginScreen;