import React, {useState, useEffect} from 'react';
import './Dashboard.css';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import axios from 'axios';

function Dashboard() {
    const [data, setData] = useState([]);

     useEffect(() => {
       axios.get('/api/businesses')
         .then(response => {
           setData(response.data);
         })
         .catch(error => console.error('Error fetching data:', error));
     }, []);

     return (
       <div>
         <h1>Data from Backend</h1>
         <ul>
           {data.map((item, index) => (
             <li key={index}>{JSON.stringify(item)}</li>
           ))}
         </ul>
       </div>
     );
};

export default Dashboard;