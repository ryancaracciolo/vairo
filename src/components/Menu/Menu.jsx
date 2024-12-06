import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { UserContext } from '../../objects/Context';
import shortUUID from 'short-uuid';
import { ReactComponent as ThreadIcon } from '../../assets/icons/threads-icon.svg';
import { ReactComponent as DashboardIcon } from '../../assets/icons/dashboard-icon.svg';
import { ReactComponent as DataSourceIcon } from '../../assets/icons/data-icon.svg';
import { ReactComponent as DocumentIcon } from '../../assets/icons/docs-icon.svg';
import { ReactComponent as AddIcon } from '../../assets/icons/add-icon.svg';
import { ReactComponent as DownIcon } from '../../assets/icons/down-icon.svg';
import { ReactComponent as EditIcon } from '../../assets/icons/edit-icon.svg';
import { ReactComponent as DeleteIcon } from '../../assets/icons/delete-icon.svg';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import './Menu.css';
import { ActiveMenuIndexContext } from '../../objects/Context';

function Menu() {
  const { user } = useContext(UserContext);
  const { activeMenuIndex } = useContext(ActiveMenuIndexContext);
  const [contentItems, setContentItems] = useState([]);
  const [currentContentId, setCurrentContentId] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    { label: 'Threads', icon: ThreadIcon, path: '/threads' },
    { label: 'Dashboards', icon: DashboardIcon, path: '/dashboards' },
    { label: 'Data Sources', icon: DataSourceIcon, path: '/data-sources' },
    { label: 'Resources', icon: DocumentIcon, path: '/resources' },
  ];

  const actionItem = activeMenuIndex === 0 ? 'New Thread' : null;
  const contentTitle = activeMenuIndex === 0 ? 'My Threads' : null;

  useEffect(() => {
    const handleThreadNameUpdate = (event) => {
      const { threadId, newName } = event.detail;
      setContentItems((prevItems) => {
        const itemExists = prevItems.some((item) => item.id === threadId);
        if (itemExists) {
          return prevItems.map((item) =>
            item.id === threadId ? { ...item, label: newName, isSaved: true } : item
          );
        } else {
          // If the thread isn't in the list, add it
          return [
            ...prevItems,
            {
              id: threadId,
              label: newName,
              path: `/threads?thread=${threadId}`,
              isSaved: true,
            },
          ];
        }
      });
    };

    window.addEventListener('updateThreadName', handleThreadNameUpdate);
    return () => window.removeEventListener('updateThreadName', handleThreadNameUpdate);
  }, []);

  useEffect(() => {
    if (activeMenuIndex === 0 && user.id) {
      axios
        .get(`/api/users/get-threads/${user.id}`)
        .then((response) => {
          setContentItems(
            response.data.map((thread) => ({
              label: thread.title || 'Untitled Thread',
              path: `/threads?thread=${thread.id}`,
              id: thread.id,
              thread: thread,
              isSaved: true,
            }))
          );
        })
        .catch((err) => {
          console.error('Failed to fetch threads', err);
        });
    }
  }, [activeMenuIndex, user.id]);

  useEffect(() => {
    if (activeMenuIndex === 0) {
      const searchParams = new URLSearchParams(location.search);
      const threadId = searchParams.get('thread');
      if (threadId) {
        setCurrentContentId(threadId);
        const existingThread = contentItems.find((item) => item.id === threadId);
        if (!existingThread) {
          // Add a placeholder "New Thread" if it doesn't exist
          setContentItems((prevItems) => [
            ...prevItems,
            {
              label: 'New Thread',
              path: `/threads?thread=${threadId}`,
              id: threadId,
              isSaved: false,
            },
          ]);
        }
      } else {
        setCurrentContentId(null);
      }
    }
  }, [activeMenuIndex, location.search, contentItems]);

  const handleNewThreadClick = () => {
    if (activeMenuIndex === 0) {
      const unsavedThread = contentItems.find(
        (item) => item.label === 'New Thread' && !item.isSaved
      );
      if (unsavedThread) {
        navigate(unsavedThread.path);
      } else {
        const id = shortUUID().new();
        const newThreadPath = `/threads?thread=${id}`;
        setContentItems((prevItems) => [
          ...prevItems,
          {
            label: 'New Thread',
            path: newThreadPath,
            id,
            isSaved: false,
          },
        ]);
        navigate(newThreadPath);
      }
    }
  };

  const handleEdit = async (threadId) => {
    const newTitle = prompt('Enter new title for the thread:');
    if (newTitle) {
      try {
        await axios.put(`/api/threads/edit-thread`, {
          userId: user.id,
          threadId,
          newTitle,
        });
        setContentItems((prevItems) =>
          prevItems.map((item) => (item.id === threadId ? { ...item, label: newTitle } : item))
        );
      } catch (err) {
        console.error('Failed to edit thread title', err);
      }
    }
  };

  const handleDelete = async (threadId) => {
    try {
      await axios.delete(`/api/threads/delete-thread/${user.id}/${threadId}`);
      setContentItems((prevItems) => prevItems.filter((item) => item.id !== threadId));
      navigate('/threads');
    } catch (err) {
      console.error('Failed to delete thread', err);
    }
  };

  return (
    <div className="ProductMenu">
      <ul>
        {menuItems.map((item, index) => (
          <li
            key={index}
            className={`menu-item ${activeMenuIndex === index ? 'active' : ''}`}
          >
            <Link className="menu-item-link" to={item.path}>
              <item.icon className="menu-icon" />
              <p className={`menu-label ${activeMenuIndex === index ? 'active' : ''}`}>
                {item.label}
              </p>
            </Link>
          </li>
        ))}
      </ul>
      {activeMenuIndex === 0 && (
        <>
          <hr />
          <div className="sub-menu-container">
            {actionItem && (
              <div className="sub-menu-button" onClick={handleNewThreadClick}>
                <AddIcon className="add-icon" />
                <p className="add-label">{actionItem}</p>
              </div>
            )}
            <div className="sub-menu-content">
              <div className="content-title">
                <p className="title-label">{contentTitle}</p>
                <DownIcon className="title-icon" />
              </div>
              <ul>
                {contentItems.map((item) => (
                  <li key={item.id} className="item">
                    <Link
                      className="menu-item-container"
                      to={item.path}
                      state={{ thread: item.thread }}
                    >
                      <div className="menu-line"></div>
                      <div
                        className={`horiz-line${currentContentId === item.id ? '-active' : ''}`}
                      ></div>
                      <p
                        className={`menu-label${currentContentId === item.id ? ' active' : ''}`}
                      >
                        {item.label}
                      </p>
                    </Link>
                    <div className="thread-icons">
                      <EditIcon className="edit-icon" onClick={() => handleEdit(item.id)} />
                      <DeleteIcon
                        className="delete-icon"
                        onClick={() => handleDelete(item.id)}
                      />
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Menu;