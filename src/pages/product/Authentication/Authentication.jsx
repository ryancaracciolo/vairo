// Authentication.js
import React, { useState } from 'react';
import './Authentication.css';
import logo from '../../../assets/images/vairo-logo-whiteBlue.png';
import { ReactComponent as EmailIcon } from '../../../assets/icons/email-icon.svg';
import { ReactComponent as PasswordIcon } from '../../../assets/icons/password-icon.svg';
import ConfirmationCode from './ConfirmCode';
import LoadingScreen from '../../../components/product/LoadingScreen/LoadingScreen';
import { CognitoUserPool, CognitoUser, AuthenticationDetails } from 'amazon-cognito-identity-js';
import axios from 'axios';

// Initialize userPool outside the component to avoid re-initialization on every render
const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_USER_POOL_ID,
  ClientId: process.env.REACT_APP_CLIENT_ID,
});

function Authentication() {
  // State variables
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [isSignIn, setIsSignIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(false);

  const fetchUserData = async (userEmail) => {
    try {
      const response = await axios.get(`${process.env.REACT_APP_API_BASE_URL}/api/users/get-user-by-email/${userEmail}`);
      console.log('User fetched:', response.data);
      localStorage.setItem('user', JSON.stringify(response.data[0]));
      window.location.href = '/app';
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const createUser = async (userData) => {
    try {
      const response = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/users/add-user`, userData);
      console.log('User created:', response.data);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  // Handle email and password submission
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    if (isSignIn) {
      // Sign-in flow
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          console.log('Successfully signed in:', result);
          fetchUserData(email); // Fetch user data
          setIsSubmitting(false);
        },
        onFailure: (err) => {
          setError(err.message || 'An error occurred during sign-in.');
          setIsSubmitting(false);
        },
      });
    } else {
      // Sign-up flow
      userPool.signUp(email, password, [], null, (err, result) => {
        setIsSubmitting(false);
        if (err) {
          setError(err.message || 'An error occurred during sign-up.');
          return;
        }
        console.log('Verification code sent to email');
        setStep(2);
      });
    }
  };

  // Handle confirmation code submission
  const handleCodeSubmit = (code) => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.confirmRegistration(code, true, (err, result) => {
      if (err) {
        setError(err.message || 'An error occurred during confirmation.');
        setIsSubmitting(false);
        return;
      }
      console.log('Email confirmed');

      // Create user in the database
      createUser({ email });

      // Automatically sign in the user after confirmation
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          console.log('Successfully signed in:', result);
          fetchUserData(email); // Fetch user data
          setIsSubmitting(false);
        },
        onFailure: (err) => {
          setError(err.message || 'An error occurred during sign-in.');
          setIsSubmitting(false);
        },
      });
    });
  };

  // Display loading screen if needed
  if (loading) {
    return <LoadingScreen isLoading={loading} />;
  }

  return (
    <div className="login-container">
      {/* Left Side */}
      <div className="left-side">
        <div className="left-content">
          <img src={logo} alt="Logo" className="vairo-logo" />
          <div>
            <h1>Your Personal Data Analyst</h1>
            <p>Enable your business users to explore data on their own, with plain English.</p>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="right-side">
        <div className="right-content">
          <h2>{isSignIn ? 'Log in to Filo' : 'Start Using Filo'}</h2>
          <div className="dots">
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </div>
          <p>
            {step === 1
              ? isSignIn
                ? 'Please enter your email and password associated with your account.'
                : 'To begin using Filo, please enter your business email address.'
              : 'Enter the verification code sent to your email.'}
          </p>

          {step === 1 && (
            <form onSubmit={handleEmailSubmit}>
              <div className="input-wrapper">
                <EmailIcon className="email-icon" />
                <input
                  type="email"
                  className="email-input"
                  placeholder="Enter email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="input-wrapper">
                <PasswordIcon className="email-icon" />
                <input
                  type="password"
                  className="email-input"
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? 'Processing...' : isSignIn ? 'Log In' : 'Sign Up'}
              </button>
            </form>
          )}

          {step === 2 && !isSignIn && (
            <ConfirmationCode onConfirm={handleCodeSubmit} />
          )}

          {error && <p className="error-message">{error}</p>}

          <button
            className="toggle-auth-mode"
            onClick={() => {
              setIsSignIn(!isSignIn);
              setError(null);
              setStep(1);
            }}
          >
            {isSignIn ? 'Don’t have an account? Sign Up' : 'Already have an account? Log In'}
          </button>

          <p className="support-text">
            Have questions? Please contact <a href="mailto:ryan@vairo.co">ryan@vairo.co</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Authentication;
