import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter , Routes, Route, useParams } from "react-router-dom";
//import Character from './character.js';
import LoginPage from './login.js';

const root = ReactDOM.createRoot(document.getElementById('root'));


const Final = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<LoginPage test="beans" />}/>
        <Route path='/login' element={<LoginPage test="bans" />}/>
      </Routes>
    </BrowserRouter>
  );
}


root.render(
  <React.StrictMode>
    <h1>Hello World!</h1>
    <Final />
  </React.StrictMode>
);
