import "../ProfilePage/profile.css";
import Header from "../HomePage/Header";
import { Link, useLocation } from "react-router";
import { useEffect, useState } from "preact/hooks";
import { auth, db } from "../Utils/firebase";
import {
  arrayUnion,
  arrayRemove,
  doc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

const FriendsProfile = () => {
  const [profileData, setProfileData] = useState(null);
  const [posts, setPosts] = useState([]);
  const [friendStatus, setFriendStatus] = useState("Not Friends");
  const location = useLocation();
  const { friendsId } = location.state || {};

  useEffect(() => {
    if (!friendsId || !auth.currentUser) return;

    const fetchUserData = async () => {
      const userRef = doc(db, "users", friendsId);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setProfileData(userSnap.data());
      }
    };

    const checkFriendStatus = async () => {
      const userRef = doc(db, "users", auth.currentUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        const userData = userSnap.data();
        if (userData.friends?.includes(friendsId)) {
          setFriendStatus("Friends");
        } else if (userData.sentRequests?.includes(friendsId)) {
          setFriendStatus("Request Sent");
        } else {
          setFriendStatus("Not Friends");
        }
      }
    };

    fetchUserData();
    checkFriendStatus();
  }, [friendsId]);

  const handleSendRequest = async () => {
    if (!auth.currentUser || friendStatus !== "Not Friends") return;
    try {
      const userRef = doc(db, "users", friendsId);
      const currentUserRef = doc(db, "users", auth.currentUser.uid);

      await updateDoc(userRef, {
        friendRequests: arrayUnion(auth.currentUser.uid),
      });

      await updateDoc(currentUserRef, {
        sentRequests: arrayUnion(friendsId),
      });

      setFriendStatus("Request Sent");
    } catch (error) {
      console.error("Error sending request:", error);
    }
  };

  const handleCancelRequest = async () => {
    if (!auth.currentUser || friendStatus !== "Request Sent") return;
    try {
      const userRef = doc(db, "users", friendsId);
      const currentUserRef = doc(db, "users", auth.currentUser.uid);

      await updateDoc(userRef, {
        friendRequests: arrayRemove(auth.currentUser.uid),
      });

      await updateDoc(currentUserRef, {
        sentRequests: arrayRemove(friendsId),
      });

      setFriendStatus("Not Friends");
    } catch (error) {
      console.error("Error canceling request:", error);
    }
  };

  const handleUnfriend = async () => {
    if (!auth.currentUser || friendStatus !== "Friends") return;
    try {
      const userRef = doc(db, "users", friendsId);
      const currentUserRef = doc(db, "users", auth.currentUser.uid);

      await updateDoc(userRef, {
        friends: arrayRemove(auth.currentUser.uid),
      });

      await updateDoc(currentUserRef, {
        friends: arrayRemove(friendsId),
      });

      setFriendStatus("Not Friends");
    } catch (error) {
      console.error("Error unfriending:", error);
    }
  };

  if (!profileData) return <p>Loading profile...</p>;

  return (
    <div className="profileContainer">
      <Header />
      <div className="myprofileContainer">
        <div className="myprofile">
          <div className="bg-container">
            <div className="profileImgContainer">
              <img
                className="profileImg"
                src={profileData.photoURL || "default.jpg"}
                alt="Profile"
              />
            </div>
            <div className="profileDataContainer">
              <label>{profileData.displayName}</label>
              <div className="followContainer">
                <div className="ff">
                  <span>{posts.length}</span>
                  <label> Posts </label>
                </div>
                <div className="ff">
                  <span>{profileData.followers?.length || 0}</span>
                  <label> Followers </label>
                </div>
                <div className="ff">
                  <span>{profileData.following?.length || 0}</span>
                  <label> Following</label>
                </div>
              </div>
              <div className="request">
                {friendStatus === "Not Friends" && (
                  <button onClick={handleSendRequest}>
                    Send Friend Request
                  </button>
                )}
                {friendStatus === "Request Sent" && (
                  <button onClick={handleCancelRequest}>Cancel Request</button>
                )}
                {friendStatus === "Friends" && (
                  <button onClick={handleUnfriend}>Unfriend</button>
                )}
                {friendStatus === "Friends" && (
                  <Link to="/chat">
                    <button>Message</button>
                  </Link>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FriendsProfile;
