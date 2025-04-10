import "../ProfilePage/profile.css";
import "../friendsProfile/friendProfile.css"
import Header from "../HomePage/Header";
import { Link, useLocation } from "react-router";
import { useEffect, useState } from "preact/hooks";
import { auth, db } from "../Utils/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  deleteDoc,
  query,
  where,
  updateDoc,
  arrayUnion,
} from "firebase/firestore";
import Comments from "../comment/Comments";
import { useSelector } from "react-redux";
import FollowListModal from "../Popup/FollowAndFollowingList/FollowListModel";

const Profile = () => {
  const [profileData, setProfileData] = useState({});
  const [posts, setPosts] = useState([]);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [selectedType, setSelectedType] = useState("All");
  const [selectedPost, setSelectedPost] = useState(null);
  const [showFollowModal, setShowFollowModal] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalUserIds, setModalUserIds] = useState([]);
  const location = useLocation();
  const { friendsId } = location.state || {};
  const currentUser = useSelector((store) => store.user);
  const [friendCheck, setFriendCheck] = useState([]);
  const [isFriend, setIsFriend] = useState(false);

  useEffect(() => {
    if (currentUser && friendsId) {
      fetchProfileData(friendsId);
      fetchUserPosts(friendsId);
      fetchFriend();
    }
  }, [currentUser, friendsId]);

  const fetchProfileData = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const data = userSnap.data();
        setProfileData(data);
        setFollowers(data.followers || []);
        setFollowing(data.following || []);
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  const fetchUserPosts = async (userId) => {
    try {
      const postsRef = collection(db, "posts");
      const q = query(postsRef, where("userId", "==", userId));
      const querySnapshot = await getDocs(q);
      const userPosts = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setPosts(userPosts);
    } catch (error) {
      console.error("Error fetching posts:", error);
    }
  };

  const fetchFriend = async () => {
    try {
      const userRef = doc(db, "users", friendsId);
      const userDoc = await getDoc(userRef);
      if (userDoc.exists()) {
        const followers = userDoc.data().followers || [];
        setFriendCheck(followers);
        setIsFriend(followers.includes(auth.currentUser?.uid));
      }
    } catch (error) {
      console.error("Error checking friend status:", error);
    }
  };

  const handleRequest = async () => {
    try {
      const userRef = doc(db, "users", friendsId);
      if (!friendCheck.includes(auth.currentUser.uid)) {
        await updateDoc(userRef, {
          friendRequests: arrayUnion(auth.currentUser?.uid),
        });
      }
    } catch (error) {
      console.error("Error sending friend request:", error);
    }
  };
  const handleUnfriend = async () => {
    try {
      const userRef = doc(db, "users", friendsId);
      const currentUserRef = doc(db, "users", auth.currentUser.uid);

      // Remove current user from friend's followers
      await updateDoc(userRef, {
        followers: (followers || []).filter(
          (id) => id !== auth.currentUser.uid
        ),
      });

      // Remove friend from current user's following
      await updateDoc(currentUserRef, {
        following: (following || []).filter((id) => id !== friendsId),
      });

      // Update UI
      setIsFriend(false);
      fetchFriend(); // Refresh
    } catch (error) {
      console.error("Error unfriending user:", error);
    }
  };

  const openFollowModal = (title, ids) => {
    setModalTitle(title);
    setModalUserIds(ids);
    setShowFollowModal(true);
  };

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
              {isFriend ? (
                <div className="req">
                  <button className="unfriend" onClick={handleUnfriend}>Unfriend</button>
                  <Link to="/chat" state={{ friendId: friendsId }}>
                    <button className="mssg">Message</button>
                  </Link>
                </div>
              ) : (
                <button onClick={handleRequest}>Add Friend</button>
              )}
            </div>

            {/* <button onClick={handleRequest}>
              {friendCheck.includes(auth.currentUser?.uid)
                ? "following"
                : "addFriend"}
            </button> */}
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
            Post
          </button>
          <button
            className={selectedType === "Video" ? "active" : ""}
            onClick={() => setSelectedType("Video")}
          >
            Video
          </button>
        </div>

        {/* Display Posts only if friend */}
        {friendCheck.includes(auth.currentUser?.uid) ? (
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
                    <video
                      className="myVideo"
                      src={p.mediaUrl}
                      controls
                      onClick={() => setSelectedPost(p.id)}
                    ></video>
                  ) : (
                    <img
                      className="myImages"
                      src={p.mediaUrl}
                      alt="User post"
                      onClick={() => setSelectedPost(p.id)}
                    />
                  )}
                </div>
              ))}
          </div>
        ) : (
          <p className="notFriendMsg">You must be friends to view posts.</p>
        )}

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
