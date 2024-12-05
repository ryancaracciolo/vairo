// src/pages/product/DataSources/AddDataSource.jsx
import React, { useState, useContext, useEffect, useCallback } from 'react';
import { UserContext } from '../../../objects/Context';
import { useNavigate, useParams } from 'react-router-dom';
import {loadStripe} from '@stripe/stripe-js';
import { EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import { EmbeddedCheckout } from '@stripe/react-stripe-js'; // Import the EmbeddedCheckout component
import axios from 'axios';
import './PaymentProcess.css';
import LoadingScreen from '../../../components/LoadingScreen/LoadingScreen'; // Import the LoadingScreen component

const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY, {
});


function PaymentProcess() {
    const { user } = useContext(UserContext);
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    const { plan } = useParams();

    // Debugging: Log the plan parameter
    useEffect(() => {
        console.log("Plan parameter:", plan);
    }, [plan]);

    const fetchClientSecret = useCallback(async () => {
        try {
          console.log("IN fetchClientSecret:", plan);
          const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/stripe/create-checkout-session`, { plan: plan, workspaceId: user.workspaceId });
          console.log(response.data.clientSecret);
          return response.data.clientSecret;
        } catch (error) {
          console.error('Error fetching client secret:', error);
          return null;
        }
    }, []);

    const opt = { 
        fetchClientSecret
    };

    return (
        <div className="payment-process-wrapper">
            <EmbeddedCheckoutProvider
                stripe={stripePromise}
                options={opt}
            >
                <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
        </div>
    );
}

export default PaymentProcess;