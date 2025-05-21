import React, { useEffect, useState } from "react";
import "./Feed.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faComment, faSmile } from "@fortawesome/free-solid-svg-icons";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const loggedInUserId = localStorage.getItem("id");
  const postss = [
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


  useEffect(() => {
    const fetchPosts = async () => {
      try {
        // Fetch posts from users that the current user is following (friends)
        const response = await fetch("http://127.0.0.1:8000/createpost/", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            query: `
              SELECT post.id, post.[user], post.caption, post.image, post.created_at, p.profileimg, u.username
              FROM main_post post
              JOIN auth_user u ON u.username = post.[user]
              JOIN main_profile p ON p.user_id = u.id
              WHERE u.id IN (
                SELECT follower_id FROM main_followerscount WHERE user_id = %s
              )
              ORDER BY post.created_at DESC
            `,
            params: [loggedInUserId],
          }),
        });
        const data = await response.json();
        if (Array.isArray(data)) {
          setPosts(data);
          setLikes(data.map(post => post.no_of_likes || 0));
        }
      } catch (error) {
        // Optionally handle error
      }
    };
    if (loggedInUserId) fetchPosts();
  }, [loggedInUserId]);






  return (
    <div className="feed">
      {posts.map((post, index) => (
        <div key={post.id} className="post">
          <div className="post-header">
            <img
              src={
                post.profileimg
                  ? post.profileimg.startsWith("http")
                    ? post.profileimg
                    : `http://127.0.0.1:8000/media/${post.profileimg}`
                  : "icons/user-profile.jpg"
              }
              alt={post.username}
              className="user-profile"
            />
            <span className="user-name">{post.username}</span>
            <span className="post-date" style={{ marginLeft: "auto", fontSize: "12px", color: "#888" }}>
              {post.created_at ? new Date(post.created_at).toLocaleString() : ""}
            </span>
          </div>
          <p className="post-content">{post.caption}</p>
          {post.image && (
            <img
              src={
                post.image.startsWith("http")
                  ? post.image
                  : `http://127.0.0.1:8000/media/${post.image}`
              }
              alt="Post"
              className="post-image"
            />
          )}
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