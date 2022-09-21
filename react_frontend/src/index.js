import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter , Routes, Route, useParams } from "react-router-dom";
//import Character from './character.js';
import LoginPage from './login.js';
import HomePage from './home.js';
const root = ReactDOM.createRoot(document.getElementById('root'));

function Home(){
  let { id } = useParams();
  return(<HomePage user_id={ id } />);
}

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes> 
        <Route exact path='/' element={ <a href="/api/oAuthRequest">Login</a> }/>
        <Route path='/login' element={<LoginPage test="Login" />} />
        <Route path='/user/:id' element={ <Home /> } />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
