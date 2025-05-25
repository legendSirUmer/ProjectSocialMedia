import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserPlus } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from "react-router-dom";
import "./RightFriendBar.css";

export default function RightFriendsBar() {
  const [suggestedUsers, setSuggestedUsers] = useState([]);
  const [friends, setFriends] = useState([]);
  const navigate = useNavigate();
  const loggedInUserId = localStorage.getItem("id");

  // Fetch friends (users the current user is following)
  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/createpost/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query:
              "SELECT u.id, u.username, p.profileimg FROM auth_user u JOIN main_profile p ON u.id = p.user_id WHERE u.id IN (SELECT follower_id FROM main_followerscount WHERE user_id = %s)",
            params: [loggedInUserId],
          }),
        });
        const data = await response.json();
        if (Array.isArray(data)) {
          setFriends(data);
        }
      } catch (error) {
        // Optionally handle error
      }
    };
    if (loggedInUserId) fetchFriends();
  }, [loggedInUserId]);

  // Fetch suggestions (users not already friends and not self)
  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/suggested-users/", {
          method: "POST",
          body: JSON.stringify({ user_id: loggedInUserId }),
          headers: { "Content-Type": "application/json" },
        });
        let data = await response.json();
        if (Array.isArray(data)) {
          // Remove users already in friends or self
          const friendIds = new Set(friends.map((f) => String(f.id)));
          data = data.filter(
            (user) =>
              !friendIds.has(String(user.id)) &&
              String(user.id) !== String(loggedInUserId)
          );
          setSuggestedUsers(data);
        }
      } catch (error) {
        // Optionally handle error
      }
    };
    fetchSuggestions();
  }, [loggedInUserId, friends]);

  return (
    <div className="right-friends-bar">
      <h3>Friends</h3>
      <ul className="friends-list">
        {friends.map((friend) => (
          <li key={friend.id} className="friend-item">
            <img
              src={
                friend.profileimg
                  ? friend.profileimg.startsWith("http")
                    ? friend.profileimg
                    : `http://127.0.0.1:8000/media/${friend.profileimg}`
                  : "icons/user1.jpg"
              }
              alt={friend.username}
              className="friend-pic"
              onClick={() => navigate(`/profile/${friend.id}`)}
              style={{ cursor: "pointer" }}
            />
            <span
              className="friend-name"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/profile/${friend.id}`)}
            >
              {friend.username}
            </span>
          </li>
        ))}
      </ul>

      <div className="suggestion-section">
        <h4>Suggestions</h4>
        <ul className="friends-list">
          {suggestedUsers.map((user) => (
            <li
              key={user.id}
              className="friend-item"
              style={{ cursor: "pointer" }}
              onClick={() => navigate(`/profile/${user.id}`)}
              title={`Go to ${user.username}'s profile`}
            >
              <img
                src={
                  user.profileimg
                    ? user.profileimg.startsWith("http")
                      ? user.profileimg
                      : `http://127.0.0.1:8000/${user.profileimg}`
                    : "icons/user1.jpg"
                }
                alt={user.username}
                className="friend-pic"
              />
              <span className="friend-name">{user.username}</span>
            </li>
          ))}
        </ul>
      </div>

    </div>
  );
}