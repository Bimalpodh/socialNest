import "../ProfilePage/profile.css";
import Header from "../HomePage/Header";
import { Link } from "react-router";
import { useEffect, useState } from "preact/hooks";
import { db } from "../Utils/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  updateDoc,
  onSnapshot,
} from "firebase/firestore";
import Comments from "../comment/Comments";
import { useSelector } from "react-redux";
import FriendsReq from "../Popup/FriendsReq/FriendsReq";
import FollowListModal from "../Popup/FollowAndFollowingList/FollowListModel";
import { FaEyeDropper } from "react-icons/fa";

const Profile = () => {
  const [profileData, setProfileData] = useState({});
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPost, setSelectedPost] = useState(null);

  const [showFollowModal, setShowFollowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUserIds, setModalUserIds] = useState([]);

  const currentUser = useSelector((store) => store.user);

  useEffect(() => {
    if (currentUser) {
      fetchProfileData(currentUser.uid);
      fetchUserPosts(currentUser.uid);
    }
  }, [currentUser]);

  // Fetch profile data including followers, following, and friends
  const fetchProfileData = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setProfileData(data);
        setFollowers(data.followers || []);
        setFollowing(data.following || []);
        setFriends(data.friends || []);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  // Fetch user's posts
  const fetchUserPosts = (userId) => {
    const postsRef = collection(db, "posts");
    const q = query(postsRef, where("userId", "==", userId));
  
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(userPosts);
    }, (error) => {
      console.error("Error fetching posts in real-time:", error);
    });
  
    return unsubscribe; // for cleanup
  };
  // Delete user's post
  const deletePost = async (postId) => {
    try {
      await deleteDoc(doc(db, "posts", postId));
      setPosts(posts.filter((post) => post.id !== postId));
    } catch (error) {
      console.error("Error deleting post:", error);
    }
  };

  const openFollowModal = (title, ids) => {
    setModalTitle(title);
    setModalUserIds(ids);
    setShowFollowModal(true);
  };
  const handleVisible=async(pid,v)=>{
    const userRef=doc(db,"posts",pid);
    if(v=="visible"){
      await updateDoc(userRef,{
        visibility: "Hide"
      })
    }
    else{
      await updateDoc(userRef,{
        visibility:"visible"
      })
    }
   

  }

  return (
    <div className="profileContainer">
      <div className="header">
        <Header />
      </div>

      <div className="myprofileContainer">
        <div className="myprofile">
          <div className="bg-container">
            <div className="profileImgContainer">
              <img
                className="profileImg"
                src={profileData.photoURL || "default-profile.png"}
              />
            </div>

            <div className="profileDataContainer">
              <div className="profileDataHeader">
                <label>{profileData.displayName}</label>
                <Link to="/setting">
                  <button>Edit Profile</button>
                </Link>
              </div>

              <div className="followContainer">
                <div className="ff">
                  <label>
                    <span>{posts.length}</span> : Posts
                  </label>
                </div>
                <div className="ff">
                  <label
                    onClick={() => openFollowModal("Followers", followers)}
                  >
                    <span>{followers.length}</span> : Followers
                  </label>
                  <label
                    onClick={() => openFollowModal("Following", following)}
                  >
                    <span>{following.length}</span> : Following
                  </label>
                </div>
              </div>
            </div>

            <div className="RequestList">
            <FriendsReq onFriendAccepted={() => fetchProfileData(currentUser.uid)} />

            </div>
          </div>
        </div>

        {/* Post Type Selector */}
        <div className="postTypes">
          <button
            className={selectedType === "All" ? "active" : ""}
            onClick={() => setSelectedType("All")}
          >
            All
          </button>
          <button
            className={selectedType === "Post" ? "active" : ""}
            onClick={() => setSelectedType("Post")}
          >
            Image
          </button>
          <button
            className={selectedType === "Video" ? "active" : ""}
            onClick={() => setSelectedType("Video")}
          >
            Video
          </button>
        </div>

        {/* Display Posts */}
        <div className="view-post">
          {posts
            .filter(
              (p) =>
                selectedType === "All" ||
                (selectedType === "Post" && !p.mediaUrl.endsWith("mp4")) ||
                (selectedType === "Video" && p.mediaUrl.endsWith("mp4"))
            )
            .map((p) => (
              <div
                key={p.id}
                className={p.mediaUrl.endsWith("mp4") ? "vbox" : "imgBox"}
              >
                {p.mediaUrl.endsWith("mp4") ? (
                <div>
                    <video
                    className="myVideo"
                    src={p.mediaUrl}
                    controls
                    onClick={() => setSelectedPost(p.id)}
                  ></video>
                 
                </div>
                ) : (
                  <img
                    className="myImages"
                    src={p.mediaUrl}
                    alt="User post"
                    onClick={() => setSelectedPost(p.id)}
                  />
                )}
                {currentUser?.uid === p.userId && (
                  <div>
                  <button
                    className="deletePostBtn"
                    onClick={() => deletePost(p.id)}
                  >
                    delete
                  </button>
                  <button className="visibility"onClick={()=>{handleVisible(p.id,p.visibility)}}>{p.visibility == "visible" ? "visible" :"Hide"}</button></div>
                )}
              </div>
            ))}
        </div>

        {selectedPost && (
          <Comments
            postid={selectedPost}
            onClose={() => setSelectedPost(null)}
          />
        )}
      </div>
      {showFollowModal && (
        <FollowListModal
          title={modalTitle}
          userIds={modalUserIds}
          onClose={() => setShowFollowModal(false)}
        />
      )}
    </div>
  );
};

export default Profile;
