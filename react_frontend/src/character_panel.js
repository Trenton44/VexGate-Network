import React from 'react';
class CharacterPanel extends React.Component {
    constructor(props){
        super(props);
        this.state = { id: null};
        this.setState({id: this.props.id});
    }
    componentDidMount(){}
    render(){
        return(<p>{this.state.id}#{this.props.id}</p>);
    }
}

export default CharacterPanel;