import { useEffect, useState } from "preact/hooks";
import "./ProfileSetting.css";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth, db } from "../Utils/firebase";
import { collection, doc, getDoc, getDocs, onSnapshot, query, updateDoc, where } from "firebase/firestore";
import axios from "axios";
import { IMG_URL } from "../Utils/constant";
import { FaEdit, FaCamera, FaSave, FaTimes } from "react-icons/fa";
import { useSelector } from "react-redux";

const ProfileSetting = () => {
  const [isFormVisible, setFormVisible] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newUserName, setNewUserName] = useState(""); // Added userName state
  const [newBio, setNewBio] = useState("");
  const [loading, setLoading] = useState(false);
  const user = useSelector((store) => store.user);
  const [accountType,setAccountType]=useState()
  console.log(user);

  // Toggle form visibility
  const toggleFormVisibility = () => {
    setFormVisible(!isFormVisible);
  };

  // Fetch user profile data
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        const userRef = doc(db, "users", currentUser.uid);
  
        // Listen to real-time updates on the user document
        const unsubscribeUser = onSnapshot(userRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setProfileData(userData);
            setNewDisplayName(userData.displayName || "");
            setNewUserName(userData.userName || "");
            setNewBio(userData.bio || "");
          }
        });
  
        // Cleanup Firestore listener
        return () => unsubscribeUser();
      }
    });
  
    // Cleanup Auth listener
    return () => unsubscribeAuth();
  }, []);
  // Handle file selection
  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  // Upload image to Cloudinary & update Firebase
  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select an image first!");
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", "user_posts");

    try {
      const response = await axios.post(IMG_URL, formData);
      const imageUrl = response.data.secure_url;

      // Update Firestore and Firebase Auth
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, { photoURL: imageUrl });
      await updateProfile(auth.currentUser, { photoURL: imageUrl });

      setProfileData((prev) => ({ ...prev, photoURL: imageUrl }));

      if (user?.post?.length) {
        await Promise.all(
          user.post.map(async (m) => {
            const myuser = doc(db, "posts", m);
            await updateDoc(myuser, { photoURL: imageUrl });
          })
        );
      }

      alert("🎉 Profile photo updated successfully!");
    } catch (error) {
      console.error("Error uploading image:", error);
    }
    setLoading(false);
  };

  // Save updated profile data (Display Name, UserName & Bio)
  const handleSave = async () => {
    if (!auth.currentUser) return;

    setLoading(true);
    try {
      const userRef = doc(db, "users", auth.currentUser.uid);
      await updateDoc(userRef, {
        displayName: newDisplayName,
        userName: newUserName,
        bio: newBio,
      });

      await updateProfile(auth.currentUser, { displayName: newDisplayName });

      setProfileData((prev) => ({
        ...prev,
        displayName: newDisplayName,
        userName: newUserName,
        bio: newBio,
      }));
      alert("✅ Profile updated successfully!");
      toggleFormVisibility();
    } catch (error) {
      console.error("Error updating profile:", error);
    }
    setLoading(false);
  };

  const checkUsernameExists = async (username) => {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("userName", "==", username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  };
  const handleaccountType = async () => {
    const userRef = doc(db, "users", auth.currentUser.uid);
    const userSnap = await getDoc(userRef);
    const userData = userSnap.data();
  
    const newAccountType = userData.accountType === "public" ? "private" : "public";
  
    try {
      // Update user profile
      await updateDoc(userRef, {
        accountType: newAccountType,
      });
  
      // Fetch user's posts
      const postsRef = collection(db, "posts");
      const q = query(postsRef, where("userId", "==", auth.currentUser.uid));
      const querySnapshot = await getDocs(q);
  
      // Update all matching posts
      const updatePromises = querySnapshot.docs.map((docSnap) =>
        updateDoc(docSnap.ref, {
          accountType: newAccountType,
        })
      );
  
      await Promise.all(updatePromises);
  
      
    } catch (error) {
      console.error("Error updating account type:", error);
      
    }
  };

  return (
    <div className="profileSettingContainer">
      <div className="ProfileHeader">
        <h3>Edit Profile</h3>
        <button onClick={handleaccountType}>{profileData.accountType ==="public" ? "public":"private"}</button>
        <button onClick={toggleFormVisibility}>
          <FaEdit /> Edit
        </button>
      </div>

      <div className="User-Detail">
        <div className="user-d">
          <div className="profile-img-wrapper">
            <img
              src={profileData.photoURL || "/default-avatar.png"}
              alt="Profile"
            />
            <label htmlFor="fileInput" className="camera-icon">
              <FaCamera />
            </label>
            <input
              type="file"
              id="fileInput"
              onChange={handleFileChange}
              hidden
            />
          </div>

          <div className="userName">
            <div className="display-name">{profileData.displayName}</div>
            <div className="profile-name">
              @{profileData.userName || "Username"}
            </div>
            <p className="bio">{profileData.bio || "No bio yet."}</p>
          </div>
        </div>

        <button
          className="changeProfileImg-btn"
          onClick={handleUpload}
          disabled={loading}
        >
          {loading ? "Uploading..." : "Upload"}
        </button>
      </div>

      {isFormVisible && (
        <div className="offcanvas-form">
          <form className="form">
            <div className="form-group">
              <label>Display Name:</label>
              <input
                type="text"
                value={newDisplayName}
                onChange={(e) => setNewDisplayName(e.target.value)}
                maxLength="20"
              />
            </div>

            <div className="form-group">
              <label>Username:</label>
              <input
                type="text"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                maxLength="20"
                placeholder="Choose a unique username"
              />
            </div>

            <div className="form-group">
              <label>Bio:</label>
              <textarea
                value={newBio}
                onChange={(e) => setNewBio(e.target.value)}
                maxLength="150"
                placeholder="Write something about yourself..."
              />
            </div>

            <div className="btn-container">
              <button
                className="submit"
                type="button"
                onClick={handleSave}
                disabled={loading}
              >
                <FaSave /> Save
              </button>
              <button
                className="cancel"
                type="button"
                onClick={toggleFormVisibility}
              >
                <FaTimes /> Cancel
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

export default ProfileSetting;
