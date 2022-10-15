import React from 'react';

import { Modal, Spinner } from 'react-bootstrap';

import './loading.css';

class LoadingScreen extends React.Component {
    constructor(props){
        super(props);
    }
    render(){
        return(
            <Modal.Dialog id="Modal-top" centered>
                <Spinner animation="border" role="status">
                    <span className="visually-hidden"> Loading... </span>
                </Spinner>
                <Modal.Body> Loading User Data... </Modal.Body>
            </Modal.Dialog>
        );
    }
}

export default LoadingScreen;