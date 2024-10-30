import React, {useState} from 'react';
import './Resources.css';
import LoadingScreen from '../../../components/product/LoadingScreen/LoadingScreen';

function Resources() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    } else if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="resources-wrapper">
            <div className="resources-content">
                <h1>Resources</h1>
            </div>
        </div>
    );
};

export default Resources; 