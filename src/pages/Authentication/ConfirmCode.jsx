import React, { useState, useRef } from 'react';
import './ConfirmCode.css';

const ConfirmationCode = ({onConfirm}) => {
  const [code, setCode] = useState(["", "", "", "", "", ""]);
  const inputsRef = useRef([]);

  const handleChange = (e, index) => {
    const value = e.target.value;

    if (/^[0-9]?$/.test(value)) { // Allow only digits
      let newCode = [...code];
      newCode[index] = value;
      setCode(newCode);

      // Move to the next input if there's a next one
      if (value && index < 5) {
        inputsRef.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // Move to the previous input on backspace if the current one is empty
      inputsRef.current[index - 1].focus();
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const confirmationCode = code.join(''); // This is your 6-digit code
    console.log(confirmationCode);

    if (onConfirm) {
        onConfirm(confirmationCode); // Call the passed-in function with the confirmation code
      }
  };

  return (
    <div className="confirmation-code-container">
      <form onSubmit={handleSubmit}>
        <div className="code-inputs">
          {code.map((digit, index) => (
            <input
              key={index}
              type="text"
              maxLength="1"
              value={digit}
              onChange={(e) => handleChange(e, index)}
              onKeyDown={(e) => handleKeyDown(e, index)}
              ref={(el) => (inputsRef.current[index] = el)} // Store each input ref
              className="code-input"
            />
          ))}
        </div>
        <button type="submit" className="submit-btn">Submit</button>
      </form>
    </div>
  );
};

export default ConfirmationCode;
