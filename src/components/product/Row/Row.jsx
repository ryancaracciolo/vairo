import React from 'react';
import './Row.css';
import CircleInitials from '../CircleInitials/CircleInitials';
import StatusButton from './StatusButton';

const Row = ({dataSourceData, updateDataSource, dataSourceSelected, checked}) => {
    const formattedDate = new Date(dataSourceData.createdAt).toLocaleDateString('en-US');

    // Example list of initials and colors
    const initialsList = [
        { text: "R C", color: "var(--blue-medium-color)" },
        { text: "E J", color: "var(--purple-color)" },
        { text: "M W", color: "red" }
    ];

    return (
        <tr>
            <td><input type="checkbox" checked={checked} onChange={() => dataSourceSelected({dataSource: dataSourceData})} /></td>
            <td>{dataSourceData.name}</td>
            <td>{dataSourceData.dataSourceType}</td>
            <td>{formattedDate}</td>
            <td>
                <div className="user-container">
                    {initialsList.map((initial, index) => (
                        <CircleInitials 
                            key={index} 
                            classN="user-initials" 
                            text={initial.text} 
                            style={{ backgroundColor: initial.color }} 
                        />
                    ))}
                    <h4>+3</h4>
                </div>
            </td>
            <td>{dataSourceData.host}</td>
            <td>{dataSourceData.port}</td>
            <td>
                <div className="status-container">
                    <div className="status-indicator"></div>
                    Active
                </div>
            </td>
        </tr>
    );
};

export default Row;