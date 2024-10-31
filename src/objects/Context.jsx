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

// Create ActiveMenuIndex Context
export const ActiveMenuIndexContext = createContext(0);
export const ActiveMenuIndexProvider = ({ children }) => {
    const [activeMenuIndex, setActiveMenuIndex] = useState(0);
    return (
        <ActiveMenuIndexContext.Provider value={{ activeMenuIndex, setActiveMenuIndex }}>
            {children}
        </ActiveMenuIndexContext.Provider>
    );
};

// Create User Context
export const UserContext = createContext();
export const UserProvider = ({ children }) => {
    const [user, setUser] = useState({id: '', name: '', email: ''});
  
    return (
      <UserContext.Provider value={{ user, setUser }}>
        {children}
      </UserContext.Provider>
    );
};

// Create Combined Context Provider
export const CombinedProvider = ({ children }) => (
    <BusinessProvider>
        <SearchProvider>
            <ActiveMenuIndexProvider>
                <UserProvider>
                    {children}
                </UserProvider>
            </ActiveMenuIndexProvider>
        </SearchProvider>
    </BusinessProvider>
);
