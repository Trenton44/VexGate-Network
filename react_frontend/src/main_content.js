import React from 'react';

import './main_content.css';

import { Outlet} from "react-router-dom";

class MainContent extends React.Component {
    constructor(props){
        super(props);
        this.state = {};
    }
    render(){
        return (
            <div class="main_content">
                <Outlet />
            </div>
        );
    }
}

export default MainContent;