import React from 'react';

class Navigation extends React.Component {
    constructor(props){
        super(props);
        console.log(this.props.user_id);
        this.state = {
            character_ids: []
        };
    }
    render(){
        let character_list = this.state.character_ids.map((current, index) => {
            return <a id={current} >Character {index} </a>
        });
        return character_list;
    }
    componentDidMount(){
        fetch("/getCharIds")
        .then((result) => result.json())
        .then((result) => {
            this.setState(this.state.character_ids);
        })
        .catch(function(error){
            console.error("unable to obtain character ids, please login.");
        });
    }
}

export default Navigation;