import React, { useState } from 'react';
import PaymentProcess from './PaymentProcess';

const StepOne = () => {
    const [amount, setAmount] = useState('');
    const [paymentStatus, setPaymentStatus] = useState(null);

    // Handle form submission
    const handleSubmit = (event) => {
        event.preventDefault();
        // Logic to process payment
        console.log(`Processing payment of $${amount}`);
        setPaymentStatus('Payment processed successfully!');
    };

    return (
        <div>
            <h1>Upgrade Payments</h1>
            <form onSubmit={handleSubmit}>
                <label>
                    Amount:
                    <input
                        type="number"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                    />
                </label>
                <button type="submit">Submit Payment</button>
            </form>
            {paymentStatus && <p>{paymentStatus}</p>}
        </div>
    );
};

export default StepOne;