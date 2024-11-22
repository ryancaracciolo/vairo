import React, { useState } from 'react';
import './CSVForm.css';
import axios from 'axios';

function CSVForm({ formData, setFormData, setFile }) {

    const handleUpload = (e) => {
        const f = e.target.files[0];
        if (f) {
            setFile(f);
            console.log("file: ", f);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    return (
        <div className="form-wrapper">
            <h3>Please upload your CSV file below.</h3>
            <div className="csv-form">
                <div className="form-group">
                    <label htmlFor="connectionName">Connection Name</label>
                    <input
                        type="text"
                        id="connectionName"
                        name="connectionName"
                        placeholder="Pick a name to help you identify this source in Vairo"
                        value={formData.connectionName || ''}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div className="form-group csv">
                    <label htmlFor="csvFile">CSV File</label>
                    <input id="fileInput" className="csv-file-input" type="file" accept=".xlsx, .xls, .csv" onChange={handleUpload}/>
                </div>
            </div>
        </div>
    );
}

export default CSVForm; 