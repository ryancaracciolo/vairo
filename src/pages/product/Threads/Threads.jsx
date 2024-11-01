import React, { useState, useRef, useEffect } from 'react';
import './Threads.css';
import LoadingScreen from '../../../components/product/LoadingScreen/LoadingScreen';
import vairoLogo from '../../../assets/images/stars.png';
import Avatar from '../../../components/product/CircleInitials/CircleInitials';

function Threads() {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState('');
    const [currentThreadId, setCurrentThreadId] = useState(null);

    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        const searchParams = new URLSearchParams(window.location.search);
        const threadId = searchParams.get('thread');
        if (threadId) {
            setCurrentThreadId(threadId);
        } else if (searchParams.get('action') === 'new-thread') {
            const newThreadId = new Date().getTime().toString();
            setCurrentThreadId(newThreadId);
            window.history.replaceState({}, '', `/app/threads?thread=${newThreadId}`);
        }
    }, [window.location.search]);

    useEffect(() => {
        // Reset messages and add default receiver message when a new thread is created
        if (currentThreadId) {
            setMessages([{
                text: "Hello! How can I help you today?",
                sender: 'receiver',
                timestamp: new Date().getTime()
            }]);
        }
    }, [currentThreadId]);

    const updateThreadName = (threadId, newName) => {
        const event = new CustomEvent('updateThreadName', {
            detail: { threadId, newName }
        });
        window.dispatchEvent(event);
    };

    const handleSendMessage = () => {
        if (inputValue.trim()) {
            const newMessage = {
                text: inputValue.trim(),
                sender: 'user',
                timestamp: new Date().getTime()
            };
            setMessages([...messages, newMessage]);
            
            if (messages.filter(m => m.sender === 'user').length === 0 && currentThreadId) {
                const threadName = inputValue.length > 30 
                    ? inputValue.substring(0, 27) + '...' 
                    : inputValue;
                updateThreadName(currentThreadId, threadName);
            }
            
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