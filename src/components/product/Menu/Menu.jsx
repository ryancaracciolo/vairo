import React, { useState } from 'react';
import { ReactComponent as ThreadIcon } from '../../../assets/icons/threads-icon.svg';
import { ReactComponent as DashboardIcon } from '../../../assets/icons/dashboard-icon.svg';
import { ReactComponent as DataSourceIcon } from '../../../assets/icons/data-icon.svg';
import { ReactComponent as DocumentIcon } from '../../../assets/icons/docs-icon.svg';
import { ReactComponent as AddIcon } from '../../../assets/icons/add-icon.svg';
import { ReactComponent as ConnectIcon } from '../../../assets/icons/connect-icon.svg';
import { ReactComponent as ShareIcon } from '../../../assets/icons/share-icon.svg';
import { ReactComponent as EditIcon } from '../../../assets/icons/edit-icon.svg';
import { ReactComponent as DeleteIcon } from '../../../assets/icons/delete-icon.svg';

import MenuItem from './MenuItem';
import SubMenu from './SubMenu';
import './Menu.css';
import { Link } from 'react-router-dom';

function Menu({ activeMenuIndex }) {
    const [selectedItem, setSelectedItem] = useState(activeMenuIndex || 0);

    const menuItems = [
        { label: 'Threads', icon: ThreadIcon, path: '/app/threads' },
        { label: 'Dashboard', icon: DashboardIcon, path: '/app/dashboards' },
        { label: 'Data Sources', icon: DataSourceIcon, path: '/app/data-sources' },
        { label: 'Resources', icon: DocumentIcon, path: '/app/resources' }
    ];

        // [
        //     { label: 'New Thread', icon: AddIcon, path: '/app/threads?action=new' },
        //     { label: 'Connect Data Source', icon: ConnectIcon, path: '/app/threads?action=connect' },
        //     { label: 'Share / Embed', icon: ShareIcon, path: '/app/threads?action=share' },
        // ],
        // [
        //     { label: 'New Dashboard', icon: AddIcon, path: '/app/dashboards?action=new' },
        //     { label: 'Connect Data Source', icon: ConnectIcon, path: '/app/dashboards?action=connect' },
        //     { label: 'Share / Embed', icon: ShareIcon, path: '/app/dashboards?action=share' },
        //     { label: 'Edit', icon: EditIcon, path: '/app/dashboards?action=edit' },
        // ],
        // [
        //     { label: 'New Data Source', icon: AddIcon, path: '/app/data-sources?action=new' },
        //     { label: 'Edit', icon: EditIcon, path: '/app/data-sources?action=edit' },
        // ],
        // [],

    const handleMenuClicked = (index) => {
        setSelectedItem(index);
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
                        onClick={() => { handleMenuClicked(index); }}
                    />
                ))}
            </ul>
            <hr />
            <SubMenu selectedItem={selectedItem} />
        </nav>
    );
}

export default Menu;