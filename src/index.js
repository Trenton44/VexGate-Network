import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter , Routes, Route, useParams } from "react-router-dom";
import LoginPage from './login_page.js';
import UserPage from './user.js';

import CharacterEmblem from './character_emblem.js';
import 'bootstrap/dist/css/bootstrap.min.css';
const root = ReactDOM.createRoot(document.getElementById('root'));

function RenderUserPage(){
  let { id } = useParams();
  return <UserPage id={id} />
}

root.render(
<div>
  <p>Hello There!</p>
  <a href="https://75.101.183.245:3000/api/oAuthRequest">Login to Service</a>
</div>
);
/*
<HashRouter>
      <Routes> 
        <Route path="/">
          <Route path="login" element={ <LoginPage /> }/>
          <Route path="user/:id" element={ <RenderUserPage /> } />
        </Route>
      </Routes>
    </HashRouter>
*/