import React, {useState, useEffect, useContext} from 'react';
import { UserContext } from '../../../objects/Context';
import './DataSources.css';
import Row from '../../../components/product/Row/Row';
import LoadingScreen from '../../../components/product/LoadingScreen/LoadingScreen';
import {ReactComponent as EditIcon} from '../../../assets/icons/edit-icon.svg'
import {ReactComponent as AddIcon} from '../../../assets/icons/add-noFill-icon.svg'
import {ReactComponent as CloseIcon} from '../../../assets/icons/close-icon.svg'

import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function DataSources() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState('All Referrals');
    const [selectAll, setSelectAll] = useState(false);
    const [selectedDataSources, setSelectedDataSources] = useState({});
    const [itemSelected, setItemSelected] = useState(false);
    const [dataSources, setDataSources] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDataSources = async () => {
            try {
                const response = await axios.get(`/api/users/get-data-sources/${user.id}`);
                setDataSources(response.data);
            } catch (error) {
                console.error('Error fetching data sources:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDataSources();
    }, []);

    const updateDataSourceList = ({dataSourceId, newStatus}) => {
        setDataSources((prevDataSources) => 
            prevDataSources.map((dataSource) => 
                dataSource.id === dataSourceId ? { ...dataSource, status: newStatus } : dataSource
            )
        );
    }

    const dataSourceSelected = ({ dataSource }) => {
        setSelectedDataSources((prevSelected) => {
            const updatedDataSources = {
                ...prevSelected,
                [dataSource.id]: !prevSelected[dataSource.id],
            };
            setItemSelected(Object.values(updatedDataSources).some((isSelected) => isSelected));
            return updatedDataSources;
        });
    };

    const allSelected = () => {
        setSelectAll(!selectAll);
        const newSelectedDataSources = {};
        dataSources.forEach((dataSource) => {
            newSelectedDataSources[dataSource.id] = !selectAll;
        });
        setSelectedDataSources(newSelectedDataSources);
        setItemSelected(Object.values(newSelectedDataSources).some((isSelected) => isSelected));
    }

    const deleteSelectedDataSources = async () => {
        const idsToDelete = Object.keys(selectedDataSources).filter(id => selectedDataSources[id]);
        
        if (idsToDelete.length === 0) return;

        // Optimistically update the UI
        setDataSources((prevDataSources) =>
            prevDataSources.filter((dataSource) => !idsToDelete.includes(dataSource.id))
        );

        try {
            await axios.post('/api/data-sources/remove-data-sources', { ids: idsToDelete, userId: user.id });
        } catch (error) {
            console.error('Error deleting data sources:', error);
            // Revert UI changes if the request fails
            setDataSources((prevDataSources) => [
                ...prevDataSources,
                ...dataSources.filter((dataSource) => idsToDelete.includes(dataSource.id))
            ]);
        } finally {
            setSelectedDataSources({});
            setItemSelected(false);
            setSelectAll(false);
        }
    };

    const createDataSource = () => {
        navigate('/app/data-sources/add');
    };

    const handleEditClick = (dataSource) => {
        navigate(`/app/data-sources/edit/${dataSource}`);
    };

    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
          document.body.style.overflow = '';
        };
    }, []);

    return (
        <div className="data-sources-wrapper">
            {loading ? (
                <LoadingScreen />
            ) : (
                <div className="data-sources-content">
                    <div className='detail-header'>
                        <h2>{activeTab}</h2>
                        <div className='detail-header-actions'>
                            <div onClick={itemSelected ? () => handleEditClick(selectedDataSources[0]) : null} className={'header-action edit'+(itemSelected ? ' active' : '')}>
                                <EditIcon className={'icon edit'+(itemSelected ? ' active' : '')} />
                                <span className={(itemSelected ? ' active' : '')}>Edit</span>
                            </div>
                            <div onClick={itemSelected ? deleteSelectedDataSources : null} className={'header-action delete'+(itemSelected ? ' active' : '')}>
                                <CloseIcon className={'icon delete'+(itemSelected ? ' active' : '')} />
                                <span className={(itemSelected ? ' active' : '')}>Remove</span>
                            </div>
                            <div onClick={createDataSource} className='header-action add'>
                                <AddIcon className={'icon add'} />
                                <span>Add Data Source</span>
                            </div>
                        </div>
                    </div>
                    <table className="data-sources-table">
                        <thead>
                            <tr>
                                <th><input type="checkbox" checked={selectAll} onChange={() => allSelected()}/></th>
                                <th>Connection Name</th>
                                <th>Data Source</th>
                                <th>Date Created</th>
                                <th>User Access</th>
                                <th>Host</th>
                                <th>Port</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {dataSources.length === 0 ? (
                                <tr>
                                    <td colSpan="7" className="no-data-sources">No data sources found. Add a data source to get started!</td>
                                </tr>
                            ) : (
                                dataSources.map(dataSource => (
                                    <Row key={dataSource.id} dataSourceData={dataSource} updateDataSource={updateDataSourceList} dataSourceSelected={dataSourceSelected} checked={selectedDataSources[dataSource.id]} />
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default DataSources;