import "./header.css";
import { useDispatch, useSelector } from "react-redux";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { auth, db } from "../Utils/firebase";
import { addUser, removeUser } from "../ReduxStore/userSlice";
import { collection, query, where, getDocs } from "firebase/firestore";

import Notification from "../Notification/Notification";
import { toggleNotificationBar } from "../ReduxStore/notificationSlice";

// Import icons from local assets
import homeIcon from "../../assets/image/home1.png";
import chatIcon from "../../assets/image/message.png";
import newPostIcon from "../../assets/image/add-button.png";
import settingIcon from "../../assets/image/setting1.png";
import profileIcon from "../../assets/image/user1.png";
import notificationIcon from "../../assets/image/notification-bell.png";
import defaultProfilePic from "../../assets/image/user1.png"; // Default profile pic

const Header = ({ popHandling }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const user = useSelector((store) => store.user);
  const allUsers = useSelector((store) => store.allUsers);
  const [profilePhoto, setProfilePhoto] = useState(defaultProfilePic);


  // Find current user's profile photo from allUsers
  useEffect(() => {
    if (user?.uid && allUsers?.length > 0) {
      const currentUser = allUsers.find((u) => u.uid === user.uid);
      if (currentUser?.photoURL) {
        setProfilePhoto(currentUser.photoURL);
      }
    }
  }, [user, allUsers]);

  const handleSignOut = () => {
    signOut(auth)
      .then(() => {
        dispatch(removeUser());
        navigate("/");
      })
      .catch(() => {
        navigate("/error");
      });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        console.log("Firebase User:", user);
        dispatch(
          addUser({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL || defaultProfilePic,
          })
        );

        // Fetch updated profile picture from Firestore
        try {
          const usersRef = collection(db, "users"); // Firestore collection
          const q = query(usersRef, where("uid", "==", user.uid));
          const querySnapshot = await getDocs(q);
          if (!querySnapshot.empty) {
            const userData = querySnapshot.docs[0].data();
            setProfilePhoto(userData.photoURL || defaultProfilePic);
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      } else {
        dispatch(removeUser());
      }
    });

    return () => unsubscribe();
  }, [dispatch]);

  return (
    <div className="Header">
      <div className="logDiv">
        <div>
          <Link to="/profile">
            <img src={profilePhoto} alt="Profile" />
          </Link>
          <p className="logBtn" onClick={handleSignOut}>Log Out</p>
        </div>
        <div className="headerProfile">
          <p className="userName">{user?.displayName}</p>
        </div>
      </div>

      <ul className="header-element">
        <div className="bar">
          <Link className="link" to="/home">
            <img src={homeIcon} className="nav-icon" alt="Home" />
            <span className="nav-name">Home</span>
          </Link>
        </div>

        <div className="bar">
          <Link className="link" to="/chat">
            <img src={chatIcon} className="nav-icon" alt="Message" />
            <span className="nav-name">Message</span>
          </Link>
        </div>

        {location.pathname === "/home" && (
          <div className="bar">
            <Link className="link">
              <img src={newPostIcon} className="nav-icon" onClick={popHandling} alt="Create" />
              <span className="nav-name" onClick={popHandling}>Create</span>
            </Link>
          </div>
        )}

        <div className="bar">
          <div className="link" onClick={() => dispatch(toggleNotificationBar())}>
            <img src={notificationIcon} className="nav-icon" alt="Notifications" />
            <span className="nav-name">Notifications</span>
          </div>
        </div>

        <div className="bar">
          <Link className="link" to="/profile">
            <img src={profileIcon} className="nav-icon" alt="Profile" />
            <span className="nav-name">Profile</span>
          </Link>
        </div>

        <div className="bar">
          <Link className="link" to="/setting">
            <img src={settingIcon} className="nav-icon" alt="Settings" />
            <span className="nav-name">Settings</span>
          </Link>
        </div>
      </ul>

      <Notification />
    </div>
  );
};

export default Header;
