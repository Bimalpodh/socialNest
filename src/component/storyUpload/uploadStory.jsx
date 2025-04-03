import { db, auth } from "../Utils/firebase";
import { collection, addDoc, serverTimestamp, updateDoc, arrayUnion, doc, getDoc } from "firebase/firestore";

const uploadStory = async (file) => {
  if (!auth.currentUser) return;
  console.log(file);

  try {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", "stories_upload"); // Cloudinary preset
    formData.append("folder", `social_nest/Stories/${file.name}`);

    // Upload file to Cloudinary
    const response = await fetch("https://api.cloudinary.com/v1_1/desmliwsi/upload", {
      method: "POST",
      body: formData,
    });

    const data = await response.json();
    const mediaUrl = data.secure_url; // Cloudinary URL

    // Save story details in Firestore
    const docRef = await addDoc(collection(db, "stories"), {
      userId: auth.currentUser.uid,
      mediaUrl:mediaUrl,
      
      cloudinaryId: data.public_id, // Store Cloudinary public ID for deletion
      createdAt: serverTimestamp(),
    });

    const storyId = docRef.id;
    const currentUser = auth.currentUser;
    const userRef = doc(db, "users", currentUser.uid); // Ensure this is the correct collection
    const getData=await getDoc(userRef);
    const userDoc=getData.data();
    console.log(userDoc.displayName);
    

    await updateDoc(userRef, {
      story: arrayUnion(storyId),

    });
    const storyRef=doc(db,"stories",storyId);
    await updateDoc(storyRef,{
      userName:userDoc.displayName,
    })

    console.log("Story uploaded successfully!");
  } catch (error) {
    console.error("Error uploading story:", error);
  }
};

export default uploadStory;
