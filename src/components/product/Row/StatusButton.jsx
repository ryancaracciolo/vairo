import React, { useState, useEffect, useRef } from 'react';
import './StatusButton.css';
import { ReactComponent as DropIcon } from '../../../assets/icons/down-icon.svg';

const StatusButton = ({ status, setStatus }) => {
    const [isOpen, setIsOpen] = useState(false); // Track whether dropdown is open
    const dropdownRef = useRef(null); // Reference to the dropdown container


    const statuses = ['New', 'Contacted', 'In-Progress', 'Closed-Won', 'Closed-Lost', 'Closed-Other'];

    // Toggle dropdown visibility
    const toggleDropdown = () => {
        setIsOpen(!isOpen);
    };

    // Handle status selection
    const handleStatusChange = (newStatus) => {
        setStatus(newStatus); // Update parent status
        setIsOpen(false); // Close dropdown after selecting
    };

    const handleClickOutside = (event) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false); // Close the dropdown if clicked outside
        }
    };

    useEffect(() => {
        if (isOpen) { // Add event listener when dropdown is open
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {document.removeEventListener('mousedown', handleClickOutside);};
    }, [isOpen]); // Dependency on isOpen to add/remove listener

    return (
        <div className="status-button-container" ref={dropdownRef}>
            <div className={`status ${status.toLowerCase()}`} onClick={toggleDropdown}>
                <span>{status}</span>
                <DropIcon className="drop-icon" />
            </div>
            {isOpen && (
                <div className="status-dropdown">
                    {statuses.map((s) => (
                        <div key={s} className="status-option" onClick={() => handleStatusChange(s)}>
                            {s}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default StatusButton;
