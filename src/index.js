import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/variables.css';
import { BusinessProvider, SearchProvider } from './objects/Context';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BusinessProvider>
      <SearchProvider>
        <App />
      </SearchProvider>
    </BusinessProvider>
);
