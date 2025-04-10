import {
  arrayRemove,
  arrayUnion,
  doc,
  getDoc,
  onSnapshot,
  updateDoc,
} from "firebase/firestore";
import React, { useEffect, useState } from "react";
import { auth, db } from "../../Utils/firebase";
import { onAuthStateChanged } from "firebase/auth";
import "./friendsReq.css";

export default function FriendsReq({ onFriendAccepted }) {
  const [friendsReq, setFriendsReq] = useState([]);
  const [profileData, setProfileData] = useState([]);
  const [currentUserId, setCurrentUserId] = useState(null);

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setCurrentUserId(currentUser.uid);
        const userRef = doc(db, "users", currentUser.uid);
        const unsubscribeSnap = onSnapshot(userRef, (snapshot) => {
          const userData = snapshot.data();
          setFriendsReq(userData?.friendRequests || []);
        });
        return () => unsubscribeSnap();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  // Fetch user data for all friend requests
  useEffect(() => {
    const fetchRequesters = async () => {
      const userList = await Promise.all(
        friendsReq.map(async (uid) => {
          const userRef = doc(db, "users", uid);
          const userSnap = await getDoc(userRef);
          return userSnap.exists() ? { id: userSnap.id, ...userSnap.data() } : null;
        })
      );
      const validProfiles = userList.filter((u) => u !== null);
      setProfileData(validProfiles);
    };

    if (friendsReq.length > 0) {
      fetchRequesters();
    } else {
      setProfileData([]); // clear if no requests
    }
  }, [friendsReq]);

  const handleAccept = async (requesterId) => {
    if (!currentUserId) return;

    try {
      const currentUserRef = doc(db, "users", currentUserId);
      const requesterRef = doc(db, "users", requesterId);

      // 1. Add each other as friends
      await updateDoc(currentUserRef, {
        friends: arrayUnion(requesterId),
        friendRequests: arrayRemove(requesterId),
        followers: arrayUnion(requesterId),
      });

      await updateDoc(requesterRef, {
        friends: arrayUnion(currentUserId),
        sentRequests: arrayRemove(currentUserId),
        following: arrayUnion(currentUserId),
      });

      if (onFriendAccepted) onFriendAccepted(); // optional callback to refresh profile
    } catch (error) {
      console.error("Error accepting friend request:", error);
    }
  };

  return (
    <div className="RequestList">
      <div className="List">
        {profileData.map((p) => (
          <div className="ll" key={p.id}>
            <div>{p.displayName}</div>
            <button onClick={() => handleAccept(p.id)}>Accept</button>
          </div>
        ))}
      </div>
    </div>
  );
}
