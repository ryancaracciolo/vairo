import React, { useState, useRef, useEffect, useContext } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UserContext } from '../../objects/Context';
import './Threads.css';
import LoadingScreen from '../../components/LoadingScreen/LoadingScreen';
import vairoLogo from '../../assets/images/stars.png';
import Avatar from '../../components/CircleInitials/CircleInitials';
import MessageFormatter from '../../components/MessageFormatter/MessageFormatter';
import Popup from '../../components/Popup/Popup';
import Share from '../../components/Share/Share';
import { ReactComponent as DataSourceIcon } from '../../assets/icons/upload-icon.svg';
import { ReactComponent as ShareIcon } from '../../assets/icons/share-icon.svg';
import { ReactComponent as ConnectionIcon } from '../../assets/icons/connect-icon.svg';
import { ReactComponent as XIcon } from '../../assets/icons/close-icon.svg';
import { ReactComponent as CheckIcon } from '../../assets/icons/checkmark-icon.svg';
import axios from 'axios';
import shortUUID from 'short-uuid';

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
  const [showSharePopup, setShowSharePopup] = useState(false);
  const [dataSources, setDataSources] = useState([]);
  const [dataSource, setDataSource] = useState(null);

  const GREETING_MESSAGE = "Hello! How can I help you?";

  const messagesEndRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  useEffect(scrollToBottom, [messages]);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    let threadId = searchParams.get('thread');

    if (!threadId) {
      threadId = shortUUID().new();
      navigate(`/threads?thread=${threadId}`);
    }

    setCurrentThreadId(threadId);
  }, [location.search, navigate]);

  useEffect(() => {
    if (currentThreadId && user.id) {
      setLoading(true);
      setThread(null);
      setDataSource(null);
      setMessages([]);
      axios
        .get(`/api/threads/get-thread/${user.id}/${currentThreadId}`)
        .then((response) => {
          const fetchedThread = response.data.thread;
          if (fetchedThread) {
            setThread(fetchedThread);
          } else {
            setThread(null);
          }
          return axios.get(`/api/threads/get-messages/${currentThreadId}`);
        })
        .then((response) => {
          let fetchedMessages = response.data;
          if (!Array.isArray(fetchedMessages)) {
            fetchedMessages = [];
          }

          // Always ensure the greeting message is at the start
          // Remove any duplicates of the greeting message from fetchedMessages
          fetchedMessages = fetchedMessages.filter(
            (msg) => msg.content !== GREETING_MESSAGE
          );

          // Now add the greeting message at the start
          fetchedMessages.unshift({
            threadId: currentThreadId,
            content: GREETING_MESSAGE,
            direction: 'received',
            timestamp: new Date().getTime(),
          });

          setMessages(fetchedMessages);
          setLoading(false);
        })
        .catch((error) => {
          console.error('Error fetching thread/messages:', error);
          setLoading(false);
          setMessages([
            {
              threadId: currentThreadId,
              content: GREETING_MESSAGE,
              direction: 'received',
              timestamp: new Date().getTime(),
            },
          ]);
        });
    }
  }, [currentThreadId, user.id]);

  useEffect(() => {
    setIsConnected(thread && thread.dataSourceId != null);
  }, [thread]);

  useEffect(() => {
    if (isConnected && thread && thread.dataSourceId) {
      axios
        .get(`/api/data-sources/get-data-source/${thread.dataSourceId}`)
        .then((response) => {
          setDataSource(response.data);
        })
        .catch((error) => {
          console.error('Error fetching data source:', error);
        });
    } else {
      setDataSource(null);
    }
  }, [isConnected, thread]);

  const updateThreadName = (threadId, newName) => {
    const event = new CustomEvent('updateThreadName', {
      detail: { threadId, newName },
    });
    window.dispatchEvent(event);
  };

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return;

    setThinkingStep(1);
    setTimeout(() => {
      setThinkingStep(2);
    }, 1000);

    const userMessageContent = inputValue.trim();
    setInputValue('');

    const newMessage = {
      threadId: currentThreadId,
      content: userMessageContent,
      direction: 'sent',
      timestamp: new Date().getTime(),
    };

    setMessages((prevMessages) => [...prevMessages, newMessage]);

    let newlyCreatedThread = false;
    if (!thread) {
      // Create thread now
      const words = userMessageContent.trim().split(' ').slice(0, 5).join(' ');
      const threadName = words.length > 0 ? words : 'New Thread';

      try {
        const response = await axios.post(`/api/threads/create-thread`, {
          id: currentThreadId,
          userId: user.id,
          title: threadName,
        });
        newlyCreatedThread = true;
        setThread(response.data.thread);
        updateThreadName(currentThreadId, threadName);
      } catch (error) {
        console.error('Error creating thread:', error);
      }
    }

    // Save the user message even if no data source is connected
    try {
      await axios.post(`/api/threads/add-message`, {
        threadId: currentThreadId,
        message: {
          content: userMessageContent,
          direction: 'sent',
        },
      });
    } catch (error) {
      console.error('Error saving user message:', error);
    }

    if (!dataSource || !dataSource.id) {
      setError('No Data Source Connected.');
      setThinkingStep(0);
      // If we just created the thread, re-fetch it to ensure consistency
      if (newlyCreatedThread) {
        try {
          const refetch = await axios.get(`/api/threads/get-thread/${user.id}/${currentThreadId}`);
          setThread(refetch.data.thread);
        } catch (err) {
          console.error('Error re-fetching thread after creation:', err);
        }
      }
      return;
    }

    // Call the assistant chat endpoint if data source is connected
    try {
      const response = await axios.post(`/api/threads/chat`, {
        threadId: currentThreadId,
        dataSource: dataSource,
        message: newMessage,
      });
      const assistantMessage = response.data.assistantMessage;
      setMessages((prevMessages) => [...prevMessages, assistantMessage]);
    } catch (error) {
      console.error('Error saving assistant message:', error);
    }

    // If we just created the thread, re-fetch it to ensure data source and naming correctness
    if (newlyCreatedThread) {
      try {
        const refetch = await axios.get(`/api/threads/get-thread/${user.id}/${currentThreadId}`);
        setThread(refetch.data.thread);
      } catch (err) {
        console.error('Error re-fetching thread after creation:', err);
      }
    }

    setThinkingStep(0);
  };

  const handleSelectDataSource = async (selectedDataSource) => {
    if (!thread) {
      try {
        const response = await axios.post(`/api/threads/create-thread`, {
          id: currentThreadId,
          userId: user.id,
          title: 'New Thread',
        });
        setThread(response.data.thread);
        updateThreadName(currentThreadId, 'New Thread');
      } catch (error) {
        console.error('Error creating thread before selecting data source:', error);
      }
    }

    try {
      const response = await axios.put(`/api/threads/update-thread`, {
        userId: user.id,
        threadId: currentThreadId,
        dataSourceId: selectedDataSource.id,
      });
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
        .get(`/api/users/get-data-sources/${user.id}`)
        .then((response) => {
          setDataSources(response.data);
        })
        .catch((error) => {
          console.error('Error fetching data sources:', error);
        });
    }
  }, [showDataSourcePopup, user.id]);

  const handleShowSharePopup = () => {
    setShowSharePopup(!showSharePopup);
  };

  const renderDataSourcePopup = () => {
    return (
      <div className="dataSource-overlay">
        <div className="overlay-content">
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
    );
  };

  const renderSharePopup = () => {
    return (
      <Popup
        content={<Share handleCloseClick={() => handleShowSharePopup()} />}
        onClose={() => setShowSharePopup(false)}
      />
    );
  };

  return (
    <div className="threads-wrapper">
      {loading ? (
        <LoadingScreen isLoading={loading} />
      ) : error && !thread ? (
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
          {showDataSourcePopup && renderDataSourcePopup()}
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
                    {isUser ? message.content : <MessageFormatter message={message} />}
                  </div>
                  {isUser && (
                    <div className="avatar">
                      <Avatar text={user.name} classN="message-initials" />
                    </div>
                  )}
                </div>
              );
            })}
            {thinkingStep > 0 && (
              <div className="thinking-indicator">
                <div
                  className={`thinking-step${thinkingStep > 1 ? ' completed' : ''}${
                    thinkingStep === 1 ? ' active' : ''
                  }`}
                >
                  {thinkingStep === 1 && <div className="loader"></div>}
                  {thinkingStep > 1 && <CheckIcon className="icon" />}
                  <p>Analyzing Question</p>
                </div>
                <div
                  className={`thinking-step${thinkingStep === 0 ? ' completed' : ''}${
                    thinkingStep === 2 ? ' active' : ''
                  }`}
                >
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
              <DataSourceIcon
                className="icon first"
                onClick={() => setShowDataSourcePopup(!showDataSourcePopup)}
              />
              <ShareIcon className="icon" onClick={() => setShowSharePopup(!showSharePopup)} />
            </div>
          </div>
        </div>
      )}
      {showSharePopup && renderSharePopup()}
    </div>
  );
}

export default Threads;