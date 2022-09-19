import React from 'react';

class Character extends React.Component {
    constructor(props){
        super(props);
        this.state = {};
    }
    render(){
        return(<div id={this.props.id}></div>);
    }
}
export default Character;