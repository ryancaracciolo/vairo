import React, { useContext, useState } from 'react';
import './Header.css';
import logo from '../../../assets/images/vairo-logo.png';
import {ReactComponent as DownIcon} from '../../../assets/icons/down-icon.svg';
import {ReactComponent as SettingsIcon} from '../../../assets/icons/settings-icon.svg';
import {ReactComponent as AlertIcon} from '../../../assets/icons/bell-icon.svg';
import {ReactComponent as LogoutIcon} from '../../../assets/icons/logout-icon.svg';
import { UserContext, SearchContext } from '../../../objects/Context';
import CircleInitials from '../CircleInitials/CircleInitials'
import { CognitoUserPool } from 'amazon-cognito-identity-js';

// Initialize userPool outside the component to avoid re-initialization on every render
const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_USER_POOL_ID,
  ClientId: process.env.REACT_APP_CLIENT_ID,
});

const Header = () => {
    const { user, setUser } = useContext(UserContext);
    const { searchText, setSearchText } = useContext(SearchContext);
    const [showPopup, setShowPopup] = useState(false);

    const handleProfileClick = () => {
        setShowPopup(!showPopup);
    };

    const handleLogout = () => {
        // Get the current Cognito user
        const cognitoUser = userPool.getCurrentUser();

        if (cognitoUser) {
            cognitoUser.signOut();
        }

        // Clear user data from local storage
        localStorage.removeItem('user');
        
        // Clear user data from context
        setUser(null);

        // Redirect to login page
        window.location.href = '/app/login'; // Adjust the path as needed
    };

    const handleSearch = (e) => {
        console.log(e.target.value);
        const value = e.target.value;
        if (value) {
            setSearchText(value);
        } else {
            setSearchText(''); 
        }
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
                    <div className='alerts'>
                        <AlertIcon className='header-icon-button' />
                        <div className='alerts-count'><span>3</span></div>
                    </div>
                    <SettingsIcon className='header-icon-button' />
                    <div className='header-divider'>|</div>
                    <button className="profile-button" onClick={handleProfileClick}>
                        <CircleInitials text={user.name} classN='header-initials' />
                        <h3>{user.name}</h3>
                        <DownIcon className='header-button'/>
                    </button>
                </div>
            </div>
            {showPopup ? (
                <div className='user-profile'>
                    <CircleInitials text={user.name} classN='profile-initials' />
                    <div className='user-profile-details'>
                        <h3 className='user-name'>{user.name}</h3>
                        <h3 className='user-email'>{user.email}</h3>
                        <h3 className='user-business-name'>{user.businessName}</h3>
                        <hr />
                        <div className='logout-button' onClick={handleLogout}>
                            <LogoutIcon className='logout-icon'/>
                            <h3>Sign Out</h3>
                        </div>
                    </div>
                </div>
            ) : (null)}
        </header>
    );
};

export default Header;