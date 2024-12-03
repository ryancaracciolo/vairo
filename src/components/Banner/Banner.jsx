import React, { useContext } from 'react';
import './Banner.css';
import { WorkspaceContext } from '../../objects/Context';

const Banner = () => {
    const { workspace } = useContext(WorkspaceContext);

    if (workspace.subscriptionType != "free") return null;

    const calculateDaysLeft = () => {
        const today = new Date();
        const creationDate = new Date(workspace.creationDate);
        const endDate = creationDate.setDate(creationDate.getDate() + 14);
        const daysLeft = Math.ceil((endDate-today) / (1000 * 60 * 60 * 24));
        console.log("daysLeft", daysLeft);
        return daysLeft;
    }

    const isTrial = calculateDaysLeft() > 0;

    const message = isTrial 
        ? `You have ${calculateDaysLeft()} day${calculateDaysLeft() > 1 ? 's' : ''} left in your trial. Upgrade your plan to continue usage.` 
        : 'Your trial has ended. Please upgrade your plan to continue usage.';

    return (
        <div className="banner">
            {message}
        </div>
    );
};

export default Banner;
