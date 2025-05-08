import React from "react";
import { Link } from "react-router-dom";
import "./sidebar.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHome, faUserFriends, faUsers, faStore, faTv, faClock, faBookmark, faCalendarAlt, faCog, faRobot } from "@fortawesome/free-solid-svg-icons";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-item">
        <Link to="/main">
          <FontAwesomeIcon icon={faHome} size="lg" className="icon-spacing" />
          <span> Home</span>
        </Link>
      </div>
      <div className="sidebar-item">
        <FontAwesomeIcon icon={faUserFriends} size="lg" className="icon-spacing" />
        <span> Friends</span>
      </div>
      <div className="sidebar-item">
        <FontAwesomeIcon icon={faUsers} size="lg" className="icon-spacing" />
        <span> Groups</span>
      </div>
      <div className="sidebar-item">
        <Link to="/market">
          <FontAwesomeIcon icon={faStore} size="lg" className="icon-spacing" />
          <span> Marketplace</span>
        </Link>
      </div>
      <div className="sidebar-item">
        <FontAwesomeIcon icon={faTv} size="lg" className="icon-spacing" />
        <span> Watch</span>
      </div>
      <div className="sidebar-item">
        <Link to="/ai-agent">
          <FontAwesomeIcon icon={faRobot} size="lg" className="icon-spacing" />
          <span>AI Agent</span>
        </Link>
      </div>
      <hr />
      <div className="sidebar-item">
        <FontAwesomeIcon icon={faBookmark} size="lg" className="icon-spacing" />
        <span> Saved</span>
      </div>
      <div className="sidebar-item">
        <FontAwesomeIcon icon={faCalendarAlt} size="lg" className="icon-spacing" />
        <span> Events</span>
      </div>
      <div className="sidebar-item">
        <Link to="/settings">
          <FontAwesomeIcon icon={faCog} size="lg" className="icon-spacing" />
          <span> Settings</span>
        </Link>
      </div>
    </div>
  );
}