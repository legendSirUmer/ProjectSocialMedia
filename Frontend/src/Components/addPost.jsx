import React, { useState, useRef } from "react";
import "./AddPost.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage, faUserTag, faSmile } from "@fortawesome/free-solid-svg-icons";

export default function AddPost() {
  const [postContent, setPostContent] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const fileInputRef = useRef(null);

  const handlePostSubmit = async (e) => {
    e.preventDefault();
    if (!postContent.trim()) {
      alert("Please write something before posting!");
      return;
    }
    if (!selectedFile) {
      alert("Please select an image or video.");
      return;
    }
    const formData = new FormData();
    console.log(localStorage.getItem("username").valueOf());
    formData.append("username", localStorage.getItem("username").replace(/^"|"$/g, ""));
    formData.append("caption", postContent);
    formData.append("image", selectedFile);
    try {
      const response = await fetch("http://127.0.0.1:8000/create-postobject/", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (response.ok) {
        alert("Post submitted successfully!");
        setPostContent("");
        setSelectedFile(null);
      } else {
        alert(data.error || "Failed to submit post.");
      }
    } catch (error) {
      alert("Failed to submit post.");
    }
  };

  const handleFileChange = (e) => {
    setSelectedFile(e.target.files[0]);
  };

  const handlePhotoClick = () => {
    fileInputRef.current.click();
  };

  return (
    <div className="add-post">
      <form onSubmit={handlePostSubmit}>
        <div className="post-header">
          <img 
            src={"http://127.0.0.1:8000"+localStorage.getItem('profile_pic') || 'images/user-profile.jp'} 
            alt="User" 
            className="user-profile" 
          />
          <textarea
            placeholder="What's on your mind?"
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
          />
        </div>
        <div className="post-options">
          <div className="option" onClick={handlePhotoClick} style={{ cursor: "pointer" }}>
            <FontAwesomeIcon icon={faImage} style={{ color: "#45bd62" }} />
            <span>Photo/Video</span>
            <input
              type="file"
              accept="image/*,video/*"
              ref={fileInputRef}
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            {selectedFile && <span style={{ marginLeft: 8 }}>{selectedFile.name}</span>}
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