   // src/components/product/Menu/SubMenu.jsx
   import React from 'react';
   import { Link } from 'react-router-dom';
   import './SubMenu.css';
   import { ReactComponent as DownIcon } from '../../../assets/icons/down-icon.svg';
   import { ReactComponent as AddIcon } from '../../../assets/icons/add-icon.svg';


   const SubMenu = ({ selectedItem, contentItems }) => {

    const actionItem = selectedItem === 0 ? "New Thread" : 
                      selectedItem === 1 ? "New Dashboard" :
                      selectedItem === 2 ? "Add Data Source" : null;
    
       return (
           <div className="sub-menu-container">
                {actionItem && (
                    <div className="sub-menu-button">
                        <AddIcon className="add-icon" />
                        <p className="add-label">{actionItem}</p>
                    </div>
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
                                    <item.icon className="menu-icon" />
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
       );
   };

   export default SubMenu;