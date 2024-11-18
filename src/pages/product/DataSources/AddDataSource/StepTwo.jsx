// src/pages/product/DataSources/AddDataSource/StepOne.jsx
import React, { useState, useContext } from 'react';
import { UserContext } from '../../../../objects/Context';
import './AddDataSource.css'; // Import the CSS file
import postgresLogo from '../../../../assets/images/integrations/postgres.png';
import excelLogo from '../../../../assets/images/integrations/excel.png';
import quickbooksLogo from '../../../../assets/images/integrations/quickbooks.png';
import PostgresForm from './FormTypes/PostgresForm';
import './FormTypes/PostgresForm.css';

function StepTwo({formData, setFormData}) {
    const { user } = useContext(UserContext);

    // Mapping of data sources to their respective image paths
    const dataSourceImages = {
        'PostgreSQL': postgresLogo,
        'Quickbooks': quickbooksLogo,
        'Excel': excelLogo
    };

    return (
        <div className="form-step two">
            <div className="datasource-option">
                <img 
                    src={dataSourceImages[formData.dataSource] || excelLogo} 
                    alt={formData.dataSource} 
                />
                <h4>{formData.dataSource}</h4>
            </div>
            <h3>Please provide credentials below to provide data access to Vairo.</h3>
            <p>Note: Access required is ‘read-only’, meaning Vairo cannot change or delete your data!</p>
            {formData.dataSource === 'PostgreSQL' && <PostgresForm formData={formData} setFormData={setFormData} />}
            {/* Add other forms for Quickbooks and Excel as needed */}
        </div>
    );
}

export default StepTwo;