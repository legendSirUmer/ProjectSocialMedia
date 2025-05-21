import React, { useEffect, useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons";
import "./Stories.css";

export default function StoriesCarousel() {
  const [stories, setStories] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [storyText, setStoryText] = useState("");
  const [storyFile, setStoryFile] = useState(null);
  const fileInputRef = useRef(null);
  const loggedInUserId = localStorage.getItem("id");

  useEffect(() => {
    const fetchStories = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/createpost/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              SELECT s.id, s.image, s.text, s.created_at, u.username, p.profileimg
              FROM main_story s
              JOIN auth_user u ON u.id = s.user_id
              JOIN main_profile p ON p.user_id = u.id
              WHERE s.user_id IN (
                SELECT follower_id FROM main_followerscount WHERE user_id = %s
              )
              ORDER BY s.created_at DESC
            `,
            params: [loggedInUserId],
          }),
        });
        const data = await response.json();
        if (Array.isArray(data)) {
          setStories(data);
        }
      } catch (error) {
        // Optionally handle error
      }
    };
    if (loggedInUserId) fetchStories();
  }, [loggedInUserId]);

  const handleAddStory = () => setShowPopup(true);
  const handleClosePopup = () => {
    setShowPopup(false);
    setStoryText("");
    setStoryFile(null);
  };
  const handleFileChange = (e) => setStoryFile(e.target.files[0]);

  const handleSubmitStory = async (e) => {
    e.preventDefault();
    if (!storyFile && !storyText.trim()) {
      alert("Please add an image or text for your story.");
      return;
    }
    const formData = new FormData();
    formData.append("user_id", loggedInUserId);
    if (storyFile) formData.append("image", storyFile);
    if (storyText) formData.append("text", storyText);
    try {
      const response = await fetch("http://127.0.0.1:8000/create_story/", {
        method: "POST",
        body: formData,
      });
      if (response.ok) {
        handleClosePopup();
        // Optionally refetch stories
        window.location.reload();
      } else {
        alert("Failed to add story.");
      }
    } catch (error) {
      alert("Failed to add story.");
    }
  };

  return (
    <div className="stories-carousel">
      <div className="story-item" onClick={handleAddStory} style={{ cursor: "pointer" }}>
        <FontAwesomeIcon icon={faPlusCircle} size="2x" style={{ color: "#1877f2" }} />
        <span>Add Story</span>
      </div>
      {showPopup && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Create Story</h3>
            <form onSubmit={handleSubmitStory}>
              <input
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
                style={{ marginBottom: 10 }}
              />
              <textarea
                placeholder="Say something..."
                value={storyText}
                onChange={(e) => setStoryText(e.target.value)}
                style={{ width: '100%', minHeight: 60, marginBottom: 10 }}
              />
              <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                <button type="button" onClick={handleClosePopup}>Cancel</button>
                <button type="submit">Post Story</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {stories.map((story) => (
        <div key={story.id} className="story-item">
          <img
            src={
              story.profileimg
                ? story.profileimg.startsWith("http")
                  ? story.profileimg
                  : `http://127.0.0.1:8000/media/${story.profileimg}`
                : "icons/user1.jpg"
            }
            alt={story.username}
            className="story-pic"
          />
          <span className="story-name">{story.username}</span>
          {story.image && (
            <img
              src={
                story.image.startsWith("http")
                  ? story.image
                  : `http://127.0.0.1:8000/media/${story.image}`
              }
              alt="Story"
              className="story-image"
              style={{ width: 80, height: 80, borderRadius: 10, marginTop: 5 }}
            />
          )}
          {story.text && <div className="story-text">{story.text}</div>}
        </div>
      ))}
    </div>
  );
}