import { useEffect, useState } from "preact/hooks";
import { useSelector } from "react-redux";
import { auth, db } from "../Utils/firebase";
import { doc, collection, getDocs, getDoc, updateDoc, arrayUnion, onSnapshot, query, orderBy } from "firebase/firestore";
import "./post.css";
import Comments from "../comment/Comments";
import defaultProfilePic from "../../assets/image/user1.png";




const Post = () => {
  const currentUser = useSelector((store) => store.allUser);
  const [posts, setPosts] = useState([]);
  const [commentBox, setCommentBox] = useState(false);
  const [CpostId, setCPostId] = useState(null);
  const [selectedType, setSelectedType] = useState("All"); 
  const [profilePhoto, setProfilePhoto] = useState(defaultProfilePic);
  const allUser =useSelector((store)=>store.allUser);
  const user = useSelector((store) => store.user);
    useEffect(() => {
      if (user?.uid && allUser?.length > 0) {
        const currentUser = allUser.find((u) => u.uid === user.uid);
        if (currentUser?.photoURL) {
          setProfilePhoto(currentUser.photoURL);
        }
      }
    }, [user, allUser]);

    useEffect(() => {
      if (!auth.currentUser) return;
    
      const postsRef = collection(db, "posts");
    
      // Optionally order by timestamp descending
      const q = query(postsRef, orderBy("timestamp", "desc"));
    
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const postsArray = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })).filter(
          (post) =>
            post.visibility === "visible" ||
            post.userId === auth.currentUser.uid ||
            post.accountType === "public" ||
            user.following.includes(post.userId)
        );
    
        setPosts(postsArray);
      }, (error) => {
        console.error("Error fetching real-time posts:", error);
      });
    
      return () => unsubscribe();
    }, [user.following]);

  const handleLike = async (postId) => {
    if (!auth.currentUser) return;
    
    const postRef = doc(db, "posts", postId);
    const postDoc = await getDoc(postRef);

    if (!postDoc.exists()) return;

    const postData = postDoc.data();
    const likes = postData.likes || [];
    const userId = auth.currentUser.uid;

    const userLiked = likes.some((like) => like.userId === userId);
    const updatedLikes = userLiked
      ? likes.filter((like) => like.userId !== userId) // Remove like
      : [...likes, { userId, timestamp: new Date().toISOString() }]; // Add like

    await updateDoc(postRef, { likes: updatedLikes });

    // Update local state instantly
    setPosts((prevPosts) =>
      prevPosts.map((p) => (p.id === postId ? { ...p, likes: updatedLikes } : p))
    );
  };

  const toggleCommentBox = (p) => {
    setCommentBox(true);
    setCPostId(p);
  };

  const closeCommentBox = () => {
    setCommentBox(false);
    setCPostId(null);
  };

  // Filter Posts Based on Selected Type
  const filteredPosts = posts.filter((p) => {
    if (selectedType === "All") return true;
    if (selectedType === "Follower") return p.userId in currentUser.followers;
    if (selectedType === "Following") return p.userId in currentUser.following;
    if (selectedType === "Popular") return (p.likes?.length || 0) > 10;
    return false;
  });

  const handleCollection=async(pid)=>{
    const userRef=doc(db,"users",auth.currentUser.uid);
    await updateDoc(userRef,{
      myCollection: arrayUnion(pid)
    })

  }

  return (
    <div className="contain-cart">
      {commentBox && <Comments postid={CpostId} onClose={closeCommentBox} />}

      <div className="containt">
        {/* Post Type Selector */}
        <div className="types">
          <ul className="type">
            {["All", "Follower", "Following", "Popular"].map((type) => (
              <li
                key={type}
                className={selectedType === type ? "active" : ""}
                onClick={() => setSelectedType(type)}
              >
                {type}
              </li>
            ))}
          </ul>
        </div>

        {/* Display Posts */}
        {filteredPosts.map((p) => (
          <div key={p.id} className="post-box">
            <div className="user-dl">
              <img
                src={p.photoURL}
                className="user-profile"
                alt="User profile"
              />
              <div className="user-name">{p?.userName}</div>
            </div>

            <div className="pp">
              <div className="post">
                {p.mediaUrl.endsWith("mp4") ? (
                  <video
                    src={p.mediaUrl}
                    onClick={(e) => (e.target.paused ? e.target.play() : e.target.pause())}
                  />
                ) : (
                  <img src={p.mediaUrl} alt="Post media" />
                )}
              </div>

              {/* Reaction Section */}
              <div className="reactElement">
                <div>
                  <span className="love" onClick={() => handleLike(p.id)}>
                    {p.likes?.some((like) => like.userId === auth.currentUser?.uid) ? "❤️" : "🤍"}
                  </span>

                  <img
                    className="comment"
                    src="./src/assets/image/comments.png"
                    alt="Comment"
                    onClick={() => toggleCommentBox(p.id)}
                  />

                  <img className="save" src="./src/assets/image/bookmark.png" alt="Save" onClick={()=>handleCollection(p.id)} />
                </div>
                {/* <div className="shareDIv">
                  <img className="share" src="./src/assets/image/share2.png" alt="Share" />
                </div> */}
              </div>

              {/* Post Details */}
              <div className="bottom">
                <p>{p.likes?.length || 0} Likes</p>
                <div className="userDesc">
                  {/* <p className="userName">{p.userName}</p> */}
                  <p>{p.caption}</p>
                </div>
                <div className="latestComment">
                  <p>{p.latestCommenter}</p>
                  <p>{p.latestComment}</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Post;
