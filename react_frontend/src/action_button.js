import React from 'react';

class ActionButton extends React.Component {
    constructor(props){
        super(props);
        this.state = { api_request_results: "" };
    }
    apiRequest = (e) => {
        let path = this.props.path; //apparently "this" is undefined here. not sure why.
        console.log(path);
        fetch(path+"?"+ new URLSearchParams({membership_id: window.location.pathname.split("/")[1] }))
        .then((results) => results.json())
        .then((results) => this.setState({api_request_results: results}));
    }
    render(){
        return(
            <div>
                <button onClick={this.apiRequest}>{this.props.path}</button>
                <p>{this.state.api_request_results.toString()}</p>
            </div>
            
        ); 
    }
}
export default ActionButton;