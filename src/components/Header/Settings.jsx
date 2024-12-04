import React, { useState, useEffect, useContext } from 'react';
import CircleInitials from '../CircleInitials/CircleInitials';
import { ReactComponent as MoreIcon } from '../../assets/icons/arrow-right-icon.svg';
import { ReactComponent as EditIcon } from '../../assets/icons/edit-icon.svg';
import { ReactComponent as PlusIcon } from '../../assets/icons/add-noFill-icon.svg';
import './Settings.css';
import axios from 'axios';
import { UserContext, WorkspaceContext } from '../../objects/Context';
import Popup from '../Popup/Popup';
import InviteModal from '../InviteModal/InviteModal';
import { useNavigate } from 'react-router-dom';

const Settings = ({ setShowSettings }) => {
    const navigate = useNavigate();
    const { user, setUser } = useContext(UserContext);
    const { workspace, setWorkspace } = useContext(WorkspaceContext);
    const [members, setMembers] = useState([user]);
    const [editingField, setEditingField] = useState(null);
    const [fieldValues, setFieldValues] = useState({name: user.name, workspaceName: workspace.name});
    const [firstLoad, setFirstLoad] = useState(true);
    const [inviteModalOpen, setInviteModalOpen] = useState(false);

    const fetchMembers = async () => {
        if (workspace.memberIds.length > 1) {
            const ids = workspace.memberIds.filter(id => id !== user.id);
            try {
                const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/users/get-users-by-ids`, { memberIds: ids });
                const mbs = Array.isArray(response.data) ? response.data : [response.data];
                setMembers([...members, ...mbs]);
            } catch (error) {
                console.log(error);
            }
        }
    }
    
    function renameSubscription(subscription) {
        if (subscription === 'free') return 'Free Trial';
        if (subscription === 'starter') return 'Starter';
        if (subscription === 'base') return 'Base';
        if (subscription === 'professional') return 'Professional';
        return 'N/A';
    }

    function renameRole(role) {
        if (role === 'admin') return 'Admin';
        if (role === 'member') return 'Member';
        return 'Member';
    }

    useEffect(() => {
        fetchMembers();
    }, []);

    useEffect(() => {
        if (!firstLoad) {
            localStorage.setItem('user', JSON.stringify(user));
        } else {
            setFirstLoad(false);
        }
    }, [user]);

    const renderMembers = () => {
        const maxVisibleMembers = 3;
        const visibleMembers = members.slice(0, maxVisibleMembers);
        const additionalMembersCount = members.length - maxVisibleMembers;

        return (
            <div className='members-display'>
                {visibleMembers.map((member, index) => (
                    <CircleInitials key={index} text={member.name} classN='profile-initials' />
                ))}
                {additionalMembersCount > 0 && (
                    <span className='additional-members-count'>
                        +{additionalMembersCount}
                    </span>
                )}
                <div className='add-member-container' onClick={() => handleInvite()}>
                    <PlusIcon className='add-member-icon' />
                </div>
            </div>
        );
    }

    const renderInvitePopup = () => {
        return (
          <Popup
            content={<InviteModal handleCloseClick={() => handleInvite()} members={members} setMembers={setMembers} />}
            onClose={() => handleInvite()}
          />
        );
    };

    const handleInvite = () => {
        if (inviteModalOpen) {
            setInviteModalOpen(false);
        } else {
            setInviteModalOpen(true);
        }
    }

    const handleEditClick = (field) => {
        setEditingField(field);
    };

    const handleInputChange = (e) => {
        setFieldValues({
            ...fieldValues,
            [editingField]: e.target.value,
        });
    };

    const handleOkClick = () => {
        setEditingField(null);
        if (editingField === 'name') {
            updateUserName(user.id, fieldValues.name);
        }
        if (editingField === 'workspaceName') {
            updateWorkspaceName(workspace.id, fieldValues.workspaceName);
        }
    };

    const updateUserName = async (id, name) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/users/update-name/${id}`, { newName: name });
            setUser(prevUser => ({...prevUser, name: name}));
        } catch (error) {
            console.log(error);
        }
    };

    const updateWorkspaceName = async (id, name) => {
        try {
            await axios.put(`${process.env.REACT_APP_API_BASE_URL}/api/workspaces/update-name/${id}`, { newName: name });
            setWorkspace(prevWorkspace => ({...prevWorkspace, name: name}));
        } catch (error) {
            console.log(error);
        }
    };

    const handleUpgrade = () => {
        setShowSettings(false);
        navigate('/upgrade');
    }

    return (
        <div className='settings-container'>
            <div className='user-details-container'>
                <CircleInitials text={user.name} classN='profile-initials' />
                <div className='user-details'>
                    <h3 className='user-name'>{user.name}</h3>
                    <h3 className='user-email'>{user.email}</h3>
                </div>
            </div>
            <hr />
            <div className='settings-item-container'>
                <div className='settings-item'>
                    <h3 className='item-leader'>Name</h3>
                    {editingField === 'name' ? (
                        <input
                            type='text'
                            value={fieldValues.name}
                            onChange={handleInputChange}
                            autoFocus
                        />
                    ) : (
                        <h3 className='item-text'>{fieldValues.name}</h3>
                    )}
                    {editingField === 'name' ? (
                        <button className='ok-button' onClick={handleOkClick}>OK</button>
                    ) : (
                        <EditIcon className='more-icon' onClick={() => handleEditClick('name')} />
                    )}
                </div>
                <div className='settings-item'>
                    <h3 className='item-leader'>Workspace Name</h3>
                    {editingField === 'workspaceName' ? (
                        <input
                            type='text'
                            value={fieldValues.workspaceName}
                            onChange={handleInputChange}
                            autoFocus
                        />
                    ) : (
                        <h3 className='item-text'>{fieldValues.workspaceName}</h3>
                    )}
                    {editingField === 'workspaceName' ? (
                        <button className='ok-button' onClick={handleOkClick}>OK</button>
                    ) : (
                        <EditIcon className='more-icon' onClick={() => handleEditClick('workspaceName')} />
                    )}
                </div>
                <div className='settings-item' >
                    <h3 className='item-leader'>Team Members</h3>
                    {renderMembers()}
                </div>
                <div className='settings-item'>
                    <h3 className='item-leader'>Subscription</h3>
                    <h3 className='item-text'>{renameSubscription(workspace.subscriptionType)}</h3>
                    <div className='upgrade' onClick={() => handleUpgrade()}>Upgrade</div>
                </div>
            </div>
            {inviteModalOpen && renderInvitePopup()}
        </div>
    );
};

export default Settings;
