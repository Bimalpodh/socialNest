import "./storyViewer.css";

const StoryViewer = ({ story, onClose }) => {
  return (
    <div className="story-viewer">
      <div className="overlay" onClick={onClose}></div>
      <div className="story-content">
        {story.mediaUrl.endsWith("mp4") ? (
          <video
            className="videoContainer"
            src={story.mediaUrl}
            onClick={(e) => {
              if (e.target.paused) {
                e.target.play();
              } else {
                e.target.pause();
              }
            }}
          ></video>
        ) : (
          <img className="imgContainer" src={story.mediaUrl} alt="Story" />
        )}
      </div>
    </div>
  );
};

export default StoryViewer;
