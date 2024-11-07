// src/pages/product/DataSources/AddDataSource.jsx
import React, { useState, useContext } from 'react';
import { UserContext } from '../../../objects/Context';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function AddDataSource() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        connectionName: '',
        dataSource: '',
        host: '',
        port: '',
        username: '',
        password: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/data-sources/add-data-source`, {
                creatorUserId: user.id,
                name: formData.connectionName,
                dataSourceType: formData.dataSource,
                host: formData.host,
                port: formData.port,
                username: formData.username,
                password: formData.password
            });

            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/connections/scrape-database`, {
                dbConfig: {
                    host: formData.host,
                    port: formData.port,
                    username: formData.username,
                    password: formData.password
                }
            });
            
            navigate('/app/data-sources');
        } catch (error) {
            console.error('Error adding data source:', error);
        }
    };

    return (
        <div className="add-data-source-wrapper">
            <h2>Add Data Source</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="connectionName" placeholder="Connection Name" value={formData.connectionName} onChange={handleChange} required />
                <input type="text" name="dataSource" placeholder="Data Source" value={formData.dataSource} onChange={handleChange} required />
                <input type="text" name="host" placeholder="Host" value={formData.host} onChange={handleChange} required />
                <input type="text" name="port" placeholder="Port" value={formData.port} onChange={handleChange} required />
                <input type="text" name="username" placeholder="Username" value={formData.username} onChange={handleChange} required />
                <input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleChange} required />
                <button type="submit">Submit</button>
            </form>
        </div>
    );
}

export default AddDataSource;