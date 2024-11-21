import React, { useState } from 'react';
import axios from 'axios';

function CSVForm({ formData, setFormData }) {

    const handleChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setFormData({ ...formData, file: file });
            console.log("file: ", file);
        }
    };
    

    return (
        <div className="form-wrapper">
            <h3>Please upload your CSV file below.</h3>
            <div className="csv-form">
                <form>
                    <input style={{ margin: '10px 0px' }} type="file" accept=".xlsx, .xls, .csv" onChange={handleChange} />
                </form>
            </div>
        </div>
    );
}

export default CSVForm; 