import React from 'react';
import ReactDOM from 'react-dom/client';
import './styles/variables.css';
import App from './App';
import { BusinessProvider, SearchProvider } from './objects/Context';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
    <BusinessProvider>
      <SearchProvider>
        <App />
      </SearchProvider>
    </BusinessProvider>
);
