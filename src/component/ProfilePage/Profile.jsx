import "../ProfilePage/profile.css";
import Header from "../HomePage/Header";
import { Link } from "react-router";
import { useEffect, useState } from "preact/hooks";
import {  db } from "../Utils/firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import Comments from "../comment/Comments";
import { useSelector } from "react-redux";

const Profile = () => {
  const [profileData, setProfileData] = useState({});
  const [posts, setPosts] = useState([]);
  const [friendRequests, setFriendRequests] = useState([]);
  const [friends, setFriends] = useState([]);
  const [selectedType, setSelectedType] = useState("All"); 
  const [selectedPost, setSelectedPost] = useState(null);
  const currentUser = useSelector((store) => store.user);

  useEffect(() => {
    if (currentUser) {
      fetchProfileData(currentUser.uid);
      fetchFriendRequests(currentUser.uid);
      fetchFriends(currentUser.uid);
      fetchUserPosts(currentUser.uid);
    }
  }, [currentUser]);

  // Fetch profile data
  const fetchProfileData = async (userId) => {
    try {
      const userRef = doc(db, "users", userId);      
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setProfileData(userSnap.data());
        console.log(userSnap.data());
        
      }
    } catch (error) {
      console.error("Error fetching profile data:", error);
    }
  };

  // Fetch user's posts
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

  // Fetch friend requests
  const fetchFriendRequests = async (userId) => {
    try {
      const reqRef = collection(db, "friendReq");
      const reqSnap = await getDocs(reqRef);

      const requests = await Promise.all(
        reqSnap.docs.map(async (docSnap) => {
          const reqData = docSnap.data();
          if (reqData.receiverId !== userId) return null;

          // Fetch sender's profile details
          const senderRef = doc(db, "users", reqData.senderId);
          const senderSnap = await getDoc(senderRef);
          const senderData = senderSnap.exists() ? senderSnap.data() : {};

          return {
            id: docSnap.id,
            senderId: reqData.senderId,
            senderName: senderData.displayName || "Unknown",
            senderPhoto: senderData.photoURL || "default-profile.png",
          };
        })
      );

      setFriendRequests(requests.filter(Boolean));
    } catch (error) {
      console.error("Error fetching friend requests:", error);
    }
  };

  // Fetch friends list
  const fetchFriends = async (userId) => {
    try {
      const friendsRef = doc(db, "friends", userId);
      const friendsDoc = await getDoc(friendsRef);

      if (friendsDoc.exists()) {
        setFriends(friendsDoc.data().friends || []);
      }
    } catch (error) {
      console.error("Error fetching friends list:", error);
    }
  };

  // Accept friend request
  const acceptFriendRequest = async (request) => {
    if (!currentUser) return;
    const senderId = request.senderId;
    const receiverId = currentUser.uid;

    const senderFriendRef = doc(db, "friends", senderId);
    const receiverFriendRef = doc(db, "friends", receiverId);

    const senderDoc = await getDoc(senderFriendRef);
    const receiverDoc = await getDoc(receiverFriendRef);

    const senderFriends = senderDoc.exists()
      ? senderDoc.data().friends || []
      : [];
    const receiverFriends = receiverDoc.exists()
      ? receiverDoc.data().friends || []
      : [];

    await setDoc(
      senderFriendRef,
      { friends: [...senderFriends, receiverId] },
      { merge: true }
    );
    await setDoc(
      receiverFriendRef,
      { friends: [...receiverFriends, senderId] },
      { merge: true }
    );

    await deleteDoc(doc(db, "friendReq", request.id));

    setFriendRequests(friendRequests.filter((req) => req.id !== request.id));
    setFriends([...friends, senderId]);
  };

  // Unfollow a friend
  const unfollowFriend = async (friendId) => {
    if (!currentUser) return;

    const userFriendsRef = doc(db, "friends", currentUser.uid);
    const updatedFriends = friends.filter((id) => id !== friendId);
    await updateDoc(userFriendsRef, { friends: updatedFriends });
    setFriends(updatedFriends);
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
                    <span>{posts.length || 0}</span> : Posts{" "}
                  </label>
                </div>
                <div className="ff">
                  <label>
                    <span>{friends.length || 0}</span> : Friends{" "}
                  </label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Display Friend Requests */}
        {friendRequests.length > 0 && (
          <div className="friendRequests">
            <h3>Friend Requests</h3>
            {friendRequests.map((req) => (
              <div key={req.id} className="requestItem">
                <img
                  src={req.senderPhoto}
                  alt="profile"
                  className="friendReqImg"
                />
                <p>{req.senderName} sent you a request</p>
                <button onClick={() => acceptFriendRequest(req)}>Accept</button>
              </div>
            ))}
          </div>
        )}

        {/* Post Type Selector */}
        <div className="postTypes">
          <button className={selectedType === "All" ? "active" : ""} onClick={() => setSelectedType("All")}>All</button>
          <button className={selectedType === "Post" ? "active" : ""} onClick={() => setSelectedType("Post")}>Post</button>
          <button className={selectedType === "Video" ? "active" : ""} onClick={() => setSelectedType("Video")}>Video</button>
        </div>

      
         {/* Display Posts */}
         <div className="view-post">
          {posts
            .filter((p) => selectedType === "All" || (selectedType === "Post" && !p.mediaUrl.endsWith("mp4")) || (selectedType === "Video" && p.mediaUrl.endsWith("mp4")))
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
                {currentUser?.uid === p.userId && (
                  <button className="deletePostBtn" onClick={() => deletePost(p.id)}>X</button>
                )}
              </div>
            ))}
        </div>

        {selectedPost && <Comments postid={selectedPost} onClose={() => setSelectedPost(null)} />}

      </div>
    </div>
  );
};

export default Profile;
