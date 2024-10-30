import React, {useState} from 'react';
import './DataSources.css';
import LoadingScreen from '../../../components/product/LoadingScreen/LoadingScreen';

function DataSources() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    } else if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="data-sources-wrapper">
            <div className="data-sources-content">
                <h1>Data Sources</h1>
            </div>
        </div>
    );
};

export default DataSources; 