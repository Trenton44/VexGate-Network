import React from 'react';
import { Card, Button } from 'react-bootstrap';

import './login.css'
class LoginScreen extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return(
            <div className='login-screen'>
                <Card className="login-card card text-white bg-dark mb-3">
                    <Card.Header> 
                        <Card.Title> Authorize Access to Bungie.Net  </Card.Title>
                    </Card.Header>
                    <Card.Body>
                        <Card.Text> Please Authorize with Bungie.net to continue.</Card.Text>
                        <Button href={process.env.REACT_APP_API+"/login"} variant="primary">Login to Bungie.net</Button>
                    </Card.Body>
                </Card>
            </div>
        ); 
    }
}
//
export default LoginScreen;