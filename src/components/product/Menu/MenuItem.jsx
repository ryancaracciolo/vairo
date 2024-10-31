import React from 'react';
import { Link } from 'react-router-dom';

function MenuItem({ icon: Icon, label, to, isSelected, onClick }) {
    return (
        <li className={`menu-item ${isSelected ? 'active' : ''}`} onClick={onClick}>
            <Link to={to} className="menu-item-container">
                <Icon className="menu-icon" />
                <p className={`menu-label ${isSelected ? 'active' : ''}`}>{label}</p>
            </Link>
        </li>
    );
}

export default MenuItem;
