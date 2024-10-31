import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/variables.css';
import App from './App';
import { CombinedProvider } from './objects/Context';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <CombinedProvider>
        <App />
    </CombinedProvider>
);
