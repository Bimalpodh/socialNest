import React, { useEffect, useState } from "react";
import "./popUp.css";
import axios from "axios"; // for Cloudinary upload
import { db, auth } from "../Utils/firebase";
import {doc, addDoc, arrayUnion, collection, serverTimestamp, updateDoc } from "firebase/firestore";
import Loading from "../Loading/Lodaing";
import { IMG_URL, VIDEO_URL } from "../Utils/constant";
import { useSelector, useStore } from "react-redux";

const UploadFeedPopup = ({ isOpen, closePopup }) => {
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [caption, setCaption] = useState("");
  const [mention, setMention] = useState("");
  const [taggedUsers, setTaggedUsers] = useState([]);
  const [loading,setLoading]=useState(false);

  const user=useSelector((store)=>store.user)
  console.log(user);
  const currentUserId=user.uid;
  
  // Handle file selection
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
      setPreviewUrl(URL.createObjectURL(file)); // Preview
    }
  };

  // Handle tagging
  const handleTagUser = () => {
    if (mention.trim() && !taggedUsers.includes(mention)) {
      setTaggedUsers([...taggedUsers, mention]);
      setMention(""); // Reset mention input
    }
  };

  const handleRemoveTag = (indexToRemove) => {
    setTaggedUsers(taggedUsers.filter((_, index) => index !== indexToRemove));
  };

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") closePopup();
    };
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [closePopup]);

  // Upload to Cloudinary and save to Firestore
  const handleUploadMediaFeed = async () => {
    if (!selectedFile) return;
    setLoading(true);

    const fileType = selectedFile.type.startsWith("image/")
      ? "image"
      : selectedFile.type.startsWith("video/")
      ? "video"
      : null;

    if (!fileType) {
      alert("Please upload an image or video file.");
      return;
      setLoading(false);
      return;
    }

    const uploadURL= (fileType==="video"?VIDEO_URL : IMG_URL)

    const formData = new FormData();
    formData.append("file", selectedFile);
    formData.append("upload_preset", "user_posts"); 
    formData.append("folder", fileType === "image" ? `cloudinary-upload-socialNest/posts/img/${fileType}` : `cloudinary-upload-socialNest/posts/video/${fileType}`); // Folder path


    try {
      const response = await axios.post(uploadURL,formData);

      const downloadURL = response.data.secure_url;

      const docRef=await addDoc(collection(db, "posts"), {
        mediaUrl: downloadURL,
        mediaType: fileType,
        caption: caption,
        userId: auth.currentUser.uid,
        userName: auth.currentUser.displayName,
        taggedUsers: taggedUsers,
        timestamp: serverTimestamp(),
        likes: [],
        comments: [],
        totalViews: 0,
        photoURL:user.photoURL,
        
        
      });
      const postId=docRef.id;
      const currentUser=auth.currentUser;
      const userRef=doc(db,"users",currentUser.uid)
      await updateDoc(userRef,{
        post: arrayUnion(postId)
      })

      alert("Post uploaded successfully!");
      // Reset
      setSelectedFile(null);
      setPreviewUrl(null);
      setCaption("");
      setTaggedUsers([]);
      closePopup();
    } catch (error) {
      console.error("Error uploading post:", error);
      alert("Failed to upload post.");
      setLoading(false)
    }finally{
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="popup-overlay" onClick={closePopup}>
      <div className="popup-content show" onClick={(e) => e.stopPropagation()}>
        <button className="close-btn" onClick={closePopup}>
          ✖
        </button>

        <h2>Upload a New Post</h2>

        {/* File Input */}

        <label className="upload" htmlFor="input-file" >Creat</label>
        <input
          type="file"
          id="input-file"
          accept="image/*, video/*"
          onChange={handleFileChange}
        />

        {/* Preview */}
        {previewUrl && (
          <div className="preview-container">
            {selectedFile.type.startsWith("image/") ? (
              <img src={previewUrl} alt="Preview" className="preview-image" />
            ) : (
              <video src={previewUrl} controls className="preview-video" />
            )}
          </div>
        )}

        {/* Caption */}
        <textarea
          className="caption-input"
          placeholder="Write a caption..."
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
        />

        {/* Mention */}
        <input
          type="text"
          className="mention-input"
          placeholder="Mention someone (@username)"
          value={mention}
          onChange={(e) => setMention(e.target.value)}
        />
        <button className="tag-btn" onClick={handleTagUser}>
          Tag
        </button>

        {/* Tagged Users */}
        {taggedUsers.length > 0 && (
          <div className="tagged-users">
            <p>Tagged:</p>
            {taggedUsers.map((user, index) => (
              <span key={index} className="tagged-user">
                @{user}
                <button
                  className="remove-tag-btn"
                  onClick={() => handleRemoveTag(index)}
                >
                  ✖
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Upload Button */}
        <button className="upload-btn" onClick={handleUploadMediaFeed}>
         {loading?"uploading": "Upload"}
        </button>
        {loading && <Loading/>}
      </div>
    </div>
  );
};

export default UploadFeedPopup;
