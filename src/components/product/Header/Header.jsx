import React, { useContext, useState } from 'react';
import './Header.css';
import logo from '../../../assets/images/vairo-logo-light.png';
import {ReactComponent as DownIcon} from '../../../assets/icons/down-icon.svg';
import {ReactComponent as SettingsIcon} from '../../../assets/icons/settings-icon.svg';
import {ReactComponent as BellIcon} from '../../../assets/icons/bell-icon.svg';

import { BusinessContext, SearchContext } from '../../../objects/Context';
import Popup from '../Popup/Popup';
import CircleInitials from '../CircleInitials/CircleInitials'

const Header = () => {
    const { business } = useContext(BusinessContext);
    const { searchText, setSearchText } = useContext(SearchContext);
    const [showPopup, setShowPopup] = useState(false); // popup state
     
    
    const handleProfileClick = () => {
        setShowPopup(!showPopup);
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
                    <BellIcon className='header-button'/>
                    <SettingsIcon className='header-button'/>
                    <button className="profile-button" onClick={handleProfileClick}>
                        <CircleInitials businessName={business.name}/>
                        <h3>{business.name}</h3>
                        <DownIcon className='header-button'/>
                    </button>
                </div>
            </div>
            {showPopup ? <Popup content={
                <div className='user-profile-wrapper'>
                    <h2>My Card Info</h2>
                </div>
            } onClose={handleProfileClick} /> : null }
        </header>
    );
};

export default Header;