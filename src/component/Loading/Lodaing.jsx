import "../Loading/loading.css"

const Loading = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Uploading...</p>
    </div>
  );
};

export default Loading;