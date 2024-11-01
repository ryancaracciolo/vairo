import React, { useContext, useState, useEffect } from 'react';
import { ReactComponent as ThreadIcon } from '../../../assets/icons/threads-icon.svg';
import { ReactComponent as DashboardIcon } from '../../../assets/icons/dashboard-icon.svg';
import { ReactComponent as DataSourceIcon } from '../../../assets/icons/data-icon.svg';
import { ReactComponent as DocumentIcon } from '../../../assets/icons/docs-icon.svg';
import { ReactComponent as AddIcon } from '../../../assets/icons/add-icon.svg';
import { ReactComponent as DownIcon } from '../../../assets/icons/down-icon.svg';
import { Link, useNavigate } from 'react-router-dom';

import MenuItem from './MenuItem';
import './Menu.css';
import { ActiveMenuIndexContext } from '../../../objects/Context';

function Menu() {
    const { activeMenuIndex, setActiveMenuIndex } = useContext(ActiveMenuIndexContext);
    const [contentItems, setContentItems] = useState([]);
    const navigate = useNavigate();

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

    const contentTitle = activeMenuIndex === 0 ? "My Threads" : 
                         activeMenuIndex === 1 ? "My Dashboards" :
                         activeMenuIndex === 2 ? "My Data Sources" : 
                         activeMenuIndex === 3 ? "Resources" : "";

    useEffect(() => {
        const handleThreadNameUpdate = (event) => {
            const { threadId, newName } = event.detail;
            setContentItems(prevItems => 
                prevItems.map(item => {
                    if (item.timestamp.toString() === threadId) {
                        return { ...item, label: newName };
                    }
                    return item;
                })
            );
        };

        window.addEventListener('updateThreadName', handleThreadNameUpdate);
        return () => window.removeEventListener('updateThreadName', handleThreadNameUpdate);
    }, []);

    useEffect(() => {
        if (activeMenuIndex === 0 && contentItems.length === 0) {
            const timestamp = new Date().getTime();
            setContentItems([{ 
                label: 'New Thread',
                path: `/app/threads?thread=${timestamp}`,
                timestamp 
            }]);
            navigate(`/app/threads?thread=${timestamp}`);
        }
    }, [activeMenuIndex, contentItems.length]);

    const handleNewThreadClick = (e) => {
        if (activeMenuIndex === 0) {
            const existingNewThread = contentItems.find(item => item.label === 'New Thread');
            if (!existingNewThread) {
                const timestamp = new Date().getTime();
                const newThreadPath = `/app/threads?thread=${timestamp}`;
                setContentItems([...contentItems, { 
                    label: 'New Thread',
                    path: newThreadPath,
                    timestamp 
                }]);
                navigate(newThreadPath);
            }
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
                    <Link 
                        to={actionPath} 
                        className="sub-menu-button" 
                        onClick={handleNewThreadClick}
                    >
                        <AddIcon className="add-icon" />
                        <p className="add-label">{actionItem}</p>
                    </Link>
                )}
                <div className="sub-menu-content">
                    <div className="content-title">
                        <p className="title-label">{contentTitle}</p>
                        <DownIcon className="title-icon" />
                    </div>
                    <ul>
                        {contentItems.map((item, index) => (
                            <li key={index} className="item">
                                <Link className="menu-item-container" to={item.path}>
                                    <p className="menu-label">{item.label}</p>
                                </Link>
                            </li>
                        ))}
                    </ul>
                </div>
            </div>
        </nav>
    );
}

export default Menu;