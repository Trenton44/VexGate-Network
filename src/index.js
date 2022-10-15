import React from 'react';
import ReactDOM from 'react-dom/client';
import { HashRouter , Routes, Route, useParams } from "react-router-dom";
import App from './app.js';
import Navigation from './navigation-bar/navigation.js';

import 'bootstrap/dist/css/bootstrap.min.css';
const root = ReactDOM.createRoot(document.getElementById('root'));

root.render(
    <>
        <Navigation />
        <App />
    </>
);
