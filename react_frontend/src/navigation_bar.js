import React from 'react';
import './navigation_bar.css'
class NavigationBar extends React.Component {
    constructor(props){
        super(props);
        this.state = {};
    }
    componentDidMount(){

    }
    render(){
        return(
            <div id="test">
                <button>Inventory</button>
                <button>Profile</button>
                <button>3D</button>
                <button>Stats</button>
            </div>
        );
    }
}

export default NavigationBar;