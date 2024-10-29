import React from 'react';
import './LoadingScreen.css';

const LoadingScreen = ({ isLoading }) => {
    if (!isLoading) { return null;}

    return (
        <div className="loading-overlay">
            <div className="circle-container">
            <div className="loading-circle"></div>
            <div className="loading-circle"></div>
            <div className="loading-circle"></div>
            </div>
        </div>
    );
};

export default LoadingScreen;
