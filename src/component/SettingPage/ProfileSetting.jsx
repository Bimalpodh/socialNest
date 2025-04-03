import { useEffect, useState } from "preact/hooks";
import "./ProfileSetting.css";
import { onAuthStateChanged, updateProfile } from "firebase/auth";
import { auth, db } from "../Utils/firebase";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import axios from "axios";
import { IMG_URL } from "../Utils/constant";
import { FaEdit, FaCamera, FaSave, FaTimes } from "react-icons/fa";

const ProfileSetting = () => {
  const [isFormVisible, setFormVisible] = useState(false);
  const [profileData, setProfileData] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [newDisplayName, setNewDisplayName] = useState("");
  const [newUserName, setNewUserName] = useState(""); // Added userName state
  const [newBio, setNewBio] = useState("");
  const [loading, setLoading] = useState(false);

  // Toggle form visibility
  const toggleFormVisibility = () => {
    setFormVisible(!isFormVisible);
  };

  // Fetch user profile data
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const userdata = await getDoc(userRef);
          if (userdata.exists()) {
            const userData = userdata.data();
            setProfileData(userData);
            setNewDisplayName(userData.displayName || "");
            setNewUserName(userData.userName || ""); // Set userName
            setNewBio(userData.bio || "");
          }
        } catch (error) {
          console.log("Error fetching user data:", error);
        }
      }
    });

    return () => unsubscribe();
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
      await updateDoc(userRef, { displayName: newDisplayName, userName: newUserName, bio: newBio });

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

  return (
    <div className="profileSettingContainer">
      <div className="ProfileHeader">
        <h3>Edit Profile</h3>
        <button onClick={toggleFormVisibility}>
          <FaEdit /> Edit
        </button>
      </div>

      <div className="User-Detail">
        <div className="user-d">
          <div className="profile-img-wrapper">
            <img src={profileData.photoURL || "/default-avatar.png"} alt="Profile" />
            <label htmlFor="fileInput" className="camera-icon">
              <FaCamera />
            </label>
            <input type="file" id="fileInput" onChange={handleFileChange} hidden />
          </div>

          <div className="userName">
            <div className="display-name">{profileData.displayName}</div>
            <div className="profile-name">@{profileData.userName || "Username"}</div>
            <p className="bio">{profileData.bio || "No bio yet."}</p>
          </div>
        </div>

        <button className="changeProfileImg-btn" onClick={handleUpload} disabled={loading}>
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
              <button className="submit" type="button" onClick={handleSave} disabled={loading}>
                <FaSave /> Save
              </button>
              <button className="cancel" type="button" onClick={toggleFormVisibility}>
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
