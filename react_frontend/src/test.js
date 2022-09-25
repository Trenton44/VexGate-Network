import React from 'react';

class TestObject extends React.Component {
    constructor(props){
        super(props);
        this.state = {};
    }
    test = () => {
        let query = {
            d2_membership_id: "4611686018476659851",
            character_id: "2305843009360595823"
        };

        return fetch("/api/test?"+ new URLSearchParams(query).toString())
        .then( (result) => result.json() )
        .then( (result) => console.log(result) )
        .catch( (error) => {
            console.error(error);
            return error; 
        });
        
    }
    render(){
        return(<button onClick={this.test}>Prepare for Hell</button>);
    }
}

export default TestObject;