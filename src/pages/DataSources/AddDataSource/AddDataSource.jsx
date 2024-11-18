// src/pages/product/DataSources/AddDataSource.jsx
import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../../../objects/Context';
import { useNavigate } from 'react-router-dom';
import StepOne from './StepOne';
import StepTwo from './StepTwo';
import StepThree from './StepThree';
import { ReactComponent as ArrowIcon } from '../../../assets/icons/arrow-right-icon.svg';
import axios from 'axios';
import './AddDataSource.css'; // Import the CSS file
import './AddDataSource-Steps.css'; // Import the CSS file
import LoadingScreen from '../../../components/LoadingScreen/LoadingScreen'; // Import the LoadingScreen component

function AddDataSource() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(1);
    const [validTestFailed, setValidTestFailed] = useState(false);
    const [formData, setFormData] = useState({
        dataSource: '',
        connectionName: '',
        host: '',
        port: '',
        databaseName: '',
        username: '',
        password: ''
    });
    const [schema, setSchema] = useState([]);
    const [selectedSchema, setSelectedSchema] = useState({});
    const [dataSourceId, setDataSourceId] = useState('');
    const [isLoading, setIsLoading] = useState(false); // Add loading state

    const nextStep = async () => {
        if (isStepValid()) {
            if (currentStep === 2) {
                await handleConnect();
            } else if (currentStep < 3) {
                setCurrentStep((prev) => prev + 1);
            }
        }
    };

    const prevStep = () => {
        setValidTestFailed(false);
        if (currentStep > 1) {
            setCurrentStep((prev) => prev - 1);
        } else {
            navigate('/data-sources');
        }
    };

    const handleConnect = async (e) => {
        setIsLoading(true); // Set loading to true
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/connections/connect`, {
                creatorUserId: user.id,
                name: formData.connectionName,
                dataSourceType: formData.dataSource,
                host: formData.host,
                port: formData.port,
                username: formData.username,
                password: formData.password,
                databaseName: formData.databaseName
            });
            console.log("Response: ", response.data);
            if (response.data.dbStructure) {
                console.log("DB Structure: ", JSON.stringify(response.data.dbStructure, null, 2));
                setSchema(response.data.dbStructure);
                setDataSourceId(response.data.dataSourceId);
                if (currentStep < 3) {
                    setCurrentStep((prev) => prev + 1);
                }
            } else {
                console.error('Connection test failed: No schema returned');
            }
        } catch (error) {
            console.error('Error testing connection:', error);
        } finally {
            setIsLoading(false); // Set loading to false
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isStepValid()) return;
        setIsLoading(true);
        try {
            console.log("Selected Schema: ", selectedSchema);
            console.log("DataSource ID: ", dataSourceId);
            await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/data-sources/add-schema`, {
                dataSourceId: dataSourceId,
                tables: selectedSchema
            });
            navigate('/data-sources');
        } catch (error) {
            console.error('Error adding data source:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1:
                if (formData.dataSource.trim() === '') {
                    setValidTestFailed(true);
                    return false;
                } else {
                    setValidTestFailed(false);
                    return true;
                }
            case 2:
                if (formData.connectionName.trim() === '' ||
                    formData.host.trim() === '' ||
                    formData.port.trim() === '' ||
                    formData.databaseName.trim() === '' ||
                    formData.username.trim() === '' ||
                    formData.password.trim() === '') {
                    setValidTestFailed(true);
                    return false;
                } else {
                    setValidTestFailed(false);
                    return true;
                }
            case 3:
                if (Object.keys(selectedSchema).length === 0) {
                    return false;
                } else {
                    return true;
                }
            default:
                return false;
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <StepOne formData={formData} setFormData={setFormData} />;
            case 2:
                return <StepTwo formData={formData} setFormData={setFormData} />;
            case 3:
                return <StepThree formData={formData} setFormData={setFormData} schema={schema} selectedSchema={selectedSchema} setSelectedSchema={setSelectedSchema} />;
            default:
                return <StepOne formData={formData} setFormData={setFormData} />;
        }
    };

    return (
        <div className="add-datasource-wrapper">
            {isLoading ? (
                <LoadingScreen />
            ) : (
                <>
                    <div className="form-header">
                        {currentStep === 1 && (
                            <>
                                <h1 className="form-title">Add Data Source</h1>
                                <h3 className="form-subtitle">Communicating with your data is just minutes away - follow the steps below to connect a data source to Vairo!</h3>
                                <hr className="form-divider"/>
                            </>
                        )}
                        <div className="progress-bar">
                            <div className={`step ${currentStep >= 1 ? 'active' : ''}`}>
                                <div className="step-number">1</div>
                                <div className="step-title">Select Source</div>
                                <ArrowIcon className="step-icon" />
                            </div>
                            <div className={`step ${currentStep >= 2 ? 'active' : ''}`}>
                                <div className="step-number">2</div>
                                <div className="step-title">Provide Access</div>
                                <ArrowIcon className="step-icon" />
                            </div>
                            <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                                <div className="step-number">3</div>
                                <div className="step-title">Define Schema</div>
                            </div>
                        </div>
                    </div>
                    <form className="steps" onSubmit={currentStep === 3 ? handleSubmit : (e) => e.preventDefault()}>
                        {renderStep()}
                        <div className="navigation-buttons">
                            <button type="button" onClick={prevStep} className="back-button">
                                <ArrowIcon className="back-icon"/>
                                <span>Back</span>
                            </button>
                            <p className="error-message">{validTestFailed ? "Please make sure you have filled out all required fields." : ""}</p>
                            {currentStep < 3 && (<button type="button" onClick={nextStep} className="next-button" >Continue</button>)}
                            {currentStep === 3 && (<button type="submit" className="confirm-button" >Confirm</button>)}
                        </div>
                    </form>
                </>
            )}
        </div>
    );
}

export default AddDataSource;