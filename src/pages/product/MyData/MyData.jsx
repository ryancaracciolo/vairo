import React from 'react';
import './MyData.css';

const MyData = () => {
  return (
    <div className="mydata-container">
      <div className="mydata-header">
        <h1>My Data</h1>
      </div>
      <div className="mydata-content">
        <div className="mydata-card">
          <h2>Overview</h2>
          <p>Welcome to your data dashboard</p>
        </div>
      </div>
    </div>
  );
};

export default MyData;
