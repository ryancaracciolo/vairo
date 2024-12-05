import React, { useState, useContext } from 'react';
import { UserContext, WorkspaceContext } from '../../objects/Context';
import './Upgrade.css';
import { useNavigate, useSearchParams } from 'react-router-dom';

import { ReactComponent as CheckIcon } from '../../assets/icons/checkmark-icon.svg';

const Upgrade = () => {
    const { user } = useContext(UserContext);
    const { workspace, setWorkspace } = useContext(WorkspaceContext);
    const [activePaymentType, setActivePaymentType] = useState('monthly');
    const navigate = useNavigate();
    //const [searchParams, setSearchParams] = useSearchParams();
    //const selectedPlan = searchParams.get("plan") || "base_monthly";
    
    const starterFeatures = [
        'Natural Languange Search',
        'Data Sources & Threads',
        'Visualizations',
        'Email Support'
    ]

    const starterLimits = [
        '1 Seat',
        '2 Data Sources',
        '5 Threads',
        '20 Messages / Day'
    ]

    const baseFeatures = [
        'Everything in Starter +',
        'Team Collaboration',
        'AI-assisted Launch',
        'Phone Support'
    ]

    const baseLimits = [
        'Unlimited Seats',
        'Unlimited Data Sources',
        'Unlimited Threads',
        'Unlimited Messages / Day'
    ]

    const comingSoonFeatures = [
        'Everything in Base +',
        'Build dashboards with natural language',
        'What-if ML Forecasting',
        'Automated insights & analysis',
        'Premium AI/ML models'
    ]

    const handlePlanSelect = (plan) => {
        const p = plan + '_' + activePaymentType;
        console.log(p);
        navigate(`/upgrade/payment-process/${p}`);
    }

    return (
        <div className='upgrade-container'>
            <div className='upgrade-header'>
                <h1>Choose a plan that's right for you.</h1>
                <div className='payment-type-toggle'>
                    <button className={`option ${activePaymentType === 'monthly' ? 'active' : ''}`} onClick={() => setActivePaymentType('monthly')}>Monthly Billing</button>
                    <button className={`option ${activePaymentType === 'annual' ? 'active' : ''}`} onClick={() => setActivePaymentType('annual')}>Yearly (Save up to 30%)</button>
                </div>
            </div>
            <div className='upgrade-content'>
                <div className='plan-card'>
                    <div className='plan-card-header'>
                        <h2>Starter</h2>
                        <p className='description'>What you need to get started.</p>
                        <div className='plan-card-price'>
                            <p>
                                <span className='price-amount'>{activePaymentType === 'annual' ? '$99' : '$9'}</span> 
                                <span className='price-duration'> / {activePaymentType === 'annual' ? 'year (save 20%)' : 'month'}</span>
                            </p>
                        </div>
                        <hr/>
                    </div>
                    <div className='plan-card-content'>
                        <h3>Features</h3>
                        {starterFeatures.map((feature, index) => (
                            <div className='content-item' key={`starter-feature-${index}`}>
                                <CheckIcon className='icon'/>
                                <p>{feature}</p>
                            </div>
                        ))}
                        <h3>Limits</h3>
                        {starterLimits.map((limit, index) => (
                            <div className='content-item' key={`starter-limit-${index}`}>
                                <CheckIcon className='icon'/>
                                <p>{limit}</p>
                            </div>
                        ))}
                    </div>
                    <div className='plan-card-footer'>
                        <button className='select-plan' onClick={() => handlePlanSelect('starter')}>{workspace.subscriptionType === 'starter' ? 'Current Plan' : 'Select'}</button>
                    </div>
                </div>
                <div className='plan-card base'>
                    <div className='plan-card-header'>
                        <h2>Base <span className='most-popular'>(Most Popular)</span></h2>
                        <p className='description'>For you and your team, with unlimited usage and support.</p>
                        <div className='plan-card-price'>
                            <p>
                                <span className='price-amount'>{activePaymentType === 'annual' ? '$499' : '$49'}</span> 
                                <span className='price-duration'> / {activePaymentType === 'annual' ? 'year (save 20%)' : 'month'}</span>
                            </p>
                        </div>
                        <hr/>
                    </div>
                    <div className='plan-card-content'>
                        <h3>Features</h3>
                        {baseFeatures.map((feature, index) => (
                            <div className='content-item' key={`base-feature-${index}`}>
                                <CheckIcon className='icon'/>
                                <p>{feature}</p>
                            </div>
                        ))}
                        <h3>Limits</h3>
                        {baseLimits.map((limit, index) => (
                            <div className='content-item' key={`base-limit-${index}`}>
                                <CheckIcon className='icon'/>
                                <p>{limit}</p>
                            </div>
                        ))}
                    </div>
                    <div className='plan-card-footer'>
                        <button className='select-plan base' onClick={() => handlePlanSelect('base')}>{workspace.subscriptionType === 'base' ? 'Current Plan' : 'Select'}</button>
                    </div>
                </div>
                <div className='plan-card'>
                    <div className='plan-card-header'>
                        <h2>Coming Soon!</h2>
                        <p className='description'>Enhanced features for your team.</p>
                        <div className='plan-card-price'></div>
                        <hr/>
                    </div>
                    <div className='plan-card-content'>
                        <h3>Features</h3>
                        {comingSoonFeatures.map((feature, index) => (
                            <div className='content-item' key={`coming-soon-feature-${index}`}>
                                <CheckIcon className='icon'/>
                                <p>{feature}</p>
                            </div>
                        ))}
                    </div>
                    <div className='plan-card-footer'>
                        <button className='select-plan soon'>Coming Soon</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Upgrade;
