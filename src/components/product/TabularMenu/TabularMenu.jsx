import React, { useEffect, useRef, useState } from 'react';
import './TabularMenu.css';
import {ReactComponent as ArrowIcon} from '../../../assets/icons/down-icon.svg'


const TabularMenu = ({ headerName, tabItems, activeTab, setActiveTab}) => {

  const [menuClosed, setMenuClosed] = useState(false);

  return (
    <div className={"content-menu"+ (menuClosed ? ' closed' : ' open')}>
      <div className='menu-toggle' onClick={() => setMenuClosed(!menuClosed)}>
          <ArrowIcon className={'menu-toggle-img'+ (menuClosed ? ' closed' : ' open')}/>
      </div>
      <div className={'menu-container'+(menuClosed ? ' closed' : ' open')}>
        <h1>{headerName}</h1>
          <div className="menu-tabs">
            {tabItems.map((tab) => (
              <button
                key={tab} // Ensure tab names are unique; otherwise, use tab.id if available
                className={`menu-tab${activeTab === tab ? ' active' : ''}`}
                onClick={() => setActiveTab(tab)}
              >
                <p>{tab}</p>
              </button>
            ))}
          </div>
        </div>
    </div>
  );
};

export default TabularMenu;
