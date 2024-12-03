import React, { useState } from 'react';
import './ShareContent.css';
import CircleInitials from '../CircleInitials/CircleInitials';
import {ReactComponent as PlusIcon} from '../../assets/icons/add-noFill-icon.svg'

const PeopleShare = () => {
    const [people, setPeople] = useState(["Evan Caracciolo", "Scooba Steve", "Jim Beam"]);
    const [selectedPeople, setSelectedPeople] = useState([]);

    const toggleSelectPerson = (person) => {
        setSelectedPeople(prevSelected => 
            prevSelected.includes(person) 
                ? prevSelected.filter(p => p !== person) 
                : [...prevSelected, person]
        );
    };

    return (
        <div className="people-share">
           <ul>
            {people.map((person, index) => (
                <li key={index} onClick={() => toggleSelectPerson(person)}>
                    <div className={`person-container ${selectedPeople.includes(person) ? 'selected' : ''}`}>
                        <CircleInitials classN="share-initials" text={person} />
                        <p>{person}</p>
                    </div>
                    <div className={`share-toggle ${selectedPeople.includes(person) ? 'active' : ''}`}>
                        <p>{selectedPeople.includes(person) ? 'Added' : 'Add'}</p>
                        {!selectedPeople.includes(person) && <PlusIcon className="icon" />}
                    </div>
                </li>
            ))}
           </ul>
           <div className="share-invite-button">Share</div>
        </div>
    );
};

export default PeopleShare;
