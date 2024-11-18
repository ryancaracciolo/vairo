import React from 'react';
import ReactDOM from 'react-dom';
import './Popup.css';

const Popup = ({ content, onClose }) => {

  // Render the popup in the body using React Portal
  return ReactDOM.createPortal(
    <div className="popup-overlay" onClick={(e) => {
      if (e.target === e.currentTarget) {
          onClose();
      }
    }}>
      {content}
    </div>,
    document.body // Mounting the popup at the root level
  );
};

export default Popup;
