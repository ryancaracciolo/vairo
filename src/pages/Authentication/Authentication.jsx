// Authentication.js

import React, { useState, useEffect } from 'react';
import './Authentication.css';
import logo from '../../assets/images/vairo-logo-full-white.png';
import ProductImage from '../../assets/images/auth.jpg';
import { ReactComponent as EmailIcon } from '../../assets/icons/email-icon.svg';
import { ReactComponent as PasswordIcon } from '../../assets/icons/password-icon.svg';
import { ReactComponent as NameIcon } from '../../assets/icons/name-icon.svg';
import { ReactComponent as WorkspaceNameIcon } from '../../assets/icons/team-name-icon.svg';
import ConfirmationCode from './ConfirmCode';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import { CognitoUserPool, CognitoUser, AuthenticationDetails, CognitoUserAttribute } from 'amazon-cognito-identity-js';
import axios from 'axios';

// Initialize userPool outside the component to avoid re-initialization on every render
const userPool = new CognitoUserPool({
  UserPoolId: process.env.REACT_APP_USER_POOL_ID,
  ClientId: process.env.REACT_APP_CLIENT_ID,
});

function Authentication() {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workspaceName, setWorkspaceName] = useState('');
  const [workspaceId, setWorkspaceId] = useState(null);
  const [step, setStep] = useState(1);
  const [error, setError] = useState(null);
  const [isSignIn, setIsSignIn] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const img = new Image();
    img.src = ProductImage;
    img.onload = () => setLoading(false);
  }, []);

  const fetchUserData = async (userEmail) => {
    try {
      const response = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/get-user-by-email/${userEmail}`
      );
      console.log('User fetched:', response.data);
      localStorage.setItem('user', JSON.stringify(response.data[0]));
      window.location.href = '/';
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const createUser = async (userData) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/add-user`,
        {
          name: userData.fullName,
          email: userData.email,
          workspaceId: userData.workspaceId,
          role: userData.role || 'member',
        }
      );
      console.log('User created:', response.data);
    } catch (error) {
      console.error('Error creating user:', error);
    }
  };

  const handleSignIn = () => {
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
  };

  const handleSignUp = () => {
    const attributeList = [];
    const nameAttribute = new CognitoUserAttribute({
      Name: 'name',
      Value: fullName,
    });
    attributeList.push(nameAttribute);

    userPool.signUp(
      email,
      password,
      attributeList,
      null,
      (err, result) => {
        setIsSubmitting(false);
        if (err) {
          setError(err.message || 'An error occurred during sign-up.');
          return;
        }
        console.log('Verification code sent to email');
        setStep(2); // Proceed to email confirmation
      }
    );
  };

  // Handle submission
  const handleSubmit = (e) => {
    console.log('handleSubmit', e);
    if (e && typeof e.preventDefault === 'function') {
      console.log("PREVENT DEFAULT");
      e.preventDefault();
    }
    if (isSubmitting) return;
    setIsSubmitting(true);
    setError(null);

    if (isSignIn) {
      handleSignIn();
    } else {
      if (step === 1) {
        handleSignUp();
      } else if (step === 2) {
        handleCodeSubmit({ code: e});
      } else if (step === 3) {
        handleRequestAccess();
      } else if (step === 4) {
        return;
      } else if (step === 5) {
        handleWorkspaceNameSubmit(e);
      }
    }
  };

  const getUserInvites = async () => {
    try {
      const invitesResponse = await axios.get(
        `${process.env.REACT_APP_API_BASE_URL}/api/users/get-user-invites/${email}`
      );
      if (invitesResponse.data.length > 0) {
        console.log('User invites', invitesResponse.data);
        return invitesResponse.data;
      }
      return 0;
    } catch (invitesError) {
      console.error('Error checking user invites:', invitesError);
      return -1;
    }
  }

  const checkEmailDomain = async ({ email }) => {
    const emailDomain = email.substring(email.lastIndexOf('@') + 1);
    const genericDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com', 'aol.com'];

    if (!genericDomains.includes(emailDomain)) {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_BASE_URL}/api/workspaces/get-ws-by-domain/${emailDomain}`
        );
        if (response.data.exists) {
          return response.data;
        }
      } catch (err) {
        console.error('Error checking domain workspace:', err);
        setError('An error occurred while checking workspace.');
      }
    } 
    return { exists: false };
  }

  // Handle confirmation code submission
  const handleCodeSubmit = async ({ code }) => {
    const cognitoUser = new CognitoUser({
      Username: email,
      Pool: userPool,
    });

    cognitoUser.confirmRegistration(code, true, async (err, result) => {
      if (err) {
        setError(err.message || 'An error occurred during confirmation.');
        setIsSubmitting(false);
        return;
      }
      console.log('Email confirmed');

      // Check if user is invited
      const invites = await getUserInvites();
      if (invites !== 0 && invites !== -1) {
        await handleInvitedUser(invites);
        setIsSubmitting(false);
        return;
      } else if (invites === -1) {
        setError('An error occurred. Please try again later or contact support.');
        setIsSubmitting(false);
        return;
      }

      // If no invites, check if email domain exists
      const response = await checkEmailDomain({ email });
      if (response.exists) {
        handleExistingWorkspace(response);
        return;
      } else {
        // Domain does not exist, proceed to collect workspace name
        setStep(5); // Step 5: Provide workspace name
        setIsSubmitting(false);
      }
    });
  };

  // Handle existing workspace scenario
  const handleExistingWorkspace = (data) => {
    setWorkspaceName(data.workspaceName);
    setWorkspaceId(data.workspaceId);
    setStep(3); // Proceed to request access
    setIsSubmitting(false);
  };

  const handleInvitedUser = async (invites) => {
    const wcId = invites[0].workspaceId;
    const wcName = invites[0].workspaceName;
    setWorkspaceId(wcId);
    setWorkspaceName(wcName);
    
    // Accept the invite
    try {
      const inviteAccepted = await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/workspaces/invite-accepted`, {
        email: email,
        workspaceId: wcId,
        name: fullName,
        role: 'member',
      });
      console.log('Invite accepted:', inviteAccepted);
      handleSignIn();
    } catch (err) {
      console.error('Error accepting invite:', err);
      setError('An error occurred. Please try again later or contact support.');
    }
  }

  // Handle requesting access to an existing workspace
  const handleRequestAccess = async () => {
    if (isSubmitting) return;

    setIsSubmitting(true);
    setError(null);

    try {
      // Create user in the database with status 'pending'
      await createUser({
        name: fullName,
        email: email,
        workspaceId: workspaceId,
        role: 'pending',
      });

      // Send access request to admin
      await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/workspaces/access-requests`,
        {
          email,
          fullName,
          workspaceName: workspaceName,
        }
      );
      // Proceed to access request confirmation step
      setStep(4); // Step 4: Access requested confirmation
      setIsSubmitting(false);
    } catch (err) {
      console.error('Error requesting access:', err);
      setError('An error occurred while requesting access.');
      setIsSubmitting(false);
    }
  };

  // Handle workspace name submission
  const handleWorkspaceNameSubmit = async (e) => {
    try {
      // Create the workspace
      const workspaceResponse = await axios.post(
        `${process.env.REACT_APP_API_BASE_URL}/api/workspaces/create-workspace`,
        {
          name: workspaceName,
          adminName: fullName,
          adminEmail: email,
          adminRole: 'admin',
          subscriptionType: 'free',
          domain: email.substring(email.lastIndexOf('@') + 1),
        }
      );

      // Authenticate the user
      const authenticationDetails = new AuthenticationDetails({
        Username: email,
        Password: password,
      });

      const cognitoUser = new CognitoUser({
        Username: email,
        Pool: userPool,
      });

      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: async (result) => {
          console.log('Successfully signed in:', result);
          // Fetch user data
          await fetchUserData(email);
          setIsSubmitting(false);
        },
        onFailure: (err) => {
          setError(err.message || 'An error occurred during sign-in.');
          setIsSubmitting(false);
        },
      });
    } catch (err) {
      console.error('Error setting up workspace and user:', err);
      setError('An error occurred while setting up workspace.');
      setIsSubmitting(false);
    }
  };

  // Display loading screen if needed
  if (loading) {
    return <LoadingScreen isLoading={loading} />;
  }

  return (
    <div className="login-container">
      {/* Left Side */}
      <div className="left-side">
        <img
          src={ProductImage}
          alt="Product"
          className="product-image"
          onLoad={() => setLoading(false)} // Ensure loading is set to false when image loads
        />
        <div className="left-content">
          <img src={logo} alt="Logo" className="vairo-logo" />
          <div className="left-content-text">
            <h1>Your Personal Data Analyst</h1>
            <p>Explore your data on your own, with plain English.</p>
          </div>
        </div>
      </div>
      {/* Right Side */}
      <div className="right-side">
        <div className="right-content">
          <h2>
            {isSignIn
              ? 'Log in to Vairo'
              : step === 1
              ? 'Start Using Vairo'
              : step === 2
              ? 'Verify Your Email'
              : step === 3
              ? 'Request Access'
              : step === 4
              ? 'Access Requested'
              : step === 5
              ? 'Set Up Your Workspace'
              : ''}
          </h2>
          <div className="dots">
            <div className="dot" />
            <div className="dot" />
            <div className="dot" />
          </div>
          <p>
            {step === 1
              ? isSignIn
                ? 'Please enter your email and password associated with your account.'
                : 'To begin using Vairo, please enter your full name, email, and password.'
              : step === 2
              ? 'Enter the verification code sent to your email.'
              : step === 3
              ? `A workspace named "${workspaceName}" already exists for your email domain. Would you like to request access from the admin?`
              : step === 4
              ? 'Your request for access has been sent to the workspace admin. We will notify you when your request is approved.'
              : step === 5
              ? 'Please enter your workspace name to complete the registration.'
              : ''}
          </p>

          {/* Step 1: Sign Up Form */}
          {step === 1 && (
            <form onSubmit={handleSubmit}>
              {!isSignIn && (
                <div className="input-wrapper">
                  <NameIcon className="email-icon" />
                  <input
                    type="text"
                    className="email-input"
                    placeholder="Full name"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    required
                  />
                </div>
              )}
              <div className="input-wrapper">
                <EmailIcon className="email-icon" />
                <input
                  type="email"
                  className="email-input"
                  placeholder="Email address"
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
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : isSignIn ? 'Log In' : 'Sign Up'}
              </button>
            </form>
          )}

          {/* Step 2: Email Confirmation */}
          {step === 2 && !isSignIn && (
            <ConfirmationCode onConfirm={handleSubmit} />
          )}

          {/* Step 3: Request Access */}
          {step === 3 && !isSignIn && workspaceId && (
            <div>
              <button
                className="submit-btn"
                disabled={isSubmitting}
                onClick={handleSubmit}
              >
                {isSubmitting ? 'Processing...' : 'Request Access'}
              </button>
            </div>
          )}

          {/* Step 4: Access Requested Confirmation */}
          {step === 4 && !isSignIn && (
            <div>
              <p>Your request for access has been sent to the workspace admin.</p>
              <p>We will notify you when your request is approved.</p>
            </div>
          )}

          {/* Step 5: Provide Workspace Name */}
          {step === 5 && !isSignIn && (
            <form onSubmit={handleSubmit}>
              <div className="input-wrapper workspace">
                <WorkspaceNameIcon className="email-icon" />
                <input
                  type="text"
                  className="email-input"
                  placeholder="Workspace name"
                  value={workspaceName}
                  onChange={(e) => setWorkspaceName(e.target.value)}
                  required
                />
              </div>
              <button
                type="submit"
                className="submit-btn"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Processing...' : 'Continue'}
              </button>
            </form>
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
            {isSignIn
              ? 'Don’t have an account? Sign Up'
              : 'Already have an account? Log In'}
          </button>

          <p className="support-text">
            Have questions? Please contact{' '}
            <a href="mailto:ryan@vairo.ai">ryan@vairo.ai</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Authentication;