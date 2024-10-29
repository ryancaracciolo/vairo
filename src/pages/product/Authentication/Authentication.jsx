import React, { useState, useEffect } from 'react';
import './Authentication.css';
import logo from '../../../assets/images/vairo-logo-light.png';
import { ReactComponent as EmailIcon } from '../../../assets/icons/email-icon.svg';
import { ReactComponent as PasswordIcon } from '../../../assets/icons/password-icon.svg';
import ConfirmationCode from './ConfirmCode';
import LoadingScreen from '../../../components/product/LoadingScreen/LoadingScreen';
import axios from 'axios';


function Authentication({setBusiness}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [step, setStep] = useState(1); // Step 1: Enter email, Step 2: Enter code
  const [error, setError] = useState(null);
  const [isSignIn, setIsSignIn] = useState(true); // Toggle between sign-in and sign-up
  const [isSubmitting, setIsSubmitting] = useState(false); // Prevent multiple submissions
  const [loading, setLoading] = useState(true); // loading state to track authentication check


  const fetchBusiness = async (email) => {
    // try {
    //     const response = await axios.post((process.env.REACT_APP_API_BASE_URL)+'/api/businesses/get-business-byemail',{email});
    //     console.log("response!: "+response.data)
    //     localStorage.setItem('business', JSON.stringify(response.data));
    //     setBusiness(response.data);
    // } catch (err) {
    //     console.error('Error fetching business:', err.response?.data || err.message);
    //     setError(err.response?.data?.error || 'An error occurred while fetching business.');
    //     console.log(err);
    // } finally {
    //     setLoading(false);
    // }
  };

  const checkExistence = async (email) => {
    // try {
    //     const response = await axios.post((process.env.REACT_APP_API_BASE_URL)+'/api/businesses/check-existence',{email});
    //     return response.data?.exists
    // } catch (err) {
    //     console.error('Error confirming email:', err.response?.data || err.message);
    //     return true;
    // }
  };

  useEffect(() => {
    // // Check if a user is already authenticated
    // getCurrentUser()
    //   .then(user => {
    //     console.log('User Found');
    //     fetchBusiness(user.signInDetails.loginId)
    //   })
    //   .catch(() => {
    //     console.log('No user logged in');
    //     setLoading(false); // No user logged in, stop loading
    //   });
  }, []);

  const handleEmailSubmit = async (e) => {
    // console.log('Email Submit');
    // e.preventDefault();
    // setError(null);
  
    // if (isSubmitting) return; // Prevent multiple submissions
    // setIsSubmitting(true);
  
    // try {
    //   if (isSignIn) {
    //     // Sign in flow
    //     await signIn({ username: email, password });
    //     const user = await getCurrentUser();
    //     console.log('Successfully signed in:', { user });
    //     fetchBusiness(user.signInDetails.loginId);
    //   } else {
    //     // Sign up flow
    //     await handleSignUpFlow();
    //   }
    // } catch (error) {
    //   setError(error.message || 'An error occurred during the process.');
    // } finally {
    //   setIsSubmitting(false); // Enable submitting again
    // }
  };
  
  const handleSignUpFlow = async () => {
    // const emailExists = await checkExistence(email);
  
    // if (!emailExists) {
    //   setError('This email is not associated with a Chamber account.');
    //   setIsSubmitting(false); // Ensure submitting is re-enabled after error
    //   return; // Stop the sign-up process if the email exists
    // }
  
    // // Proceed with sign-up if email exists
    // await signUp({
    //   username: email,
    //   password,
    //   attributes: { email }, // User attribute
    // });
  
    // console.log('Verification code sent to email');
    // setStep(2); // Move to step 2: verification code
  };

  const handleCodeSubmit = async (code) => {
    // setError(null);

    // if (isSubmitting) return; // Prevent multiple submissions
    // setIsSubmitting(true);

    // try {
    //   // Confirm sign-up
    //   await confirmSignUp({
    //     username: email,
    //     confirmationCode: code
    //   });
    //   console.log("Email confirmed");

    //   // Automatically sign the user in after confirmation
    //   await signIn({ username: email, password });
    //   const user = await getCurrentUser();
    //   console.log("Successfully signed in");
    //   fetchBusiness(user.signInDetails.loginId);
    //   //navigate('/app/partnerships'); // Redirect after login
    // } catch (error) {
    //   setError(error.message);
    // } finally {
    //   setIsSubmitting(false);
    // }
  };

  if (loading) {
    console.log('Loading...');
    return <LoadingScreen isLoading={loading}/>;
  }

  return (
    <div className="login-container">
      <div className="left-side">
        <div className="left-content">
          <img src={logo} alt="Filo Logo" className="filo-logo" />
          <h1>Welcome to Filo!</h1>
          <p>
            Filo has partnered with your Chamber to help unlock new opportunities for you. 
            Your Chamber network is powerful, and we are here to help you leverage it to collaborate, grow, and thrive.
          </p>
          <hr />
          <h2>Ready to get started?</h2>
          <p className='sub-p'>
            {isSignIn
              ? 'Log in with your Chamber email to access your network and explore everything Filo has to offer.'
              : 'Sign up with your Chamber email to access your network and explore everything Filo has to offer.'}
          </p>
        </div>
      </div>

      <div className="right-side">
        <div className="right-content">
          <h2>{isSignIn ? 'Log in to Filo' : 'Start your Journey with Filo'}</h2>
          <div className='dots'>
            <div className='dot'></div>
            <div className='dot'></div>
            <div className='dot'></div>
          </div>
          <p>
            {step === 1
              ? `${isSignIn ? 'Please enter your email and password associated with your account' : 'To begin using Filo, please enter your business email address associated with your Chamber of Commerce Membership'}`
              : 'Enter the verification code sent to your email.'}
          </p>

          {step === 1 && (
            <form onSubmit={handleEmailSubmit}>
              <div className='input-wrapper'>
                <EmailIcon className='email-icon'/>
                <input
                  type="email"
                  className="email-input"
                  placeholder="Enter email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className='input-wrapper'>
                <PasswordIcon className='email-icon'/>
                <input
                  type="password"
                  className="email-input"
                  placeholder="Enter password..."
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <button type="submit" className="submit-btn">
                {isSignIn ? 'Log In' : 'Sign Up'}
              </button>
            </form>
          )}

          {step === 2 && !isSignIn && (
            <ConfirmationCode onConfirm={handleCodeSubmit} />
          )}

          {error && <p className="error-message">{error}</p>}

          <button className="toggle-auth-mode" onClick={() => setIsSignIn(!isSignIn)}>
            {isSignIn ? 'Don’t have an account? Sign Up' : 'Already have an account? Log In'}
          </button>

          <p className="support-text">
            Have questions? Please contact <a href="mailto:ryan@filosolutions.co">ryan@filosolutions.co</a>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Authentication;
