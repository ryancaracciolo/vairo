import React from 'react';
import { Link } from 'react-router-dom';
import './Menu.css';

const MenuItem = ({ icon: Icon, label, to, isSelected, onClick }) => {
  return (
    <li className={isSelected ? 'menu-item active' : 'menu-item'} onClick={onClick}>
      <Link className={'menu-item-container'} to={to}>
        <Icon className={'menu-icon'+(isSelected ? ' active' : '')} />
        <p className={'menu-label'+(isSelected ? ' active' : '')}>{label}</p>
      </Link>
    </li>
  );
};

export default MenuItem;
