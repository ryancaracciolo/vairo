import React, {useState} from 'react';
import './Dashboard.css';
import LoadingScreen from '../../../components/product/LoadingScreen/LoadingScreen';

function Dashboard() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    } else if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="dashboard-wrapper">
            <div className="dashboard-content">
                <h1>Dashboard</h1>
            </div>
        </div>
    );
};

export default Dashboard;