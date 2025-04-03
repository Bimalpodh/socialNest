import { useState, useEffect } from "preact/hooks";
import { auth, db } from "../Utils/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import uploadStory from "../storyUpload/uploadStory";
import StoryViewer from "./StoryViewer"; // Component for viewing stories
import "./story.css";

const Story = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedStory, setSelectedStory] = useState(null);

  const handleUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLoading(true); // Show loading spinner
    await uploadStory(file); // Upload the story
    setLoading(false); // Hide loading spinner
  };

  // Fetch Stories
  useEffect(() => {
    const fetchStories = async () => {
      try {
        const q = query(
          collection(db, "stories"),
          where("createdAt", ">", new Date(Date.now() - 24 * 60 * 60 * 1000)) // Fetch stories from last 24 hours
        );
        const querySnapshot = await getDocs(q);
        const storiesArray = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setStories(storiesArray);
      } catch (error) {
        console.error("Error fetching stories:", error);
      }
    };

    fetchStories();
  }, [loading]); // Refetch when a new story is uploaded

  return (
    <div className="story-container">
      <div className="main">
        <div className="uploadStoryContainer">
          <div className="upload-story">
            <label className="storyAdd" htmlFor="story-upload">
              {loading ? <div className="loading-spinner"></div> : "+"}{" "}
              {/* Show spinner when uploading */}
            </label>
            <input
              id="story-upload"
              type="file"
              onChange={handleUpload}
              hidden
            />
          </div>
          {/* <div className="myStory">
            {stories.map((story, index) => (
              <div
                key={story.id}
                className="story-item"
                onClick={() => setSelectedStory(story)}
              >
                <div className="story-indicator">
                  {story.userId === auth.currentUser.uid ? (
                    <div className="green-circle"></div> // Green circle for uploaded stories
                  ) : null}
                </div>
                {story.mediaUrl.endsWith("mp4") ? (
                  <>
                    <video src={story.mediaUrl}></video>
                    <div>{index === 0 ? "You" : story?.userName}</div>
                  </>
                ) : (
                  <>
                    <img
                      src={story.mediaUrl}
                      alt="Story"
                      className="story-img"
                    />
                    <div>{story?.userName}</div>
                  </>
                )}
              </div>
            ))}
          </div> */}
        </div>

        {/* Display Stories */}
        <div className="story-list">
          {stories.map((story, index) => (
            <div
              key={story.id}
              className="story-item"
              onClick={() => setSelectedStory(story)}
            >
              <div className="story-indicator">
                {story.userId === auth.currentUser.uid ? (
                  <div className="green-circle"></div> // Green circle for uploaded stories
                ) : null}
              </div>
              {story.mediaUrl.endsWith("mp4") ? (
                <>
                  <video src={story.mediaUrl}></video>
                  <div>{index === 0 ? "You" : story?.userName}</div>
                </>
              ) : (
                <>
                  <img src={story.mediaUrl} alt="Story" className="story-img" />
                  <div>{story?.userName}</div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>
      {/* Full-screen story viewer */}
      {selectedStory && (
        <StoryViewer
          story={selectedStory}
          onClose={() => setSelectedStory(null)}
        />
      )}
    </div>
  );
};

export default Story;
