import React, { useState } from 'react';
import axios from 'axios';
import { Link, useLocation } from 'react-router-dom';
import './nav.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faFacebookMessenger } from '@fortawesome/free-brands-svg-icons';
import { faSearch, faHome, faStore, faTv, faUserAlt, faPlus, faBell, faUserCog ,faSignOutAlt} from '@fortawesome/free-solid-svg-icons';

export default function Nav() {
  const location = useLocation();
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState([]);

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to log out?')) {
      localStorage.removeItem('username');
      localStorage.removeItem('id');
      localStorage.removeItem('profile_pic');
      localStorage.removeItem('bio');
      localStorage.removeItem('location');
      localStorage.removeItem('email');
      // Use full page reload to root so App state resets and login route is available
      window.location.href = '/';
    }
  };

  const handleNotificationClick = async () => {
    setShowNotifications(v => !v);
    if (!showNotifications) {
      try {
        const userId = localStorage.getItem('id');
        // Use the createpost/ API to fetch notifications for the user
        const res = await axios.post('http://127.0.0.1:8000/createpost/', {
          action: 'get_notifications',
          query : 'SELECT * from main_notification where user_id ='+userId
        });
        setNotifications(res.data);
        console.log(res.data)
      } catch (err) {
        setNotifications([{ message: 'Failed to fetch notifications.' }]);
      }
    }
  };

  return (
    
    <header>
      <nav>
        <ul>
          <li>
            <Link to="/main" id="fb">
              <FontAwesomeIcon icon={faFacebookF} />
            </Link>
          </li>
          <li>
            <button
              id="search_btn"
              className={`tooltip ${location.pathname === '/search' ? 'active' : ''}`}
              data-tooltip="Search"
            >
              <FontAwesomeIcon icon={faSearch} />
            </button>
          </li>
          <li id="space2" />
          <li>
            <Link
              className={`tooltip ${location.pathname === '/main' ? 'active' : ''}`}
              data-tooltip="Home"
              to="/main"
              id="home"
            >
              <FontAwesomeIcon icon={faHome} />
            </Link>
          </li>
          <li>
            <Link
              className={`tooltip ${location.pathname === '/market' ? 'active' : ''}`}
              data-tooltip="Group"
              to="/market"
              id="group"
            >
              <FontAwesomeIcon icon={faStore} />
            </Link>
          </li>
          <li>
            <Link
              className={`tooltip ${location.pathname === '/watch' ? 'active' : ''}`}
              data-tooltip="Watch"
              to="/watch"
              id="tv"
            >
              <FontAwesomeIcon icon={faTv} />
            </Link>
          </li>
          <li>
            <Link
              className={`tooltip ${location.pathname === '/profile' ? 'active' : ''}`}
              data-tooltip="Friend"
              to={`/profile/${localStorage.getItem('id')}`}
              id="friend"
            >
              <FontAwesomeIcon icon={faUserAlt} />
            </Link>
          </li>
          <li id="space1" />
          <li>
            <button
              className={`tooltip ${location.pathname === '/add' ? 'active' : ''}`}
              data-tooltip="Add"
              id="btn_plus"
              onClick={handleLogout}
            
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
            </button>
          </li>
          <li>
            <Link
              className={`tooltip ${location.pathname === '/chatroom' ? 'active' : ''}`}
              data-tooltip="Message"
              id="btn_msg"
              to="/chatroom"
            >
              <FontAwesomeIcon icon={faFacebookMessenger} />
            </Link>
          </li>
          <li>
            <button
              className={`tooltip ${location.pathname === '/notification' ? 'active' : ''}`}
              data-tooltip="Notification"
              id="btn_bell"
              onClick={handleNotificationClick}
            >
              <FontAwesomeIcon icon={faBell} />
            </button>
            {showNotifications && (
              <div className="notification-dropdown" style={{ position: 'absolute', right: 0, top: '60px', background: '#fff', border: '1px solid #ddd', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.12)', padding: '10px', zIndex: 1000, minWidth: '300px' }}>
                <h4 style={{margin: '0 0 8px 0'}}>Notifications</h4>
                {notifications.length === 0 ? (
                  <div style={{ color: '#888' }}>No notifications.</div>
                ) : (
                  notifications.map((n, i) => (
                    <div key={n.id || i} style={{ padding: '6px 0', borderBottom: '1px solid #eee' }}>
                      <div><b>Message:</b> {n.message || n.Message || JSON.stringify(n)}</div>
                      <p> {console.log(n.message)} </p>
                      <div style={{ fontSize: '12px', color: '#888' }}><b>Received:</b> <p>{n.message}</p> {n.created_at ? new Date(n.created_at).toLocaleString() : ''}</div>
                      <div style={{ fontSize: '12px', color: n.is_read ? '#4caf50' : '#f44336' }}>
                        <b>Status:</b> {n.is_read ? 'Read' : 'Unread'}
                      </div>
                      <div style={{ fontSize: '12px', color: '#888' }}><b>User ID:</b> {n.user_id}</div>
                    </div>
                  ))
                )}
              </div>
            )}
          </li>
          <li>
            <Link
              className={`tooltip ${location.pathname === '/settings' ? 'active' : ''}`}
              data-tooltip="Profile"
              to="/settings"
              id="btn_profile"
            >
              <FontAwesomeIcon icon={faUserCog} />
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}