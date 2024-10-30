import React, { useState } from 'react';
import { ReactComponent as PartnershipIcon } from '../../../assets/icons/handshake-icon.svg';
import { ReactComponent as OpportIcon } from '../../../assets/icons/list-icon.svg';
import { ReactComponent as PurchIcon } from '../../../assets/icons/tag-icon.svg';
import MenuItem from './MenuItem';
import './Menu.css';
import { Link } from 'react-router-dom';

function Menu({activeMenuIndex }) {
    const [selectedItem, setSelectedItem] = useState((activeMenuIndex ? activeMenuIndex : 0));


    const menuItems = [
        { label: 'Threads', icon: PartnershipIcon, path: '/app/threads' },
        { label: 'Dashboard', icon: OpportIcon, path: '/app/dashboards' },
        { label: 'Data Sources', icon: PurchIcon, path: '/app/data-sources' },
        { label: 'Resources', icon: PurchIcon, path: '/app/resources' }
    ];
    

    const handleMenuClicked = (index) => {
        setSelectedItem(index);
    }


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
                        onClick={() => { handleMenuClicked(index); }}
                    />
                ))}
            </ul>
        </nav>
    );
}

export default Menu;