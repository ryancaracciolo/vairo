import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

function EditDataSource() {
    const location = useLocation();
    const navigate = useNavigate();
    const { dataSource, onEditConfirm } = location.state || {};

    const handleSave = () => {
        // Assume newStatus is the updated status from a form input
        const newStatus = 'Updated Status'; // Replace with actual form data
        onEditConfirm({ dataSourceId: dataSource.id, newStatus });
        navigate(-1); // Go back to the previous page
    };

    return (
        <div>
            <h1>Edit Data Source</h1>
            <form>
                <label>
                    Connection Name:
                    <input type="text" defaultValue={dataSource.connectionName} />
                </label>
                <label>
                    Data Source:
                    <input type="text" defaultValue={dataSource.dataSource} />
                </label>
                <label>
                    Status:
                    <input type="text" defaultValue={dataSource.status} />
                </label>
                <button type="button" onClick={handleSave}>Save</button>
            </form>
        </div>
    );
}

export default EditDataSource;
