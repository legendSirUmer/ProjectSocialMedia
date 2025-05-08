import React from "react";
import "./Stories.css";

export default function StoriesCarousel() {
  const stories = [
    { id: 1, name: "John Doe", profilePic: "icons/user1.jpg" },
    { id: 2, name: "Jane Smith", profilePic: "icons/user2.jpg" },
    { id: 3, name: "Alice Johnson", profilePic: "icons/user3.jpg" },
    { id: 4, name: "Bob Brown", profilePic: "icons/user4.jpg" },
    { id: 5, name: "Charlie Davis", profilePic: "icons/user5.jpg" },
    { id: 6, name: "Emily White", profilePic: "icons/user6.jpg" },
  ];

  return (
    <div className="stories-carousel">
      {stories.map((story) => (
        <div key={story.id} className="story-item">
          <img src={story.profilePic} alt={story.name} className="story-pic" />
          <span className="story-name">{story.name}</span>
        </div>
      ))}
    </div>
  );
}