import React, { useContext, useState, useEffect } from 'react';
import './Header.css';
import logo from '../../assets/images/vairo-logo.png';
import {ReactComponent as DownIcon} from '../../assets/icons/down-icon.svg';
import {ReactComponent as SettingsIcon} from '../../assets/icons/settings-icon.svg';
import {ReactComponent as AlertIcon} from '../../assets/icons/bell-icon.svg';
import {ReactComponent as LogoutIcon} from '../../assets/icons/logout-icon.svg';
import { UserContext, SearchContext, WorkspaceContext } from '../../objects/Context';
import CircleInitials from '../CircleInitials/CircleInitials'
import { CognitoUserPool } from 'amazon-cognito-identity-js';
import axios from 'axios';
import Profile from './Profile';
import Settings from './Settings';

// Initialize userPool outside the component to avoid re-initialization on every render
const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_USER_POOL_ID,
  ClientId: process.env.REACT_APP_CLIENT_ID,
});

const Header = () => {
    const { user, setUser } = useContext(UserContext)
    const { workspace, setWorkspace } = useContext(WorkspaceContext);
    const { searchText, setSearchText } = useContext(SearchContext);
    const [showPopup, setShowPopup] = useState(false);
    const [showSettings, setShowSettings] = useState(false);
    const [showBanner, setShowBanner] = useState(false);

    const handleProfileClick = () => {
        setShowPopup(!showPopup);
    };

    const fetchWorkspace = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/workspaces/get-workspace/${user.workspaceId}`);
            setWorkspace(response.data);
            console.log(response.data);
        } catch (error) {
            console.error('Error fetching workspace:', error);
            return null;
        }
    };

    useEffect(() => {
        fetchWorkspace();
    }, []);

    const handleLogout = () => {
        // Get the current Cognito user
        const cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.signOut();
        }
        localStorage.removeItem('user');
        setUser(null);
        window.location.href = '/login';
    };

    const handleSearch = (e) => {
        const value = e.target.value;
        if (value) {
            setSearchText(value);
        } else {
            setSearchText(''); 
        }
    };

    const handleSettingsClick = () => {
        console.log('settings clicked');
        setShowSettings(!showSettings);
    };

    return (
        <header className='product-header'>
            <div className="container">
                <div className="logo">
                    <img src={logo} alt="Filo Logo" />
                </div>
                <div className="search-bar-container">
                    <input type="text" placeholder="Search for Anything..." className="search-bar" value={searchText} onChange={handleSearch} />
                </div>
                <div className='button-container'>
                    {/* <div className='alerts'>
                        <AlertIcon className='header-icon-button' />
                        <div className='alerts-count'><span>3</span></div>
                    </div> */}
                    <SettingsIcon className='header-icon-button' onClick={handleSettingsClick} />
                    <div className='header-divider'>|</div>
                    <button className="profile-button" onClick={handleProfileClick}>
                        <CircleInitials text={user.name} classN='header-initials' />
                        <h3>{user.name}</h3>
                        <DownIcon className='header-button'/>
                    </button>
                </div>
            </div>
            {showPopup ? (
                <Profile user={user} workspace={workspace} setShowPopup={setShowPopup} handleLogout={handleLogout} />
            ) : (null)}
            {showSettings ? (
                <Settings setShowSettings={setShowSettings} />
            ) : (null)}
        </header>
    );
};

export default Header;