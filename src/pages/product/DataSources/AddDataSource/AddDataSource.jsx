// src/pages/product/DataSources/AddDataSource.jsx
import React, { useState, useContext } from 'react';
import { UserContext } from '../../../../objects/Context';
import { useNavigate } from 'react-router-dom';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import axios from 'axios';
import './AddDataSource.css'; // Import the CSS file

function AddDataSource() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
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

    const nextStep = () => {
        setCurrentStep((prev) => prev + 1);
    };

    const prevStep = () => {
        setCurrentStep((prev) => prev - 1);
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <StepOne formData={formData} setFormData={setFormData} />;
            case 2:
                return <StepTwo formData={formData} setFormData={setFormData} />;
            case 3:
                return <StepThree formData={formData} setFormData={setFormData} />;
            default:
                return <StepOne formData={formData} setFormData={setFormData} />;
        }
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
            <h2 className="form-title">Add Data Source</h2>
            <div className="progress-bar">
                <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>1</div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>2</div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>3</div>
                <div className={`step ${currentStep >= 4 ? 'active' : ''}`}>4</div>
            </div>

            <form className="data-source-form" onSubmit={handleSubmit}>
                <div className="form-group">
                    <label htmlFor="connectionName">Connection Name</label>
                    <input
                        type="text"
                        id="connectionName"
                        name="connectionName"
                        placeholder="Enter connection name"
                        value={formData.connectionName}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="dataSource">Data Source</label>
                    <input
                        type="text"
                        id="dataSource"
                        name="dataSource"
                        placeholder="Enter data source type"
                        value={formData.dataSource}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="host">Host</label>
                    <input
                        type="text"
                        id="host"
                        name="host"
                        placeholder="Enter host address"
                        value={formData.host}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="port">Port</label>
                    <input
                        type="text"
                        id="port"
                        name="port"
                        placeholder="Enter port number"
                        value={formData.port}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Enter username"
                        value={formData.username}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Enter password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit" className="submit-button">Submit</button>
            </form>
        </div>
    );
}

export default AddDataSource;