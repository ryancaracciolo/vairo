// src/pages/product/DataSources/AddDataSource/StepOne.jsx
import React, { useContext } from 'react';
import { UserContext } from '../../../objects/Context';
import './AddDataSource.css'; // Import the CSS file
import postgresLogo from '../../../assets/images/integrations/postgres.png';
import excelLogo from '../../../assets/images/integrations/excel.png';
import quickbooksLogo from '../../../assets/images/integrations/quickbooks.png';
import { ReactComponent as PlusIcon } from '../../../assets/icons/add-noFill-icon.svg';

function StepOne({formData, setFormData}) {
    const { user } = useContext(UserContext);

    const dataSources = [
        { name: 'PostgreSQL', logo: postgresLogo },
        { name: 'Quickbooks', logo: quickbooksLogo },
        { name: 'Excel', logo: excelLogo },
        //{ name: 'Request Data Source', logo: null, icon: <PlusIcon /> },
    ];

    const handleOptionClick = (dataSource) => {
        setFormData({ ...formData, dataSourceType: dataSource });
    };

    return (
        <div className="form-step one">
            <h3>What data source would you like to connect to Vairo?</h3>
            <div className="datasource-options">
                {dataSources.map((source) => (
                    <div 
                        key={source.name}
                        className={`datasource-option ${formData.dataSourceType === source.name ? 'selected' : ''}`} 
                        onClick={() => handleOptionClick(source.name)}
                    >
                        {source.logo && source.name !== 'Request Data Source' ? (
                            <img src={source.logo} alt={source.name} />
                        ) : (
                            source.icon
                        )}
                        <h4>{source.name}</h4>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default StepOne;