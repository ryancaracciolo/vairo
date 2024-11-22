// src/pages/product/DataSources/AddDataSource/StepOne.jsx
import React, { useState, useContext } from 'react';
import { UserContext } from '../../../objects/Context';
import './AddDataSource.css'; // Import the CSS file
import postgresLogo from '../../../assets/images/integrations/postgres.png';
import excelLogo from '../../../assets/images/integrations/excel.png';
import quickbooksLogo from '../../../assets/images/integrations/quickbooks.png';
import PostgresForm from './FormTypes/PostgresForm';
import CSVForm from './FormTypes/CSVForm';
import './FormTypes/PostgresForm.css';

function StepTwo({formData, setFormData, setFile}) {
    const { user } = useContext(UserContext);

    // Mapping of data sources to their respective image paths
    const dataSourceImages = {
        'PostgreSQL': postgresLogo,
        'Quickbooks': quickbooksLogo,
        'Excel': excelLogo
    };

    function renderForm() {
        switch (formData.dataSourceType) {
            case 'PostgreSQL':
                return <PostgresForm formData={formData} setFormData={setFormData} />;
            case 'Excel':
                return <CSVForm formData={formData} setFormData={setFormData} setFile={setFile} />;
            default:
                return null;
        }
    }

    return (
        <div className="form-step two">
            <div className="datasource-option">
                <img 
                    src={dataSourceImages[formData.dataSourceType] || excelLogo} 
                    alt={formData.dataSourceType} 
                />
                <h4>{formData.dataSourceType}</h4>
            </div>
            {renderForm()}
        </div>
    );
}

export default StepTwo;