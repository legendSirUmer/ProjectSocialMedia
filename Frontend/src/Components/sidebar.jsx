import React from "react";
import "./sidebar.css";

export default function Sidebar() {
  return (
    <div className="sidebar">
      <div className="sidebar-item">
        <img src="icons/home.svg" alt="Home" />
        <span>Home</span>
      </div>
      <div className="sidebar-item">
        <img src="icons/friends.svg" alt="Friends" />
        <span>Friends</span>
      </div>
      <div className="sidebar-item">
        <img src="icons/groups.svg" alt="Groups" />
        <span>Groups</span>
      </div>
      <div className="sidebar-item">
        <img src="icons/marketplace.svg" alt="Marketplace" />
        <span>Marketplace</span>
      </div>
      <div className="sidebar-item">
        <img src="icons/watch.svg" alt="Watch" />
        <span>Watch</span>
      </div>
      <div className="sidebar-item">
        <img src="icons/memories.svg" alt="Memories" />
        <span>Memories</span>
      </div>
      <hr />
      <div className="sidebar-item">
        <img src="icons/saved.svg" alt="Saved" />
        <span>Saved</span>
      </div>
      <div className="sidebar-item">
        <img src="icons/events.svg" alt="Events" />
        <span>Events</span>
      </div>
      <div className="sidebar-item">
        <img src="icons/settings.svg" alt="Settings" />
        <span>Settings</span>
      </div>
    </div>
  );
}