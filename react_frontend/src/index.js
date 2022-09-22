import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter , Routes, Route, useParams } from "react-router-dom";
//import Character from './character.js';
import LoginPage from './login.js';
import UserPage from './user.js';
import NavigationBar from './navigation';
import MainContent from './main_content.js';


const root = ReactDOM.createRoot(document.getElementById('root'));

function RenderUserPage(){
  let { id } = useParams();
  return <UserPage id={id} />
}

root.render(
  <React.StrictMode>
    <BrowserRouter>
    <NavigationBar />
      <Routes> 
        <Route path="/" element = {<MainContent />} >
          <Route path="login" element={ <LoginPage /> }/>
          <Route path="user/:id" element={ <RenderUserPage /> } />
        </Route>
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
