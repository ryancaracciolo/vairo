// src/pages/product/DataSources/AddDataSource.jsx
import React, { useState, useContext } from 'react';
import { UserContext } from '../../../../objects/Context';
import './AddDataSource.css'; // Import the CSS file

function StepOne({formData, setFormData}) {
    const { user } = useContext(UserContext);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div className="form-step">
            <h3>Step 1</h3>
        </div>
    );
}

export default StepOne;