import React from 'react';
import './App.css';

function getTitle(title) {
    return title;
}

function App() {
    return (
        <>
            <h1>Hello {getTitle('React')}</h1>
            <label htmlFor="search">Search: </label>
            <input id="search" type="text" />
        </>
    );
}

export default App;
