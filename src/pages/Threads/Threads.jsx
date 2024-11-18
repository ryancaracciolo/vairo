import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../objects/Context';
import './Threads.css';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import vairoLogo from '../../assets/images/stars.png';
import Avatar from '../../components/CircleInitials/CircleInitials';
import MessageFormatter from '../../components/MessageFormatter/MessageFormatter';
import { ReactComponent as AddIcon } from '../../assets/icons/add-icon.svg';
import { ReactComponent as DataSourceIcon } from '../../assets/icons/upload-icon.svg';
import { ReactComponent as ShareIcon } from '../../assets/icons/share-icon.svg';
import { ReactComponent as ConnectionIcon } from '../../assets/icons/connect-icon.svg';
import { ReactComponent as XIcon } from '../../assets/icons/close-icon.svg';
import { ReactComponent as CheckIcon } from '../../assets/icons/checkmark-icon.svg';
import axios from 'axios';

function Threads() {
  const { user } = useContext(UserContext);
  const [loading, setLoading] = useState(false);
  const [thinkingStep, setThinkingStep] = useState(0);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [currentThreadId, setCurrentThreadId] = useState(null);
  const [thread, setThread] = useState(null);
  const [showDataSourcePopup, setShowDataSourcePopup] = useState(false);
  const [dataSources, setDataSources] = useState([]);
  const [dataSource, setDataSource] = useState(null);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    let threadId = searchParams.get('thread');
    const locationThread = location.state?.thread;

    if (threadId) {
      setCurrentThreadId(threadId);
      if (locationThread) {
        setThread(locationThread);
      } else {
        setThread(null); // Reset thread
      }
    } else {
      setCurrentThreadId(null);
      setThread(null);
      setMessages([]); // Clear messages when no thread is selected
      // Optionally, redirect or show a message to select a thread
    }
  }, [location.search, location.state]);

  useEffect(() => {
    if (currentThreadId) {
      setThread(null); // Reset thread when thread ID changes
      setDataSource(null); // Reset data source
      const locationThread = location.state?.thread;
      if (locationThread) {
        setThread(locationThread);
      } else {
        axios
          .get(`${process.env.REACT_APP_API_BASE_URL}/api/threads/get-thread/${user.id}/${currentThreadId}`)
          .then((response) => {
            setThread(response.data.thread);
          })
          .catch((error) => {
            console.error('Error fetching thread:', error);
          });
      }
    }
  }, [currentThreadId, user.id, location.state]);

  useEffect(() => {
    setIsConnected(thread && thread.dataSourceId != null);
  }, [thread]);

  useEffect(() => {
    if (isConnected && thread && thread.dataSourceId) {
      axios
        .get(`${process.env.REACT_APP_API_BASE_URL}/api/data-sources/get-data-source/${thread.dataSourceId}`)
        .then((response) => {
          setDataSource(response.data);
        })
        .catch((error) => {
          console.error('Error fetching data source:', error);
        });
    } else {
      setDataSource(null); // Reset data source if not connected
    }
  }, [isConnected, thread]);

  useEffect(() => {
    if (currentThreadId) {
      setLoading(true);
      setMessages([]);
      axios
        .get(`${process.env.REACT_APP_API_BASE_URL}/api/threads/get-messages/${currentThreadId}`)
        .then((response) => {
          let fetchedMessages = response.data;

          if (!Array.isArray(fetchedMessages)) {
            fetchedMessages = [];
          }

          fetchedMessages = fetchedMessages.filter(
            (msg) => msg.content !== 'Hello! How can I help you today?'
          );

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
    setThinkingStep(1);
    if (inputValue.trim()) {
      const newMessage = {
        threadId: currentThreadId,
        content: inputValue.trim(),
        direction: 'sent',
        timestamp: new Date().getTime(),
      };
      setMessages((prevMessages) => [...prevMessages, newMessage]);
      setInputValue('');

      const userMessages = messages.filter((m) => m.direction === 'sent');
      if (!thread) {
        // Create the thread in the DB
        const threadName =
          inputValue.length > 30 ? inputValue.substring(0, 27) + '...' : inputValue;

        try {
          const response = await axios.post(
            `${process.env.REACT_APP_API_BASE_URL}/api/threads/create-thread`,
            {
              id: currentThreadId,
              userId: user.id,
              title: threadName,
            }
          );

          setThread(response.data.thread); // Update thread state
          updateThreadName(currentThreadId, threadName);
        } catch (error) {
          console.error('Error creating thread:', error);
        }
      }

      try {
        if (!dataSource || !dataSource.id) {
          setError('No Data Source Connected.');
          setThinkingStep(0);
          return;
        }
        setTimeout(() => {
          if (thinkingStep === 1) {
            setThinkingStep(2);
          }
        }, 1500);

        console.log("dataSource: ", dataSource);
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/threads/chat`,
          {
            threadId: currentThreadId,
            dataSource: dataSource,
            message: newMessage,
          }
        );
        const assistantMessage = response.data.assistantMessage;
        setMessages((prevMessages) => [...prevMessages, assistantMessage]);
      } catch (error) {
        console.error('Error saving message:', error);
      }
      setThinkingStep(0);
    }
  };

  const handleSelectDataSource = async (selectedDataSource) => {
    try {
      if (!thread) {
        // Create the thread in the DB
        const response = await axios.post(
          `${process.env.REACT_APP_API_BASE_URL}/api/threads/create-thread`,
          {
            id: currentThreadId,
            userId: user.id,
            title: 'New Thread',
          }
        );
        setThread(response.data.thread);
        updateThreadName(currentThreadId, 'New Thread');
      }

      // Update the thread with the selected data source
      const response = await axios.put(
        `${process.env.REACT_APP_API_BASE_URL}/api/threads/update-thread`,
        {
          userId: user.id,
          threadId: currentThreadId,
          dataSourceId: selectedDataSource.id,
        }
      );
      setThread(response.data.thread);
      setDataSource(selectedDataSource);
      setShowDataSourcePopup(false);
    } catch (error) {
      console.error('Error updating thread with data source:', error);
    }
  };

  useEffect(() => {
    if (showDataSourcePopup) {
      axios
        .get(`${process.env.REACT_APP_API_BASE_URL}/api/users/get-data-sources/${user.id}`)
        .then((response) => {
          setDataSources(response.data);
        })
        .catch((error) => {
          console.error('Error fetching data sources:', error);
        });
    }
  }, [showDataSourcePopup, user.id]);

  return (
    <div className="threads-wrapper">
      {loading ? (
        <LoadingScreen isLoading={loading} />
      ) : error ? (
        <div>Error: {error}</div>
      ) : (
        <div className="threads-content">
          <div className="connection-status">
            <XIcon className={`icon disconnected ${isConnected ? '' : 'active'}`} />
            <ConnectionIcon className={`icon connected ${isConnected ? 'active' : ''}`} />
            <div className="status-text">
              {isConnected
                ? `Connected to ${dataSource ? dataSource.name : 'Data Source'}`
                : 'No Data Source Connected.'}
            </div>
            <button
              className={`connect-button ${isConnected ? '' : 'active'}`}
              onClick={() => setShowDataSourcePopup(true)}
            >
              {isConnected ? 'Change Data Source' : 'Connect'}
            </button>
          </div>
          {showDataSourcePopup && (
            <div className="popup-overlay">
              <div className="popup">
                <h2>Select a Data Source</h2>
                <ul>
                  {dataSources.map((ds) => (
                    <li key={ds.id} onClick={() => handleSelectDataSource(ds)}>
                      {ds.name}
                    </li>
                  ))}
                </ul>
                <button onClick={() => setShowDataSourcePopup(false)}>Cancel</button>
              </div>
            </div>
          )}
          <div className="messages">
            {messages.map((message, index) => {
              const isUser = message.direction === 'sent';
              return (
                <div key={message.timestamp || index} className={`message ${isUser ? 'sender' : 'receiver'}`}>
                  {!isUser && (
                    <div className="avatar">
                      <img src={vairoLogo} alt="Vairo Logo" />
                    </div>
                  )}
                  <div className="message-bubble">
                    {isUser ? (
                      message.content
                    ) : (
                      <MessageFormatter message={message} />
                    )}
                  </div>
                  {isUser && (
                    <div className="avatar">
                      <Avatar text={user.name} classN="message-initials" />
                    </div>
                  )}
                </div>
              );
            })}
            {(thinkingStep > 0) && (
                <div className="thinking-indicator">
                  <div className={`thinking-step${thinkingStep > 1 ? ' completed' : ''}${thinkingStep === 1 ? ' active' : ''}`}>
                    {thinkingStep === 1 && <div className="loader"></div>}
                    {thinkingStep > 1 && <CheckIcon className="icon" />}
                    <p>Analyzing Question</p>
                  </div>
                  <div className={`thinking-step${thinkingStep === 0 ? ' completed' : ''}${thinkingStep === 2 ? ' active' : ''}`}>
                    {thinkingStep !== 1 && <div className="loader"></div>}
                    {thinkingStep === 0 && <CheckIcon className="icon" />}
                    <p>Crafting Response</p>
                  </div>
                </div>
            )}
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
      )}
    </div>
  );
}

export default Threads;