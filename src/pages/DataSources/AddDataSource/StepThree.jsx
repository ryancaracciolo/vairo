// src/pages/product/DataSources/AddDataSource/StepThree.jsx
import React, { useState, useContext } from 'react';
import { UserContext } from '../../../objects/Context';
import './AddDataSource.css'; // Import the CSS file
import postgresLogo from '../../../assets/images/integrations/postgres.png';
import excelLogo from '../../../assets/images/integrations/excel.png';
import quickbooksLogo from '../../../assets/images/integrations/quickbooks.png';
import PostgresForm from './FormTypes/PostgresForm';
import { ReactComponent as SuccessIcon } from '../../../assets/icons/checkmark-icon.svg';
import './FormTypes/PostgresForm.css';

function StepThree({formData, setFormData, schema, selectedSchema, setSelectedSchema}) {
    const { user } = useContext(UserContext);
    const [descriptions, setDescriptions] = useState({});

    const handleRowSelect = (tableName, fieldName) => {
        setSelectedSchema((prevSelectedSchema) => {
            const table = schema[tableName];
            const isSelected = prevSelectedSchema[tableName]?.columns.some(
                (field) => field.name === fieldName
            );

            const updatedColumns = isSelected
                ? prevSelectedSchema[tableName].columns.filter(
                      (field) => field.name !== fieldName
                  )
                : [...(prevSelectedSchema[tableName]?.columns || []), table.columns.find((field) => field.name === fieldName)];

            if (updatedColumns.length > 0) {
                return {
                    ...prevSelectedSchema,
                    [tableName]: {
                        tableName: table.tableName,
                        description: null, // or any logic to set description
                        columns: updatedColumns,
                        foreignKeys: [] // or any logic to set foreign keys
                    }
                };
            } else {
                const { [tableName]: _, ...rest } = prevSelectedSchema;
                return rest;
            }
        });
    };

    const handleSelectAll = (tableName, isChecked) => {
        setSelectedSchema((prevSelectedSchema) => {
            const table = schema[tableName];
            if (isChecked) {
                return {
                    ...prevSelectedSchema,
                    [tableName]: {
                        tableName: tableName,
                        description: null, // or any logic to set description
                        columns: table.columns,
                        foreignKeys: [] // or any logic to set foreign keys
                    }
                };
            } else {
                const { [tableName]: _, ...rest } = prevSelectedSchema;
                return rest;
            }
        });
    };

    const handleDescriptionChange = (tableName, fieldName, value) => {
        setDescriptions((prevDescriptions) => ({
            ...prevDescriptions,
            [`${tableName}-${fieldName}`]: value,
        }));
    };

    return (
        <div className="form-step three">
            <div className="success-response">
                <SuccessIcon className="success-icon" />
                <h3>Success! Data Source Added.</h3>
            </div>
            <h3>Vairo has populated your database schema below.</h3>
            <p>
                Please select the data tables to include &amp; add definitions as desired to help Vairo
                understand your data.
            </p>
            <div className="schema-table-list">
                {Object.keys(schema).length > 0 ? (
                    Object.keys(schema).map((tableName) => {
                        const table = schema[tableName];
                        const isSelectedTable = selectedSchema[tableName];
                        const allSelected = isSelectedTable && isSelectedTable.columns.length === table.columns.length;

                        return (
                            <div key={table.tableName} className="individual-table">
                                <table>
                                    <thead>
                                        <tr>
                                            <th>
                                                <input
                                                    type="checkbox"
                                                    checked={allSelected}
                                                    onChange={(e) => handleSelectAll(table.tableName, e.target.checked)}
                                                />
                                            </th>
                                            <th>Table Name</th>
                                            <th>Field Name</th>
                                            <th>Type to Add Description</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {table.columns.map((field) => (
                                            <tr key={`${table.tableName}-${field.name}`}>
                                                <td>
                                                    <input
                                                        type="checkbox"
                                                        checked={isSelectedTable?.columns.some(
                                                            (selectedField) => selectedField.name === field.name
                                                        )}
                                                        onChange={() =>
                                                            handleRowSelect(table.tableName, field.name)
                                                        }
                                                    />
                                                </td>
                                                <td>{table.tableName}</td>
                                                <td>{field.name}</td>
                                                <td>
                                                    <input type="text" placeholder="Type to add description"
                                                        value={
                                                            descriptions[`${table.tableName}-${field.name}`] ||
                                                            ""
                                                        }
                                                        onChange={(e) => handleDescriptionChange(table.tableName, field.name, e.target.value)}
                                                    />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        );
                    })
                ) : (
                    <p>No schema available.</p>
                )}
            </div>
        </div>
    );
}

export default StepThree;