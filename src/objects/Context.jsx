import React, { createContext, useState, useEffect } from 'react';

// Create CurrentWorkspace Context
export const WorkspaceContext = createContext();
export const WorkspaceProvider = ({ children }) => {
    const [workspace, setWorkspace] = useState({id:'', name:''});
  
    return (
      <WorkspaceContext.Provider value={{ workspace, setWorkspace }}>
        {children}
      </WorkspaceContext.Provider>
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
    const [user, setUser] = useState({id: '', name: '', email: '', workspaceId: '', workspaceName: ''});
  
    return (
      <UserContext.Provider value={{ user, setUser }}>
        {children}
      </UserContext.Provider>
    );
};

// Create Combined Context Provider
export const CombinedProvider = ({ children }) => (
    <WorkspaceProvider>
        <SearchProvider>
            <ActiveMenuIndexProvider>
                <UserProvider>
                    {children}
                </UserProvider>
            </ActiveMenuIndexProvider>
        </SearchProvider>
    </WorkspaceProvider>
);