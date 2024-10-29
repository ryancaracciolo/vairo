import React, { createContext, useState } from 'react';

// Create CurrentBusiness Context
export const BusinessContext = createContext();
export const BusinessProvider = ({ children }) => {
    const [business, setBusiness] = useState({id:'', name:'', logo:'', desc:'', owner:'', industry:'', address:'', email:'', phone:'', website:''});
  
    return (
      <BusinessContext.Provider value={{ business, setBusiness }}>
        {children}
      </BusinessContext.Provider>
    );
  };

// Create Search Context
export const SearchContext = createContext();
export const SearchProvider = ({ children }) => {
    const [searchText, setSearchText] = useState('');
  
    return (
      <SearchContext.Provider value={{ searchText, setSearchText }}>
        {children}
      </SearchContext.Provider>
    );
  };