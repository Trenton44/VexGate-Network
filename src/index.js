import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter , Routes, Route, useParams } from "react-router-dom";
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
  <BrowserRouter>
      <Routes> 
        <Route path="/">
          <Route path="login" element={ <LoginPage /> }/>
          <Route path="user/:id" element={ <RenderUserPage /> } />
        </Route>
      </Routes>
    </BrowserRouter>
);
/*

*/