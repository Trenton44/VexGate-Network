import React from 'react';

function LoginPage(props){
    console.log("login accessed.");
    return (
        <a href="/api/oAuthRequest">Login</a>
    );
}

export default LoginPage;