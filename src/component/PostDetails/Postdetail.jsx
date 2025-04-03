import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../Utils/firebase";
import Comments from "../comment/Comments";

const PostDetail = () => {
  const { postId } = useParams();
  const [post, setPost] = useState(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const postRef = doc(db, "posts", postId);
        const postDoc = await getDoc(postRef);
        if (postDoc.exists()) {
          setPost(postDoc.data());
        }
      } catch (error) {
        console.error("Error fetching post:", error);
      }
    };

    fetchPost();
  }, [postId]);

  if (!post) return <p>Loading...</p>;

  return (
    <div className="postDetail">
      <h2>{post.userName}'s Post</h2>
      {post.mediaUrl.endsWith(".mp4") ? (
        <video src={post.mediaUrl} controls />
      ) : (
        <img src={post.mediaUrl} alt="Post" />
      )}
      <p>{post.description}</p>
      <Comments postid={postId} />
    </div>
  );
};

export default PostDetail;
