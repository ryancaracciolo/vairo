import React, {useState} from 'react';
import './Threads.css';
import LoadingScreen from '../../../components/product/LoadingScreen/LoadingScreen';

function Threads() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');


    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    } else if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="threads-wrapper">
            <div className="threads-content">
                <h1>Threads</h1>
            </div>
        </div>
    );
};

export default Threads;