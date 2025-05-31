import React, { useEffect, useState } from "react";
import "./Feed.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faComment, faSmile } from "@fortawesome/free-solid-svg-icons";

export default function Feed() {
  const [posts, setPosts] = useState([]);
  const [likes, setLikes] = useState([]);
  const [likedPosts, setLikedPosts] = useState([]);
  const loggedInUserId = localStorage.getItem("id");


  const handleLike = async (index) => {
    const post = posts[index];
    const isLiked = likedPosts.includes(post.id);

    if (!isLiked) {
      // Like: Insert into main_likepost
      await fetch("http://127.0.0.1:8000/createpost/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
       
          query: `INSERT INTO main_likepost (user_id, post_id) VALUES (%s, %s)`,
          params: [loggedInUserId, post.id],
   
        }),
      });
    } else {
      // Unlike: Delete from main_likepost
      await fetch("http://127.0.0.1:8000/createpost/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: `DELETE FROM main_likepost WHERE user_id = %s AND post_id = %s`,
          params: [loggedInUserId, post.id],
          action: "unlike_post",
          user_id: loggedInUserId,
          post_id: post.id,
        }),
      });
    }

    // Refresh like count for this post
    const response = await fetch("http://127.0.0.1:8000/createpost/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `Select COUNT(*) as like_count FROM main_likepost WHERE post_id = %s`,
        params: [post.id],
      }),
    });
    const data = await response.json();
    setLikes((prev) => {
      const newLikes = [...prev];
      newLikes[index] = data[0]?.like_count || 0;
      return newLikes;
    });

    // Refresh liked posts
    const likedRes = await fetch("http://127.0.0.1:8000/createpost/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        query: `SELECT post_id FROM main_likepost WHERE user_id = %s`,
        params: [loggedInUserId],
        
      }),
    });
    const likedData = await likedRes.json();
    setLikedPosts(likedData.map(like => like.post_id));
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
          // Fetch like counts for each post using stored procedure
          const likeCounts = await Promise.all(
            data.map(async (post) => {
              const res = await fetch("http://127.0.0.1:8000/createpost/", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  query: `Select COUNT(*) as like_count FROM main_likepost WHERE post_id = %s`,
                  params: [post.id],
                }),
              });
              const likeData = await res.json();
              return likeData[0]?.like_count || 0;
            })
          );
          setLikes(likeCounts);
          // Fetch liked posts for the user
          const likedRes = await fetch("http://127.0.0.1:8000/createpost/", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              query: `SELECT post_id FROM main_likepost WHERE user_id = %s`,
              params: [loggedInUserId],
            }),
          });
          const likedData = await likedRes.json();
          setLikedPosts(likedData.map(like => like.post_id));
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
            <button
              className={`action-button${likedPosts.includes(post.id) ? " liked" : ""}`}
              style={likedPosts.includes(post.id) ? { color: "#1976d2" } : {}}
              onClick={() => handleLike(index)}
            >
              <FontAwesomeIcon icon={faThumbsUp} /> {likedPosts.includes(post.id) ? "Liked" : "Like"} ({likes[index] || 0})
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