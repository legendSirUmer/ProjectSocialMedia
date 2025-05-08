import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './nav.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFacebookF, faFacebookMessenger } from '@fortawesome/free-brands-svg-icons';
import { faSearch, faHome, faStore, faTv, faUserAlt, faPlus, faBell, faUserCog } from '@fortawesome/free-solid-svg-icons';

export default function Nav() {
  const location = useLocation();

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
              to="/profile"
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
            >
              <FontAwesomeIcon icon={faPlus} />
            </button>
          </li>
          <li>
            <button
              className={`tooltip ${location.pathname === '/message' ? 'active' : ''}`}
              data-tooltip="Message"
              id="btn_msg"
            >
              <FontAwesomeIcon icon={faFacebookMessenger} />
            </button>
          </li>
          <li>
            <button
              className={`tooltip ${location.pathname === '/notification' ? 'active' : ''}`}
              data-tooltip="Notification"
              id="btn_bell"
            >
              <FontAwesomeIcon icon={faBell} />
            </button>
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