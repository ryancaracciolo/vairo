import React, { useState, useContext, useEffect } from 'react';
import { UserContext, WorkspaceContext } from '../../objects/Context';
import './InviteModal.css';
import { ReactComponent as XIcon } from '../../assets/icons/close-icon.svg';
import { ReactComponent as DownIcon } from '../../assets/icons/down-icon.svg';
import CircleInitials from '../CircleInitials/CircleInitials';
import axios from 'axios';

const InviteModal = ({ handleCloseClick, members, setMembers }) => {
    const { workspace } = useContext(WorkspaceContext);
    const { user } = useContext(UserContext);
    const [invitesSent, setInvitesSent] = useState([]);

    const [emailInput, setEmailInput] = useState('');
    const [errorMessage, setErrorMessage] = useState('');
    const [selectionOpen, setSelectionOpen] = useState(null);

    const validateEmail = (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    };

    const handleInviteClick = () => {
        // Split the input by commas or spaces and remove empty entries
        const inputEmails = emailInput
            .split(/[\s,]+/)
            .map((email) => email.trim())
            .filter((email) => email.length > 0);

        const invalidEmails = inputEmails.filter((email) => !validateEmail(email));

        if (invalidEmails.length > 0 || inputEmails.length === 0) {
            setErrorMessage(`Invalid email(s): ${invalidEmails.join(', ')}`);
        } else {
            setErrorMessage('');
            console.log('Inviting members', inputEmails);
            console.log('Workspace', workspace);
            console.log('User', user);
            axios
                .post(`${process.env.REACT_APP_API_BASE_URL}/api/workspaces/invite-members`, {
                    workspaceId: workspace.id,
                    workspaceName: workspace.name,
                    emails: inputEmails,
                    senderName: user.name
                })
                .then((response) => {
                    console.log('Invitations sent', response);
                    setEmailInput('');
                    //setInvitesSent([...invitesSent, ...inputEmails]);
                })
                .catch((error) => {
                    console.error('Error sending invitations', error);
                    setErrorMessage('Failed to send invitations. Please try again.');
                });
        }
    };

    const fetchInvitesSent = () => {
        axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/workspaces/invites-sent/${workspace.id}`)
            .then((response) => {
                console.log('Invitations sent', response);
                setInvitesSent(response.data);
            })
            .catch((error) => {
                console.error('Error fetching invites sent', error);
            });
    }

    const handleStatusChange = (index, newStatus) => {
        const updatedMembers = [...members];
        updatedMembers[index].status = newStatus;
        setMembers(updatedMembers);
        setSelectionOpen(null);
    };

    const handleStatusClick = (index) => {
        setSelectionOpen(selectionOpen === index ? null : index);
    };

    const handleRevokeMember = (index) => {
        // Logic to revoke member access
        console.log('Revoke member access');
    };

    useEffect(() => {
        fetchInvitesSent();
    }, []);

    const renderStatusSelection = () => {
        return (
            <div className="selection-menu">
                <div
                    className="status-option"
                    onClick={() => handleStatusChange(selectionOpen, 'Admin')}
                >
                    Admin
                </div>
                <div
                    className="status-option"
                    onClick={() => handleStatusChange(selectionOpen, 'Member')}
                >
                    Member
                </div>
                <div
                    className="status-option revoke"
                    onClick={() => handleRevokeMember(selectionOpen)}
                >
                    Remove Member
                </div>
            </div>
        );
    };

    return (
        <div className="invite-overlay">
            <div className="invite-header">
                <h2>Invite</h2>
                <h3>Invite team members to join your workspace</h3>
                <XIcon className="close-icon" onClick={handleCloseClick} />
            </div>
            <div className="invite-content">
                <div className="invite-input">
                    <input
                        type="text"
                        placeholder="Enter email(s)"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                    />
                    <button
                        className={`invite-button ${emailInput.length > 0 ? 'active' : ''}`}
                        onClick={handleInviteClick}
                        disabled={emailInput.length === 0}
                    >
                        Invite
                    </button>
                </div>
                {errorMessage && <div className="error-message">{errorMessage}</div>}
                <h3>Team Members</h3>
                <div className="members-list">
                    {members && members.map((member, index) => (
                        <div className="member-item" key={index}>
                            <div className="member-details">
                                <CircleInitials text={member.name} />
                                <div className="member-info">
                                    <div>{member.name}</div>
                                    <div>{member.email}</div>
                                </div>
                            </div>
                            <div className={`member-status ${member.role}`}>
                                <div className="status" onClick={() => handleStatusClick(index)}>
                                    <p>{member.role.charAt(0).toUpperCase() + member.role.slice(1)}</p>
                                    <DownIcon className="down-icon" />
                                </div>
                                {selectionOpen === index && renderStatusSelection()}
                            </div>
                        </div>
                    ))}
                </div>
                <h3>Invites Sent</h3>
                <div className="members-list">
                    {invitesSent.length > 0 ? invitesSent.map((invite, index) => (
                        <div className="member-item" key={index}>
                            <div className="member-details">
                                <CircleInitials text={invite.email} />
                                <div className="member-info">
                                    <div>{invite.email}</div>
                                </div>
                            </div>
                            <div className={`member-status pending`}>
                                <div className="status">
                                    <p>Pending</p>
                                </div>
                            </div>
                        </div>
                    )) : <div>None</div>}
                </div>
            </div>
        </div>
    );
};

export default InviteModal;