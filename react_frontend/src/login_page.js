import React from 'react';

import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import CRow from 'react-bootstrap/Row';
import CColumn from 'react-bootstrap/Col';
import Button from 'react-bootstrap/Button';

class LoginPage extends React.Component {
    constructor(props){
        super(props);
        this.state = {};
    }
    render(){
        return(<a href="/api/oAuthRequest">Login</a>);
    }
}

export default LoginPage;