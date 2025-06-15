import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

function PostcardComment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [post, setPost] = useState({});
  const [comment, setComment] = useState("");
  const [currentUserId, setCurrentUserId] = useState("");

  useEffect(() => {
    const fetchPostData = async () => {
      try {
        // Get current logged-in user
        const userRes = await axios.get(`http://localhost:5000/api/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentUserId(userRes.data._id);

        // Get post details
        const res = await axios.get(`http://localhost:5000/api/post/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPost(res.data);
      } catch (err) {
        console.error(err);
        alert("Failed to load post");
        navigate("/dashboard");
      }
    };

    fetchPostData();
  }, [id]);

  const handleLike = async () => {
    try {
      await axios.post(
        `http://localhost:5000/api/post/${id}/like`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      // Refetch post data
      const res = await axios.get(`http://localhost:5000/api/post/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPost(res.data);
    } catch (err) {
      alert("Like failed");
    }
  };

  const handleComment = async () => {
    if (!comment.trim()) return;
    try {
      await axios.post(
        `http://localhost:5000/api/post/${id}/comment`,
        { content: comment },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPost((prev) => ({
        ...prev,
        comments: [...prev.comments, { body: comment }],
      }));

      setComment("");
    } catch (err) {
      alert("Comment failed");
    }
  };

  const handleDelete = async () => {
    const confirm = window.confirm(
      "Are you sure you want to delete this post?"
    );
    if (!confirm) return;

    try {
      await axios.delete(`http://localhost:5000/api/post/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert("Post deleted");
      navigate(`/dashboard/${currentUserId}`);

    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <>
    <h2>Post</h2>
    <div className="post-detail">
      
      
     <div className="text-like">
         <div className="context">
            <p>
        <strong></strong> {post.caption || "Loading..."}
      </p>
         </div>

      <div className="but-this" >
        <button className="like-this" onClick={handleLike}>
          ❤️({post.likes?.length || 0})
        </button>
        {currentUserId === post.createdBy?._id && (
        <div style={{ marginTop: "20px" }}>
          <button className="delete-this" onClick={handleDelete} style={{ color: "red" }}>
            🗑️ Delete Post
          </button>
        </div>
      )}
      </div>
     </div>

      
      <div className="commentssection">
        <h3>Comments</h3>
        <div className="chats">
            <ul>
        {post.comments?.map((c, i) => (
          <h3 key={i}>{c.body || c.content}</h3> // fallback if one is undefined
        ))}
      </ul>
        </div>

      <div className="sectioncomment2">
        <input
        type="text"
        placeholder="Write a comment..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button onClick={handleComment}>Post Comment</button>
      </div>
      </div>
    </div>
    </>
  );
  
}

export default PostcardComment;
