import React, { useContext, useState } from 'react';
import './Header.css';
import logo from '../../../assets/images/vairo-logo.png';
import {ReactComponent as DownIcon} from '../../../assets/icons/down-icon.svg';
import {ReactComponent as AddIcon} from '../../../assets/icons/add-icon.svg';
import {ReactComponent as DataSourceIcon} from '../../../assets/icons/upload-icon.svg';
import {ReactComponent as EditIcon} from '../../../assets/icons/edit-icon.svg';
import {ReactComponent as ShareIcon} from '../../../assets/icons/share-icon.svg';
import { BusinessContext, SearchContext, ActiveMenuIndexContext } from '../../../objects/Context';
import Popup from '../Popup/Popup';
import CircleInitials from '../CircleInitials/CircleInitials'

const Header = () => {
    const { business } = useContext(BusinessContext);
    const { searchText, setSearchText } = useContext(SearchContext);
    const { activeMenuIndex } = useContext(ActiveMenuIndexContext);
    const [showPopup, setShowPopup] = useState(false);

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

    const iconButtons = activeMenuIndex === 0 ? [AddIcon, DataSourceIcon, EditIcon, ShareIcon] :
                        activeMenuIndex === 1 ? [AddIcon, DataSourceIcon, EditIcon, ShareIcon] :
                        activeMenuIndex === 2 ? [AddIcon, EditIcon] :
                        [ShareIcon];

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
                    {iconButtons.map((IconComponent, index) => (
                        <IconComponent key={index} className='header-icon-button' />
                    ))}
                    <div className='header-divider'>|</div>
                    <button className="profile-button" onClick={handleProfileClick}>
                        <CircleInitials businessName={business.name} size='30px' fontSize='12px'/>
                        <h3>Dubin Clark</h3>
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