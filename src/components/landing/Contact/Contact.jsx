import React from 'react';
import './Contact.css';

const Contact = () => {
    return (
        <div className="contact-section">
            <div className="contact-content">
                <div className="contact-info">
                    <h2>We'd Love to Hear from You</h2>
                    <h3>Get in touch with our team to learn more about how Vairo can support you.</h3>
                    <div className='contact-detail'>
                        <div>
                            <h4>For Business Development:</h4>
                            <p style={{"whiteSpace": "pre"}}>Evan Caracciolo</p>
                            <p style={{"whiteSpace": "pre"}}>evan@vairo.ai</p>
                            <p style={{"whiteSpace": "pre"}}>(207) 890-4031</p>
                        </div>
                        <div>
                            <h4>For Product & Technology:</h4>
                            <p style={{"whiteSpace": "pre"}}>Ryan Caracciolo</p>
                            <p style={{"whiteSpace": "pre"}}>ryan@vairo.ai</p>
                            <p style={{"whiteSpace": "pre"}}>(207) 890-6680</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
