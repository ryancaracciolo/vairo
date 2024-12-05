import React, { useState, useEffect, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { ReactComponent as CheckIcon } from '../../../assets/icons/checkmark-icon.svg';
import { WorkspaceContext } from '../../../objects/Context';
import axios from 'axios';
import './StripeReturn.css';

const StripeReturn = () => {
    const [status, setStatus] = useState(null);
    const [customerEmail, setCustomerEmail] = useState('');
    const { workspace, setWorkspace } = useContext(WorkspaceContext);


    const getSubType = (plan) => {
        if (plan) {
            return plan.split('_')[0];
        }
        return null;
    }

    useEffect(() => {
      const queryString = window.location.search;
      const urlParams = new URLSearchParams(queryString);
      const plan = urlParams.get('plan');
      const sessionId = urlParams.get('session_id');
      console.log(sessionId);

      axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/stripe/session-status?session_id=${sessionId}`)
        .then((response) => {
          setStatus(response.data.status);
          setCustomerEmail(response.data.customer_email);
        })
        .catch((error) => {
          console.error('Error fetching session status:', error);
        });

      if (plan !== null) {
        const newSubType = getSubType(plan);
        
        setWorkspace((prevWorkspace) => ({
          ...prevWorkspace,
          subscriptionType: newSubType,
        }));
      }
    }, []);

    if (status === 'open') {
      return (
        <Navigate to={`/upgrade/payment-process/`} />
      )
    }
  
    if (status === 'complete') {
      return (
        <div className="success-container" id="success">
          <CheckIcon className="icon"/>
          <h2 className="title">You have successfully Subscribed!</h2>
          <p className="text">
            We appreciate your business! A confirmation email will be sent to {customerEmail}.
            <br />
            If you have any questions, please email <a href="mailto:hello@vairo.ai">hello@vairo.ai</a>.
          </p>
          <a href="/" className="return-button">Go to App</a>
        </div>
      )
    }  
  }

export default StripeReturn;