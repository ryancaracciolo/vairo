import React from 'react';
import CircleInitials from '../CircleInitials/CircleInitials';
import { ReactComponent as LogoutIcon } from '../../assets/icons/logout-icon.svg';
import './Profile.css';

const Profile = ({ user, workspace, handleLogout }) => {

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

    return (
        <div className='user-profile'>
            <div className='user-details-container'>
                <CircleInitials text={user.name} classN='profile-initials' />
                <div className='user-details'>
                    <h3 className='user-name'>{user.name}</h3>
                    <h3 className='user-email'>{user.email}</h3>
                </div>
            </div>
            <hr />
            <div className='workspace-details-container'>
                <div className='workspace-details'>
                    <h3 className='workspace-leader'>Workspace</h3>
                    <h3 className='workspace-text'>{workspace.name}</h3>
                </div>
                <div className='workspace-details'>
                    <h3 className='workspace-leader'>Role</h3>
                    <h3 className='workspace-text'>{renameRole(user.role)}</h3>
                </div>
                <div className='workspace-details'>
                    <h3 className='workspace-leader'>Subscription</h3>
                    <h3 className='workspace-text'>{renameSubscription(workspace.subscriptionType)}</h3>
                    {user.role === 'admin' && <div className='upgrade'>Upgrade</div>}
                </div>
            </div> 
            <hr />
            <div className='logout-button-container'>   
                <div className='logout-button' onClick={handleLogout}>
                    <LogoutIcon className='logout-icon'/>
                    <h3>Sign Out</h3>
                </div>
            </div>
        </div>
    );
};

export default Profile;
