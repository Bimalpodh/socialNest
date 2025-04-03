import { db, auth } from "../Utils/firebase";
import { doc, updateDoc, arrayUnion, addDoc, collection, serverTimestamp } from "firebase/firestore";

export const likeStory = async (storyId, ownerId) => {
  const userId = auth.currentUser.uid;

  // Add like to story
  await updateDoc(doc(db, "stories", storyId), {
    likes: arrayUnion(userId)
  });

  // Send notification
  if (ownerId !== userId) {
    await addDoc(collection(db, "notifications"), {
      receiverId: ownerId,
      senderId: userId,
      type: "story_like",
      storyId,
      timestamp: serverTimestamp(),
      read: false
    });
  }
};
