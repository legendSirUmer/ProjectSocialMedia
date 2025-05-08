import React, { useState } from "react";
import "./Feed.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faComment, faSmile } from "@fortawesome/free-solid-svg-icons";

export default function Feed() {
  const posts = [
    {
      id: 1,
      user: "John Doe",
      content: "Had a great day at the park!",
      image: "images/post1.jpg",
    },
    {
      id: 2,
      user: "Jane Smith",
      content: "Loving the new recipe I tried today!",
      image: "images/post2.jpg",
    },
    {
      id: 3,
      user: "Alice Johnson",
      content: "Check out this amazing sunset!",
      image: "images/post3.jpg",
    },
  ];

  const [likes, setLikes] = useState(posts.map(() => 0));

  const handleLike = (index) => {
    const newLikes = [...likes];
    newLikes[index] += 1;
    setLikes(newLikes);
  };

  return (
    <div className="feed">
      {posts.map((post, index) => (
        <div key={post.id} className="post">
          <div className="post-header">
            <img src="icons/user-profile.jpg" alt={post.user} className="user-profile" />
            <span className="user-name">{post.user}</span>
          </div>
          <p className="post-content">{post.content}</p>
          {post.image && <img src={post.image} alt="Post" className="post-image" />}
          <div className="post-actions">
            <button className="action-button" onClick={() => handleLike(index)}>
              <FontAwesomeIcon icon={faThumbsUp} /> Like ({likes[index]})
            </button>
            <button className="action-button">
              <FontAwesomeIcon icon={faComment} /> Comment
            </button>
            <button className="action-button">
              <FontAwesomeIcon icon={faSmile} /> Emoji
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}