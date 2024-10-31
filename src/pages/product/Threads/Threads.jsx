import React, { useState, useRef, useEffect } from 'react';
import './Threads.css';
import LoadingScreen from '../../../components/product/LoadingScreen/LoadingScreen';
import vairoLogo from '../../../assets/images/stars.png';
import Avatar from '../../../components/product/CircleInitials/CircleInitials';

function Threads() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [messages, setMessages] = useState([
        {
            text: "Hello! How can I help you today?",
            sender: 'receiver',
            timestamp: new Date().getTime()
        }
    ]);
    const [inputValue, setInputValue] = useState('');

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = () => {
        if (inputValue.trim()) {
            const newMessage = {
                text: inputValue.trim(),
                sender: 'user',
                timestamp: new Date().getTime()
            };
            setMessages([...messages, newMessage]);
            setInputValue('');
        }
    };

    if (loading) {
        return <LoadingScreen isLoading={loading} />;
    } else if (error) {
        return <div>Error: {error}</div>;
    }

    return (
        <div className="threads-wrapper">
            <div className="threads-content">
                <div className="messages">
                    {messages.map((message, index) => {
                        const isUser = message.sender === 'user';
                        return (
                            <div 
                                key={message.timestamp || index} 
                                className={`message ${isUser ? 'sender' : 'receiver'}`}
                            >
                                {!isUser && (
                                    <div className="avatar">
                                        <img src={vairoLogo} alt="Vairo Logo" />
                                    </div>
                                )}
                                <div className="message-bubble">{message.text}</div>
                                {isUser && (
                                    <div className="avatar">
                                        <Avatar businessName={"John Doe"} fontSize='12px'/>
                                    </div>
                                )}
                            </div>
                        );
                    })}
                    <div ref={messagesEndRef} />
                </div>
                <div className="message-input">
                    <input
                        type="text"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder="Type a message..."
                        onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                    />
                    <button onClick={handleSendMessage}>Send</button>
                </div>
            </div>
        </div>
    );
};

export default Threads;