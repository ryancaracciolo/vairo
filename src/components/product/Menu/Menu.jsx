import React, { useContext, useState } from 'react';
import { ReactComponent as ThreadIcon } from '../../../assets/icons/threads-icon.svg';
import { ReactComponent as DashboardIcon } from '../../../assets/icons/dashboard-icon.svg';
import { ReactComponent as DataSourceIcon } from '../../../assets/icons/data-icon.svg';
import { ReactComponent as DocumentIcon } from '../../../assets/icons/docs-icon.svg';
import { ReactComponent as AddIcon } from '../../../assets/icons/add-icon.svg';
import { ReactComponent as DownIcon } from '../../../assets/icons/down-icon.svg';
import { Link } from 'react-router-dom';

import MenuItem from './MenuItem';
import './Menu.css';
import { ActiveMenuIndexContext } from '../../../objects/Context';

function Menu() {
    const {activeMenuIndex, setActiveMenuIndex} = useContext(ActiveMenuIndexContext);
    const [contentItems, setContentItems] = useState([]);

    console.log("Active Menu Index:", activeMenuIndex);

    const menuItems = [
        { label: 'Threads', icon: ThreadIcon, path: '/app/threads' },
        { label: 'Dashboard', icon: DashboardIcon, path: '/app/dashboards' },
        { label: 'Data Sources', icon: DataSourceIcon, path: '/app/data-sources' },
        { label: 'Resources', icon: DocumentIcon, path: '/app/resources' }
    ];

    const actionItem = activeMenuIndex === 0 ? "New Thread" : 
                      activeMenuIndex === 1 ? "New Dashboard" :
                      activeMenuIndex === 2 ? "Add Data Source" : null;
    
    const actionPath = activeMenuIndex === 0 ? "/app/threads?action=new-thread" : 
                      activeMenuIndex === 1 ? "/app/dashboards?action=new-dashboard" :
                      activeMenuIndex === 2 ? "/app/data-sources?action=add-data-source" : null;

    const handleNewThreadClick = () => {
        if (activeMenuIndex === 0) {
            setContentItems([...contentItems, { label: 'New Thread', path: '/app/threads/new-thread' }]);
        }
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
                        isSelected={activeMenuIndex === index}
                        onClick={() => { /* handleMenuClicked logic if needed */ }}
                    />
                ))}
            </ul>
            <hr />
            <div className="sub-menu-container">
                {actionItem && (
                    <Link to={actionPath} className="sub-menu-button" onClick={handleNewThreadClick}>
                        <AddIcon className="add-icon" />
                        <p className="add-label">{actionItem}</p>
                    </Link>
                )}
                <div className="sub-menu-content">
                    <div className="content-title">
                        <p className="title-label">My Threads</p>
                        <DownIcon className="title-icon" />
                    </div>
                    {contentItems && contentItems.length > 0 ? (
                        <ul>
                            {contentItems.map((item, index) => (
                                <li key={index} className="item">
                                    <Link className="menu-item-container" to={item.path}>
                                        <p className="menu-label">{item.label}</p>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <ul>
                            <li className="item">
                                <p className="menu-label">No History</p>
                            </li>
                        </ul>
                    )}
                </div>
            </div>
        </nav>
    );
}

export default Menu;