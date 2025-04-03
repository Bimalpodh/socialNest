import { db, auth } from "../Utils/firebase";
import { collection, query, where, getDocs, orderBy } from "firebase/firestore";
import { useEffect, useState } from "react";

const Stories = () => {
  const [stories, setStories] = useState([]);

  useEffect(() => {
    const fetchStories = async () => {
      if (!auth.currentUser) return;

      try {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

        const q = query(
          collection(db, "stories"),
          orderBy("createdAt", "desc"), // First orderBy
          where("createdAt", ">", oneDayAgo) // Then where
        );

        const snapshot = await getDocs(q);
        const fetchedStories = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        setStories(fetchedStories);
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };

    fetchStories();
  }, []);

  return (
    <div className="story-container">
      {stories.map((story) => (
        <div key={story.id} className="story">
          {story.mediaUrl.endsWith(".mp4") ? (
            <video src={story.mediaUrl} controls />
          ) : (
            <img src={story.mediaUrl} alt="Story" />
          )}
        </div>
      ))}
    </div>
  );
};

export default Stories;
