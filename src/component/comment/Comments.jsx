import React, { useEffect, useState } from "react";
import "../comment/Comments.css";
import { db } from "../Utils/firebase";
import { useSelector } from "react-redux";
import { getDoc, doc, updateDoc } from "firebase/firestore";

const Comments = ({ postid, onClose }) => {
  const currentUser = useSelector((store) => store.user);
  const [pData, setPData] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    const fetchPost = async () => {
      if (!postid || !currentUser) return;

      try {
        const postRef = doc(db, "posts", postid);
        const postDoc = await getDoc(postRef);

        if (!postDoc.exists()) {
          console.log("Post does not exist.");
          return;
        }

        const postData = postDoc.data();
        setPData(postData);
        setComments(postData.comments || []);
      } catch (error) {
        console.log("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [postid, currentUser]);

  const handleCommentSubmit = async () => {
    if (!newComment.trim()) return; // Prevent empty comments

    const newCommentData = {
      userName: currentUser?.displayName || "Anonymous",
      text: newComment,
      timestamp: new Date().toISOString(),
    };

    try {
      const postRef = doc(db, "posts", postid);
      const updatedComments = [...comments, newCommentData];

      await updateDoc(postRef, { comments: updatedComments });
      setComments(updatedComments); // Update local state
      setNewComment(""); // Clear input
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  const handleDeleteComment = async (comment) => {
    if (!currentUser) return;

    try {
      const postRef = doc(db, "posts", postid);

      await updateDoc(postRef, {
        comments: comments.filter((c) => c !== comment),
      });

      setComments(comments.filter((c) => c !== comment));
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  return (
    <div className="commentBoxContainer">
      <button className="closeButton" onClick={onClose}>
        ✖
      </button>

      <div className="postContainer">
        {pData?.mediaUrl ? (
          pData.mediaUrl.endsWith(".mp4") ? (
            <video
              className="media"
              src={pData.mediaUrl}
              controls
              autoPlay
              loop
            />
          ) : (
            <img className="media" src={pData.mediaUrl} alt="Post" />
          )
        ) : (
          <p>Loading media...</p>
        )}
      </div>

      <div className="commentSection">
        <h3>Comments</h3>
        {comments.length > 0 ? (
          comments.map((comment, index) => (
            <div key={index} className="commentItem">
              <label className="userName">{comment.userName}</label>
              <p className="comment">{comment.text}</p>

              {/* Show delete button only for the comment owner */}
              {comment.userId === currentUser?.id && (
                <button
                  className="deleteBtn"
                  onClick={() => handleDeleteComment(comment)}
                >
                  Delete
                </button>
              )}
            </div>
          ))
        ) : (
          <p>No comments yet.</p>
        )}

        <div className="commentInput">
          <input
            type="text"
            placeholder="Write a comment..."
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleCommentSubmit()} // Detect Enter Key
          />
          <button onClick={handleCommentSubmit}>Post</button>
        </div>
      </div>
    </div>
  );
};

export default Comments;
