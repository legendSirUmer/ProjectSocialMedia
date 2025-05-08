import React, { useState } from "react";
import "./AddPost.css";

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
            <img src="icons/gallery.svg" alt="Gallery" />
            <span>Photo/Video</span>
          </div>
          <div className="option">
            <img src="icons/tag.svg" alt="Tag" />
            <span>Tag Friends</span>
          </div>
          <div className="option">
            <img src="icons/emoji.svg" alt="Emoji" />
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