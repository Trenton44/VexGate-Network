import React from 'react';

class Character extends React.Component {
    constructor(props){
        super(props);
        this.state = {};
    }
    componentDidMount(){
        console.log(this.props.id);
    }
    render(){
        console.log(this.props.data);
        return(<p>{ JSON.stringify(this.props.data) }</p>);
    }
}

export default Character;