import React from 'react';
import './Row.css';
import CircleInitials from '../CircleInitials/CircleInitials';
import postgresLogo from '../../assets/images/integrations/postgres.png';
import quickbooksLogo from '../../assets/images/integrations/quickbooks.png';
import excelLogo from '../../assets/images/integrations/excel.png';
import { ReactComponent as AddIcon } from '../../assets/icons/add-noFill-icon.svg';

const Row = ({dataSourceData, updateDataSource, dataSourceSelected, checked}) => {
    const formattedDate = new Date(dataSourceData.createdAt).toLocaleDateString('en-US');

    // Example list of initials and colors
    const colors = [
        "var(--blue-light-color)",
        "var(--purple-light-color)",
        "lightcoral"
    ];

    // Mapping of data source types to image URLs
    const typeImages = {
        "PostgreSQL": postgresLogo,
        "Quickbooks": quickbooksLogo,
        "Excel": excelLogo
    };

    return (
        <tr className="data-source-row">
            <td><input type="checkbox" checked={checked} onChange={() => dataSourceSelected({dataSource: dataSourceData})} /></td>
            <td>{dataSourceData.name}</td>
            <td>
                <div className="datasource-type">
                    <img src={typeImages[dataSourceData.dataSourceType]} alt={dataSourceData.dataSourceType} />
                    <p>{dataSourceData.dataSourceType}</p>
                </div>
            </td>
            <td>{formattedDate}</td>
            <td>
                <div className="user-container">
                    {dataSourceData.usersWithAccess.slice(0, 3).map((user, index) => (
                        <CircleInitials 
                            key={user.userId} 
                            classN="user-initials" 
                            text={user.name} 
                            style={{ backgroundColor: colors[index % colors.length] }} 
                        />
                    ))}
                    {dataSourceData.usersWithAccess.length > 3 ? (
                        <h4>+{dataSourceData.usersWithAccess.length - 3}</h4>
                    ) : (
                        <button className="add-users-button">
                            <AddIcon className='add-icon'/>
                        </button>
                    )}
                </div>
            </td>
            <td>
                <div className="status-container">
                    <div className={`status-indicator ${dataSourceData.status}`}></div>
                    {dataSourceData.status === "pending" ? "Pending" : "Connected"}
                </div>
            </td>
        </tr>
    );
};

export default Row;