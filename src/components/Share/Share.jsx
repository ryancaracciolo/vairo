import React, { useState } from 'react';
import './Share.css';
import {ReactComponent as AddIcon} from '../../assets/icons/add-icon.svg'
import { ReactComponent as XIcon } from '../../assets/icons/close-icon.svg'
import PeopleShare from './PeopleShare';
import EmbedShare from './EmbedShare';
import ExportShare from './ExportShare';

const Share = ({handleCloseClick}) => {
    const [selectedOption, setSelectedOption] = useState("People");

    const handleInviteClick = () => {
        console.log("invite!");
    }

    const handleOptionClick = (option) => {
        setSelectedOption(option);
    };

    return (
        <div className="share-overlay">
            <div className="share-header">
                <h2>Share</h2>
                <h3>Share with others or embed in your applications</h3>
                <XIcon className="close-icon" onClick={handleCloseClick}/>
            </div>
            <div className="share-content">
                <div className="tabular-container">
                    <div className={`option ${selectedOption === "People" ? "active" : ""}`} onClick={() => handleOptionClick("People")}>People</div>
                    <div className={`option ${selectedOption === "Embed" ? "active" : ""}`} onClick={() => handleOptionClick("Embed")}>Embed</div>
                    <div className={`option ${selectedOption === "Export" ? "active" : ""}`} onClick={() => handleOptionClick("Export")}>Export</div>
                </div>
                <div>
                    {selectedOption === "People" && <PeopleShare />}
                    {selectedOption === "Embed" && <EmbedShare />}
                    {selectedOption === "Export" && <ExportShare />}
                </div>
            </div>
            <div className="share-footer" onClick={handleInviteClick}>
                {/* <AddIcon className="icon"/>
                <h2 className="text">Invite team members to join your workspace</h2> */}
            </div>
        </div>
    );
};

export default Share;
