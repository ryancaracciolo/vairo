import React, { useState, useContext } from 'react';
import { BusinessContext } from '../../../objects/Context';
import { ReactComponent as PartnershipIcon } from '../../../assets/icons/handshake-icon.svg';
import { ReactComponent as OpportIcon } from '../../../assets/icons/list-icon.svg';
import { ReactComponent as PurchIcon } from '../../../assets/icons/tag-icon.svg';
import { ReactComponent as SignOutIcon } from '../../../assets/icons/logout-icon.svg';
import MenuItem from './MenuItem';
import './Menu.css';
import { Link } from 'react-router-dom';

function Menu({activeMenuIndex }) {
    const { setBusiness } = useContext(BusinessContext);
    const [selectedItem, setSelectedItem] = useState((activeMenuIndex ? activeMenuIndex : 0));


    const menuItems = [
        { label: 'Analyze', icon: PartnershipIcon, path: '/app/analyze' },
        { label: 'My Data', icon: OpportIcon, path: '/app/data' },
        { label: 'Docs', icon: PurchIcon, path: '/app/docs' }
    ];
    

    const handleMenuClicked = (index) => {
        setSelectedItem(index);
    }

     // Sign out function
    const handleSignOut = async () => {
        // try {
        // await signOut();
        // localStorage.removeItem('business'); // Remove the business item from localStorage
        // setBusiness(null);
        // } catch (error) {
        // console.log('Error signing out: ', error);
        //}
    };

    return (
        <nav className='ProductMenu'>
            <ul>
                {menuItems.map((item, index) => (
                    <MenuItem
                        key={index}
                        icon={item.icon}
                        label={item.label}
                        to={item.path}
                        isSelected={selectedItem === index}
                        onClick={() => {
                            if (item.label === 'Sign Out') {
                                handleSignOut();
                            } else {
                                handleMenuClicked(index);
                            }
                        }}
                    />
                ))}
            </ul>
            <li className='sign-out' onClick={() => {handleSignOut()}}>
                <Link to='app/login'>
                    <SignOutIcon className="menu-icon" />
                    <p>Sign Out</p>
                </Link>
            </li>
        </nav>
    );
}

export default Menu;