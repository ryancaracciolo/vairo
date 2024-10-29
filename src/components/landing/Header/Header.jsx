import React from 'react';
import { Link } from 'react-router-dom';
import './Header.css';
import logo from '../../../assets/images/vairo-logo-light.png';

const Header = ({ onMenuClick }) => {
    return (
        <header className='header-landing'>
            <div className="container">
                <div className="logo">
                    <Link to="/">
                        <img src={logo} alt="Company Logo" />
                    </Link>
                </div>
                <nav className="nav">
                    <ul>
                    <li><a href="#home">Internal</a></li>
                    <li><a href="#home">For Your Customers</a></li>
                    <li><a href="#how-it-works">How It Works</a></li>
                    <li><a href="#contact">Contact</a></li>
                    </ul>
                </nav>
                <div className="auth-buttons">
                    <Link to="/app/login" className="sign-in">Login</Link>
                    <Link to="/app/login" className="demo-request">Register</Link>
                    <div className="hamburger" onClick={onMenuClick}>
                        <span className="menu-line one"></span>
                        <span className="menu-line two"></span>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;