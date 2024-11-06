import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../../objects/Context';
import './Threads.css';
import LoadingScreen from '../../../components/product/LoadingScreen/LoadingScreen';
import vairoLogo from '../../../assets/images/stars.png';
import Avatar from '../../../components/product/CircleInitials/CircleInitials';
import { ReactComponent as AddIcon } from '../../../assets/icons/add-icon.svg';
import { ReactComponent as DataSourceIcon } from '../../../assets/icons/upload-icon.svg';
import { ReactComponent as ShareIcon } from '../../../assets/icons/share-icon.svg';
import axios from 'axios';

function Threads() {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [currentThreadId, setCurrentThreadId] = useState(null);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    let threadId = searchParams.get('thread');

    if (threadId) {
      setCurrentThreadId(threadId);
    } else {
      // Generate a new thread ID and navigate to it
      const newThreadId = new Date().getTime().toString();
      setCurrentThreadId(newThreadId);
      navigate(`/app/threads?thread=${newThreadId}`, { replace: true });
    }
  }, [location.search, navigate]);

  useEffect(() => {
    if (currentThreadId) {
      setLoading(true);
      axios
        .get(`${process.env.REACT_APP_API_BASE_URL}/api/threads/get-messages/${currentThreadId}`)
        .then((response) => {
          let fetchedMessages = response.data;

          // Ensure fetchedMessages is an array
          if (!Array.isArray(fetchedMessages)) {
            fetchedMessages = [];
          }

          // Remove any existing greeting messages to avoid duplicates
          fetchedMessages = fetchedMessages.filter(
            (msg) => msg.content !== 'Hello! How can I help you today?'
          );

          // Prepend the greeting message
          const greetingMessage = {
            threadId: currentThreadId,
            content: 'Hello! How can I help you today?',
            direction: 'received',
            timestamp: new Date().getTime(),
          };

          setMessages([greetingMessage, ...fetchedMessages]);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching messages:', error);
          setError('Failed to fetch messages.');
          setLoading(false);

          // Even if fetching fails, show the greeting message
          setMessages([
            {
              threadId: currentThreadId,
              content: 'Hello! How can I help you today?',
              direction: 'received',
              timestamp: new Date().getTime(),
            },
          ]);
        });
    }
  }, [currentThreadId]);

  const updateThreadName = (threadId, newName) => {
    const event = new CustomEvent('updateThreadName', {
      detail: { threadId, newName },
    });
    window.dispatchEvent(event);
  };

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      const newMessage = {
        threadId: currentThreadId,
        content: inputValue.trim(),
        direction: 'sent',
        timestamp: new Date().getTime(),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);

      const userMessages = messages.filter((m) => m.direction === 'sent');
      if (userMessages.length === 0 && currentThreadId) {
        const threadName =
          inputValue.length > 30 ? inputValue.substring(0, 27) + '...' : inputValue;

        try {
          // Create the thread on the server
          await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/threads/create-thread`, {
            id: currentThreadId,
            userId: user.id,
            title: threadName,
          });

          // Update thread name in Menu
          updateThreadName(currentThreadId, threadName);
        } catch (error) {
          console.error('Error creating thread:', error);
        }
      }

      try {
        // Save the message to the server
        await axios.post(`${process.env.REACT_APP_API_BASE_URL}/api/threads/add-message`, {
          threadId: currentThreadId,
          content: newMessage.content,
          direction: newMessage.direction,
          timestamp: newMessage.timestamp,
        });
      } catch (error) {
        console.error('Error saving message:', error);
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
            const isUser = message.direction === 'sent';
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
                <div className="message-bubble">{message.content}</div>
                {isUser && (
                  <div className="avatar">
                    <Avatar text={user.name} classN="message-initials" />
                  </div>
                )}
              </div>
            );
          })}
          <div ref={messagesEndRef} />
        </div>
        <div className="message-input">
          <div className="floating-wrapper">
            <div className="avatar input-avatar">
              <img src={vairoLogo} alt="Vairo Logo" />
            </div>
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type a message..."
              onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
          <div className="floating-wrapper actions">
            <AddIcon className="icon first" />
            <DataSourceIcon className="icon" />
            <ShareIcon className="icon" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Threads;