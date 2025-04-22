import React from "react";
import "./RightFriendBar.css";

export default function RightFriendsBar() {
  const friends = [
    { id: 1, name: "John Doe", profilePic: "icons/user1.jpg" },
    { id: 2, name: "Jane Smith", profilePic: "icons/user2.jpg" },
    { id: 3, name: "Alice Johnson", profilePic: "icons/user3.jpg" },
    { id: 4, name: "Bob Brown", profilePic: "icons/user4.jpg" },
    { id: 5, name: "Charlie Davis", profilePic: "icons/user5.jpg" },
  ];

  return (
    <div className="right-friends-bar">
      <h3>Friends</h3>
      <ul className="friends-list">
        {friends.map((friend) => (
          <li key={friend.id} className="friend-item">
            <img src={friend.profilePic} alt={friend.name} className="friend-pic" />
            <span className="friend-name">{friend.name}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}