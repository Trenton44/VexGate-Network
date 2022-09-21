import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter , Routes, Route, useParams } from "react-router-dom";
//import Character from './character.js';
import LoginPage from './login.js';
import UserPage from './user.js';
import NavigationBar from './navigation_bar';

import './index.css';

const root = ReactDOM.createRoot(document.getElementById('root'));

function Home(){
  let { destiny_membership_id } = useParams();
  return(<UserPage destiny_membership_id={ destiny_membership_id } />);
}

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes> 
        <Route exact path='/' element={ <a href="/api/oAuthRequest">Login</a> }/>
        <Route path='/login' element={<LoginPage test="Login" />} /> 
        <Route path='/user/' element={ <NavigationBar /> } />
        <Route path='/user/:id' element={ <Home /> } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
