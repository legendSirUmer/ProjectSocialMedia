import React, { useState } from "react";
import "./AddPost.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faUserTag, faSmile } from "@fortawesome/free-solid-svg-icons";

export default function AddPost() {
  const [postContent, setPostContent] = useState("");

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (postContent.trim()) {
      console.log("Post submitted:", postContent);
      setPostContent(""); // Clear the text area after submission
    } else {
      alert("Please write something before posting!");
    }
  };

  return (
    <div className="add-post">
      <form onSubmit={handlePostSubmit}>
        <div className="post-header">
          <img src="icons/user-profile.jpg" alt="User" className="user-profile" />
          <textarea
            placeholder="What's on your mind?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
        </div>
        <div className="post-options">
          <div className="option">
            <FontAwesomeIcon icon={faImage} style={{ color: "#45bd62" }} />
            <span>Photo/Video</span>
          </div>
          <div className="option">
            <FontAwesomeIcon icon={faUserTag} style={{ color: "#1877f2" }} />
            <span>Tag Friends</span>
          </div>
          <div className="option">
            <FontAwesomeIcon icon={faSmile} style={{ color: "#f7b928" }} />
            <span>Feeling/Activity</span>
          </div>
        </div>
        <button type="submit" className="post-button">
          Post
        </button>
      </form>
    </div>
  );
}